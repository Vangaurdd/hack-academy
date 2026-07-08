window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS["csrf-ssrf"] = {
  id: "csrf-ssrf",
  order: 5,
  title: "CSRF & SSRF",
  category: "Request Forgery",
  color: "#b388ff",
  description: "Forging requests as someone else, or forcing the server to make them for you.",
  levels: [
    {
      id: "csrf-1",
      title: "CSRF: Forging a Bank Transfer",
      difficulty: "Medium",
      tags: ["CSRF", "Session Riding"],
      type: "webapp",
      briefing: `
        <p><strong>CSRF</strong> exploits the cookie behavior from Foundations: browsers attach
        cookies to a request automatically, regardless of which site the request actually came
        from. If a state-changing
        endpoint has no CSRF token and doesn't check where the request originated, any page on the
        web can silently submit a form to it — and it'll ride on the victim's already-logged-in
        session.</p>
        <p>The transfer form on the left works normally, with a real click. Below it, craft a
        hidden auto-submitting form the way an attacker's page would, and see what happens when a
        logged-in victim merely <em>visits</em> it.</p>`,
      webapp: {
        height: 480,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:15px;}
  h3{font-size:13px;color:#555;margin:20px 0 6px;border-top:1px solid #ddd;padding-top:14px;}
  input{padding:7px;border:1px solid #ccc;border-radius:4px;font-size:13px;width:160px;}
  button{padding:7px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;margin-top:6px;margin-right:8px;}
  pre{background:#14171c;color:#c9d1d9;padding:10px;border-radius:4px;font-size:11px;overflow-x:auto;}
  #log{margin-top:12px;font-size:13px;white-space:pre-wrap;}
  .ok{background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;}
</style></head>
<body>
  <h2>Bank of MegaCorp — signed in as you. Balance: <span id="bal">$1000.00</span></h2>
  <div>
    To account: <input id="to" value="9001-friend" /><br/>
    Amount: <input id="amt" value="50" /><br/>
    <button id="transfer">Transfer</button>
  </div>

  <h3>Attacker page you're building</h3>
  <div>
    Destination account: <input id="atk-to" value="6666-ATTACKER" /><br/>
    Amount: <input id="atk-amt" value="500" /><br/>
    <button id="build">Preview attacker HTML</button>
  </div>
  <pre id="html-preview"></pre>
  <button id="victim">Simulate victim visiting the attacker page</button>

  <div id="log"></div>
<script>
  var balance = 1000;
  function fmt(n) { return '$' + n.toFixed(2); }
  function processTransfer(to, amount, viaCsrf) {
    amount = parseFloat(amount);
    var log = document.getElementById('log');
    if (isNaN(amount) || amount <= 0) { log.textContent = 'Invalid amount.'; return; }
    balance -= amount;
    document.getElementById('bal').textContent = fmt(balance);
    var msg = 'Transferred ' + fmt(amount) + ' to ' + to + '. New balance: ' + fmt(balance) + '.';
    if (viaCsrf && to.trim() === '6666-ATTACKER') {
      log.innerHTML = '<div class="ok">' + msg + '<br>This fired from an auto-submitting form you never clicked. FLAG{csrf_no_token_transfer}</div>';
    } else {
      log.textContent = msg;
    }
  }
  document.getElementById('transfer').addEventListener('click', function () {
    processTransfer(document.getElementById('to').value, document.getElementById('amt').value, false);
  });
  document.getElementById('build').addEventListener('click', function () {
    var to = document.getElementById('atk-to').value;
    var amt = document.getElementById('atk-amt').value;
    document.getElementById('html-preview').textContent =
      '<form id="x" action="/transfer" method="POST">\\n' +
      '  <input type="hidden" name="to" value="' + to + '">\\n' +
      '  <input type="hidden" name="amount" value="' + amt + '">\\n' +
      '</form>\\n' +
      '<script>document.getElementById("x").submit()<\\/script>';
  });
  document.getElementById('victim').addEventListener('click', function () {
    var to = document.getElementById('atk-to').value;
    var amt = document.getElementById('atk-amt').value;
    processTransfer(to, amt, true);
  });
</script>
</body></html>`,
      },
      hints: [
        "The bank endpoint doesn't check for a CSRF token or where the request came from — it just trusts the session cookie.",
        "Set the attacker destination to <code>6666-ATTACKER</code>, preview the HTML to see the shape of the attack, then simulate the visit.",
      ],
      flag: "RkxBR3tjc3JmX25vX3Rva2VuX3RyYW5zZmVyfQ==",
      debrief: `
        <p>In a real attack, that auto-submitting form would sit on any page — a forum post, a
        malicious ad, a link in an email — and would fire the instant a logged-in victim's browser
        rendered it, no click required beyond opening the page.</p>
        <p><strong>Remediation:</strong> anti-CSRF tokens tied to the session and validated
        server-side, the <code>SameSite=Lax</code> or <code>Strict</code> cookie attribute, and
        re-checking <code>Origin</code>/<code>Referer</code> on state-changing requests.</p>`,
    },
    {
      id: "ssrf-1",
      title: "SSRF: Pivoting Through the Server",
      difficulty: "Hard",
      tags: ["SSRF", "Cloud Metadata"],
      type: "webapp",
      briefing: `
        <p><strong>SSRF (Server-Side Request Forgery)</strong> happens when a server fetches a URL
        you supply — a "preview this link" feature, a webhook tester, an image importer — without
        restricting where that fetch can go. The server usually sits inside a private network and
        can reach things you can't reach directly: internal admin panels, databases, and on cloud
        providers, an <strong>instance metadata service</strong> that hands out temporary cloud
        credentials to anything that asks it nicely from inside the network.</p>
        <p>This "link preview" feature fetches whatever URL you give it and shows you the raw
        response. AWS's metadata service famously lives at
        <code>http://169.254.169.254/</code> — try pointing the previewer at it.</p>`,
      webapp: {
        height: 380,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:75%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:13px;}
  button{padding:8px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  pre{margin-top:14px;background:#14171c;color:#c9d1d9;padding:12px;border-radius:4px;font-size:12px;min-height:50px;white-space:pre-wrap;word-break:break-all;}
</style></head>
<body>
  <h2>Link Preview Tool</h2>
  <input id="url" placeholder="https://example.com" autocomplete="off" value="https://example.com" />
  <button id="go">Preview</button>
  <pre id="out">(response body will appear here)</pre>
<script>
  var resources = {
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/': 'app-role',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/app-role':
      '{"AccessKeyId":"AKIAFAKE000000EXAMPLE","SecretAccessKey":"FLAG{ssrf_metadata_leak}","Token":"IQoJb3JpZ2luX2VjEA..."}',
    'https://example.com': '<html><body>Example Domain</body></html>',
    'https://megacorp-shop.test': '<html><body>MegaCorp Shop homepage</body></html>'
  };
  document.getElementById('go').addEventListener('click', function () {
    var url = document.getElementById('url').value.trim().replace(/\\/$/, '');
    var out = document.getElementById('out');
    if (resources[url] !== undefined) { out.textContent = resources[url]; return; }
    if (/^https?:\\/\\//.test(url)) { out.textContent = '(fetched external page — 200 OK, no preview renderer for this content type)'; return; }
    out.textContent = 'Error: could not resolve host.';
  });
</script>
</body></html>`,
      },
      hints: [
        "Cloud instance metadata services listen on the link-local address <code>169.254.169.254</code> and normally aren't reachable from outside the server itself.",
        "First try <code>http://169.254.169.254/latest/meta-data/iam/security-credentials/</code> to list the role name, then fetch that same path with the role name appended.",
      ],
      flag: "RkxBR3tzc3JmX21ldGFkYXRhX2xlYWt9",
      debrief: `
        <p>This two-step chain — list the IAM role, then fetch its temporary credentials — mirrors
        real-world cloud credential theft incidents where an SSRF bug in a public-facing feature
        was pivoted into full access to internal cloud resources. It's why SSRF findings on cloud
        infrastructure are routinely rated critical even when the initial "bug" looks as small as
        an unfiltered link preview.</p>
        <p><strong>Remediation:</strong> allow-list destination hosts/protocols for any
        server-side fetch, block requests to link-local and private IP ranges, and use IMDSv2
        (which requires a session token, not obtainable via a simple GET) on AWS.</p>`,
    },
  ],
};
