window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.recon = {
  id: "recon",
  order: 1,
  title: "Recon & Footprinting",
  category: "Recon",
  color: "#6d8dfc",
  description: "Map the attack surface before you touch a single exploit.",
  levels: [
    {
      id: "recon-1",
      title: "Passive Recon: DNS Never Forgets",
      difficulty: "Easy",
      tags: ["DNS", "WHOIS", "Passive"],
      type: "terminal",
      briefing: `
        <p>Every engagement — and every bug bounty submission — starts before you send a single
        malicious request. <strong>Passive recon</strong> means gathering information without
        touching the target directly: WHOIS records, DNS, certificate transparency logs, cached
        pages. It generates no logs on the target's side and is almost always in scope, even for
        programs with tight rules of engagement.</p>
        <p>Your client this round is <code>megacorp-shop.test</code>. Use <code>whois</code> and
        <code>dig</code> to find out what's publicly known about it. DNS <code>TXT</code> records
        are a classic dumping ground — SPF/DKIM entries, domain-verification tokens, and
        occasionally things an engineer forgot were world-readable.</p>`,
      terminal: {
        promptLabel: "researcher@kali",
        whoami: "researcher",
        banner: "recon-shell v1 — try: whois <domain>, dig <domain> <TYPE>\ntype 'help' for the rest.\n",
        fs: HA_dir_stub(),
        commands: {
          whois(args) {
            const domain = args[0] || "";
            if (domain.replace(/^https?:\/\//, "") !== "megacorp-shop.test") {
              return "No whois server is known for this entry.";
            }
            return [
              "Domain Name: MEGACORP-SHOP.TEST",
              "Registrar: Example Registrar, LLC",
              "Creation Date: 2019-03-11",
              "Registrant Organization: MegaCorp Shop Inc.",
              "Name Server: NS1.MEGACORP-SHOP.TEST",
              "Name Server: NS2.MEGACORP-SHOP.TEST",
              "",
              "(whois rarely hides the interesting stuff — try dig next)",
            ].join("\n");
          },
          dig(args) {
            const type = (args.find((a) => /^(A|MX|TXT|NS|CNAME)$/i.test(a)) || "A").toUpperCase();
            const domain = (args.find((a) => a.includes(".")) || "").replace(/\.$/, "");
            if (domain !== "megacorp-shop.test") return ";; connection timed out; no servers could be reached";
            const records = {
              A: "megacorp-shop.test.\t300\tIN\tA\t203.0.113.44",
              MX: "megacorp-shop.test.\t300\tIN\tMX\t10 mail.megacorp-shop.test.",
              NS: "megacorp-shop.test.\t300\tIN\tNS\tns1.megacorp-shop.test.\nmegacorp-shop.test.\t300\tIN\tNS\tns2.megacorp-shop.test.",
              CNAME: "megacorp-shop.test has no CNAME record (it is not an alias)",
              TXT:
                'megacorp-shop.test.\t300\tIN\tTXT\t"v=spf1 include:_spf.megacorp-shop.test ~all"\n' +
                'megacorp-shop.test.\t300\tIN\tTXT\t"google-site-verification=k29fj3lxamsn"\n' +
                'megacorp-shop.test.\t300\tIN\tTXT\t"staging-note: temp access marker FLAG{passive_recon_dns_txt} - remove before prod launch"',
            };
            return ";; ANSWER SECTION:\n" + (records[type] || "no records of that type");
          },
        },
      },
      hints: [
        "<code>whois</code> tells you who owns a domain. DNS records tell you what it's running — and sometimes what someone forgot was public.",
        "Try <code>dig megacorp-shop.test TXT</code>. TXT records hold SPF/DKIM entries and, occasionally, notes that were never meant to ship.",
      ],
      flag: "RkxBR3twYXNzaXZlX3JlY29uX2Ruc190eHR9",
      debrief: `
        <p>This is a real, recurring finding class: secrets or internal notes committed to public
        DNS TXT records. It costs the target nothing to leak and costs an attacker nothing to
        find. In a real engagement you'd chain this with certificate-transparency search
        (<code>crt.sh</code>) and tools like <code>amass</code> or <code>subfinder</code> to build
        a full subdomain map before ever sending a crafted request.</p>
        <p><strong>Remediation:</strong> treat DNS as public by default. Rotate anything
        accidentally published, and add TXT-record hygiene to pre-launch checklists.</p>`,
    },
    {
      id: "recon-2",
      title: "Dorking for Exposed Documents",
      difficulty: "Easy",
      tags: ["Search Operators", "OSINT"],
      type: "terminal",
      briefing: `
        <p><strong>Search-engine dorking</strong> uses advanced operators to narrow a search
        engine's index down to exactly what you want — instead of crawling a site yourself, you
        let years of someone else's crawling do the work.</p>
        <table class="field-table">
          <tr><th>Operator</th><th>Effect</th></tr>
          <tr><td><code>site:</code></td><td>restrict to one domain</td></tr>
          <tr><td><code>filetype:</code></td><td>restrict to a document type (pdf, xlsx, env…)</td></tr>
          <tr><td><code>intitle:</code></td><td>match words in the page title</td></tr>
          <tr><td><code>inurl:</code></td><td>match words in the URL path</td></tr>
        </table>
        <p>Use the <code>search</code> command to find any indexed PDF documents living on
        <code>megacorp-shop.test</code> — internal documents that were never meant to be linked
        often still get crawled and indexed.</p>`,
      terminal: {
        promptLabel: "researcher@kali",
        banner: "search-shell v1 — try: search <query with operators>\n",
        fs: HA_dir_stub(),
        commands: {
          search(args) {
            const q = args.join(" ").toLowerCase();
            const hasSite = q.includes("site:megacorp-shop.test");
            const hasType = q.includes("filetype:pdf");
            if (hasSite && hasType) {
              return [
                "1 result",
                "",
                '"Q3-internal-runbook.pdf" — megacorp-shop.test/files/ops/',
                "  ...decommission checklist, staging cutover token: FLAG{dork_master_index_of} ...",
              ].join("\n");
            }
            if (hasSite) return "About 1,400 results for megacorp-shop.test. (narrow it further with filetype: — too much noise)";
            return "About 8,920,000,000 results. (dorking works by narrowing scope — try site: and filetype:)";
          },
        },
      },
      hints: [
        "Combine two operators in one query: one to lock the domain, one to lock the file type.",
        "Try: <code>search site:megacorp-shop.test filetype:pdf</code>",
      ],
      flag: "RkxBR3tkb3JrX21hc3Rlcl9pbmRleF9vZn0=",
      debrief: `
        <p>Dorking regularly turns up exposed <code>.env</code> files, backup archives, internal
        wikis, and credential-laden config files that were "unlinked" but still crawlable. The
        same narrowing technique works against GitHub's code search for leaked API keys, and
        against Shodan/Censys for exposed services and default-credential panels.</p>
        <p><strong>Remediation:</strong> <code>robots.txt</code> is not access control — anything
        sensitive needs real authentication, and internal documents should never live on a
        publicly indexable path.</p>`,
    },
    {
      id: "recon-3",
      title: "Content Discovery: The Unlinked Admin Panel",
      difficulty: "Medium",
      tags: ["Brute Force", "Content Discovery"],
      type: "terminal",
      briefing: `
        <p>Not every page is linked from the navigation. <strong>Content discovery</strong> tools
        (<code>gobuster</code>, <code>ffuf</code>, <code>dirsearch</code>) brute-force a wordlist
        of common paths against a target to find pages that exist but aren't advertised —
        forgotten admin panels, backup files, staging routes.</p>
        <p>Run a directory brute force against <code>megacorp-shop.test</code>, then
        <code>curl</code> anything that looks out of place.</p>
        <pre>gobuster dir -u http://megacorp-shop.test -w common.txt</pre>`,
      terminal: {
        promptLabel: "researcher@kali",
        banner: "recon-shell v1 — try: gobuster dir -u <url> -w <wordlist>, then curl <url>\n",
        fs: HA_dir_stub(),
        commands: {
          gobuster(args) {
            const url = args.find((a) => a.startsWith("http")) || "";
            if (!url.includes("megacorp-shop.test")) return "gobuster: error: no target host resolved";
            return [
              "===============================================================",
              "Gobuster v3.6",
              "===============================================================",
              `[+] Url: ${url}`,
              "[+] Wordlist: common.txt",
              "===============================================================",
              "/login                (Status: 200)",
              "/api                  (Status: 200)",
              "/assets               (Status: 301)",
              "/backup               (Status: 403)",
              "/admin-9f3k           (Status: 200)",
              "===============================================================",
            ].join("\n");
          },
          curl(args) {
            const url = args.find((a) => a.startsWith("http")) || args[0] || "";
            const path = url.replace(/^https?:\/\/[^/]+/i, "") || "/";
            const pages = {
              "/": "<html>MegaCorp Shop — Welcome</html>",
              "/login": "<html>Login form</html>",
              "/api": '{"status":"ok","version":"2.3"}',
              "/admin-9f3k": "<!-- legacy admin, unlinked --> Staff Access Panel. token: FLAG{hidden_panel_ff8231}",
            };
            return pages[path] || `curl: (22) The requested URL returned error: 404 ${path}`;
          },
        },
      },
      hints: [
        "Real recon chains tools: brute force finds candidate paths, then you inspect each one by hand.",
        "One of the discovered paths has a 200 status but is never linked from the site. <code>curl</code> it directly.",
      ],
      flag: "RkxBR3toaWRkZW5fcGFuZWxfZmY4MjMxfQ==",
      debrief: `
        <p>"Unlinked" is not "unauthenticated." Forgotten legacy admin panels are a bread-and-butter
        bug bounty finding under broken access control. In real engagements, pair active brute
        force with passive subdomain sources (<code>crt.sh</code>, <code>subfinder</code>,
        <code>amass</code>) — and always throttle requests and stay inside the program's defined
        scope and rate limits.</p>
        <p><strong>Remediation:</strong> every admin surface needs authentication and
        authorization checks regardless of whether it's linked anywhere.</p>`,
    },
  ],
};

function HA_dir_stub() {
  return HA.dir({
    home: HA.dir({ user: HA.dir({ "notes.txt": "Scope: megacorp-shop.test only. Stay in scope.\n" }) }),
  });
}
