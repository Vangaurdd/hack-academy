window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.methodology = {
  id: "methodology",
  order: 7,
  title: "Bug Bounty Methodology",
  category: "Methodology",
  color: "#c9b37a",
  description: "The workflow around the exploits — scope, tools, reporting, and where to go from here.",
  levels: [
    {
      id: "method-1",
      title: "Rules of Engagement & Legal Boundaries",
      difficulty: "Read",
      tags: ["Legal", "Scope"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Everything else in this academy assumes one non-negotiable fact: you have
        <strong>explicit, written authorization</strong> to test the target. Without it, the exact
        same actions you just practiced are computer crime in most jurisdictions (in the US,
        under the Computer Fraud and Abuse Act) — intent to learn doesn't change that.</p>
        <h3>What "authorized" actually means</h3>
        <ul>
          <li>A bug bounty program's published policy, or a signed pentest engagement letter —
          not a verbal "sure, go ahead."</li>
          <li>Testing only assets explicitly listed as <strong>in scope</strong>. Bounty programs
          commonly exclude third-party integrations, specific subdomains, or physical/social
          engineering unless stated otherwise.</li>
          <li>Respecting any rate limits, blackout windows, or "no automated scanning" clauses in
          the program rules.</li>
        </ul>
        <h3>Before you send a single request, check:</h3>
        <ul class="checklist">
          <li>Is this exact asset listed as in-scope, not just "related to the company"?</li>
          <li>Does the program prohibit destructive testing, data exfiltration beyond proof, or
          denial-of-service style traffic?</li>
          <li>Is there a required disclosure timeline or embargo before you can talk about a
          finding publicly?</li>
          <li>If in doubt about whether something is in scope — ask the program before testing it,
          don't test first and ask forgiveness later.</li>
        </ul>
        <p>Programs that follow <strong>safe harbor</strong> language (committing not to pursue
        legal action against good-faith researchers who stay in scope and report responsibly) are
        worth prioritizing, especially early in your career.</p>
      </div>`,
      debrief: "",
    },
    {
      id: "method-2",
      title: "The Recon-to-Report Workflow",
      difficulty: "Read",
      tags: ["Methodology", "Workflow"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Every track in this academy is a stage of the same loop real engagements run. Knowing
        the loop matters more than knowing any single exploit — it's what tells you what to do
        next when nothing obvious is in front of you.</p>
        <ol>
          <li><strong>Scope review</strong> — read the program policy before doing anything else.</li>
          <li><strong>Passive recon</strong> — WHOIS, DNS, certificate transparency
          (<code>crt.sh</code>), the Wayback Machine for old endpoints, search-engine dorking.
          Zero packets sent to the target itself. (Recon track, levels 1–2.)</li>
          <li><strong>Active recon</strong> — subdomain brute force, content discovery, port/service
          scanning. Now you're touching the target, so throttle and stay in scope. (Recon track,
          level 3.)</li>
          <li><strong>Map the attack surface</strong> — every endpoint, parameter, file upload,
          auth boundary, and role. This is where you decide what's worth testing first.</li>
          <li><strong>Test for vulnerabilities</strong> — manually, using automated scanners as
          leads to verify rather than as ground truth. (Injection, XSS, Auth, CSRF/SSRF, Crypto
          tracks.)</li>
          <li><strong>Verify</strong> — reproduce reliably, rule out false positives, confirm real
          impact before writing anything up.</li>
          <li><strong>Assess impact</strong> — what's the actual worst case a real attacker gets?</li>
          <li><strong>Report</strong> — clearly enough that the team can reproduce and fix it on the
          first read. (Methodology, next reading.)</li>
          <li><strong>Retest</strong> — confirm the fix actually closes the issue once it ships.</li>
        </ol>
        <p>Most beginners skip straight to step 5. The recon steps are what turn "I ran a scanner
        and it found nothing" into "I found the one endpoint nobody else tested."</p>
      </div>`,
      debrief: "",
    },
    {
      id: "method-3",
      title: "The Tooling Landscape",
      difficulty: "Read",
      tags: ["Tools"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Tools speed up a workflow you already understand — they don't replace understanding it.
        Everything below automates something you just did by hand in an earlier track.</p>
        <table class="field-table">
          <tr><th>Purpose</th><th>Tools</th><th>Replaces which level</th></tr>
          <tr><td>Intercepting proxy</td><td>Burp Suite, OWASP ZAP</td><td>Manually editing every request — the core tool for everything past recon</td></tr>
          <tr><td>Subdomain enumeration</td><td>subfinder, amass, assetfinder</td><td>Recon L1–L3</td></tr>
          <tr><td>Content discovery</td><td>ffuf, gobuster, dirsearch</td><td>Recon L3</td></tr>
          <tr><td>Port/service scanning</td><td>nmap, naabu</td><td>Recon (active)</td></tr>
          <tr><td>Templated vuln scanning</td><td>nuclei, httpx</td><td>Broad first-pass triage before manual testing</td></tr>
          <tr><td>SQLi automation</td><td>sqlmap</td><td>Injection L1–L2, once you've manually confirmed a parameter is injectable</td></tr>
          <tr><td>API testing</td><td>Postman, Insomnia</td><td>Auth/IDOR testing on JSON APIs</td></tr>
          <tr><td>Always free, always available</td><td>Browser DevTools</td><td>Every track — Network/Application/Console tabs are how you'd really inspect cookies, storage, and requests</td></tr>
        </table>
        <p>A common failure mode: running <code>nuclei</code> or <code>sqlmap</code> blind against
        a target with no manual understanding of what you're looking at. Scanners produce a lot of
        noise and miss anything that requires business logic to recognize — which is most of what
        pays out on bug bounty.</p>
      </div>`,
      debrief: "",
    },
    {
      id: "method-4",
      title: "Writing a Report That Gets Paid",
      difficulty: "Read",
      tags: ["Reporting"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Triage teams reject or downgrade reports far more often for being unclear than for being
        wrong. A report is a technical document written for someone who wasn't there when you found
        the bug and needs to reproduce it exactly.</p>
        <table class="field-table">
          <tr><th>Field</th><th>What goes here</th></tr>
          <tr><td>Title</td><td>Specific: "Reflected XSS in <code>/search?q=</code> via unescaped output" — not "XSS vulnerability found"</td></tr>
          <tr><td>Severity</td><td>Your CVSS estimate or the program's own scale, with the reasoning, not just a label</td></tr>
          <tr><td>Affected asset</td><td>Exact URL/endpoint/parameter</td></tr>
          <tr><td>Description</td><td>What the bug is and why it happens (root cause, not just symptom)</td></tr>
          <tr><td>Steps to reproduce</td><td>Numbered, exact — requests, payloads, screenshots or a short screen recording</td></tr>
          <tr><td>Impact</td><td>What a real attacker gets — "account takeover for any user" beats "XSS" every time</td></tr>
          <tr><td>Proof of concept</td><td>Minimal and non-destructive — proves the bug without causing real damage</td></tr>
          <tr><td>Suggested remediation</td><td>Optional but well-regarded — shows you understand the fix, not just the break</td></tr>
        </table>
        <p>Two habits that matter more than polish:</p>
        <ul class="checklist">
          <li>Minimize harm — never exfiltrate more data than needed to prove impact, never test destructive actions against real user data.</li>
          <li>Respond quickly to triage questions — a report that goes quiet on follow-up questions frequently gets closed as unreproducible.</li>
        </ul>
      </div>`,
      debrief: "",
    },
    {
      id: "method-5",
      title: "Where to Practice for Real",
      difficulty: "Read",
      tags: ["Next Steps", "Disclosure"],
      type: "reading",
      briefing: `<div class="reading">
        <p>This academy's sandboxes are simulated on purpose — a static site can't safely host real
        vulnerable servers for the public. Real practice needs real (but authorized) targets:</p>
        <table class="field-table">
          <tr><th>Platform</th><th>Best for</th></tr>
          <tr><td>PortSwigger Web Security Academy</td><td>Free, matches every vuln class in this
          academy, but against real HTTP traffic and Burp Suite — the natural next step</td></tr>
          <tr><td>OWASP Juice Shop</td><td>A deliberately vulnerable full app to run locally and
          break end-to-end, beyond isolated single bugs</td></tr>
          <tr><td>DVWA / bWAPP</td><td>Classic self-hosted vulnerable apps with adjustable
          difficulty</td></tr>
          <tr><td>TryHackMe / Hack The Box</td><td>Guided rooms and real VM "boxes" — broader
          offensive security beyond web, including networks and Active Directory</td></tr>
          <tr><td>HackerOne, Bugcrowd, Intigriti</td><td>Actual bug bounty programs — read scope
          carefully; start with unpaid Vulnerability Disclosure Programs (VDPs) to build a track
          record</td></tr>
        </table>
        <h3>Responsible disclosure, briefly</h3>
        <ul class="checklist">
          <li>Report privately to the vendor or program first — never disclose publicly before
          they've had a reasonable chance to fix it.</li>
          <li>Stay inside the defined scope, even when you notice something interesting just
          outside it — report it as an out-of-scope observation instead of testing it.</li>
          <li>Access only what's needed to prove a finding, then stop.</li>
          <li>If a program's terms conflict with the law where you live, don't test — some
          programs' "safe harbor" claims don't hold up everywhere.</li>
        </ul>
        <p>The skills from the other six tracks — recon, injection, XSS, access control, request
        forgery, and crypto/client-side bugs — cover the vulnerability classes that make up the
        overwhelming majority of paid bug bounty reports. What's left is time in real targets.</p>
      </div>`,
      debrief: "",
    },
  ],
};
