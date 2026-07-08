window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.auth = {
  id: "auth",
  order: 4,
  title: "Auth & Access Control",
  category: "Auth",
  color: "#3ddc97",
  description: "Broken authorization is the single most common bug bounty finding.",
  levels: [
    {
      id: "auth-1",
      title: "IDOR: Someone Else's Invoice",
      difficulty: "Easy",
      tags: ["IDOR", "Broken Access Control"],
      type: "webapp",
      briefing: `
        <p>An <strong>Insecure Direct Object Reference (IDOR)</strong> happens when an app uses a
        raw identifier — an invoice number, a user ID — to fetch a record, without checking
        whether the requester is actually allowed to see <em>that specific</em> record. You're
        logged in and your invoice is <code>1001</code>. See what else is out there.</p>`,
      webapp: {
        height: 340,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:120px;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  #out{margin-top:16px;font-size:13px;}
  table{border-collapse:collapse;}
  td{padding:4px 10px 4px 0;vertical-align:top;}
</style></head>
<body>
  <h2>Billing — View Invoice</h2>
  <p style="font-size:13px;color:#555;">Logged in as account #1001.</p>
  <input id="id" value="1001" /> <button id="go">View invoice</button>
  <div id="out"></div>
<script>
  var invoices = {
    '1001': { owner: 'you', amount: '$412.00', memo: 'Q2 hosting renewal' },
    '1002': { owner: 'r.chen', amount: '$1,890.00', memo: 'Confidential contract renewal — access marker FLAG{idor_invoice_1002}' }
  };
  document.getElementById('go').addEventListener('click', function () {
    var id = document.getElementById('id').value.trim();
    var inv = invoices[id];
    var out = document.getElementById('out');
    if (!inv) { out.textContent = 'No invoice #' + id + '.'; return; }
    out.innerHTML = '<table>' +
      '<tr><td>Invoice</td><td>#' + id + '</td></tr>' +
      '<tr><td>Owner</td><td>' + inv.owner + '</td></tr>' +
      '<tr><td>Amount</td><td>' + inv.amount + '</td></tr>' +
      '<tr><td>Memo</td><td>' + inv.memo + '</td></tr></table>';
  });
</script>
</body></html>`,
      },
      hints: [
        "The app never checks that invoice #1001 belongs to you — it just looks up whatever ID you send.",
        "Change the ID field to a nearby number, like <code>1002</code>.",
      ],
      flag: "RkxBR3tpZG9yX2ludm9pY2VfMTAwMn0=",
      debrief: `
        <p>IDOR is consistently one of the highest-volume bug classes on bug bounty platforms
        because it's cheap to find (just increment an ID) and easy to introduce (it's what happens
        by default if you forget an authorization check). It applies to invoices, orders, messages,
        API objects — anywhere a resource is looked up by an ID a client can see or guess.</p>
        <p><strong>Remediation:</strong> every object lookup needs an accompanying authorization
        check — "does the current session own or have grants on this specific record?" — not just
        "is the session logged in at all."</p>`,
    },
    {
      id: "auth-2",
      title: "JWT Tampering: alg=none",
      difficulty: "Hard",
      tags: ["JWT", "Auth Bypass"],
      type: "webapp",
      briefing: `
        <p>A JWT ("JSON Web Token") is built from the JSON you learned in Foundations. It's three
        base64url segments — <code>header.payload.signature</code> — where the header and payload
        are just JSON objects, encoded so they're safe to put in a URL, then glued together with
        dots. It's
        only trustworthy if the verifier actually checks the signature against an algorithm it
        expects. A long-running, real vulnerability class in JWT libraries: if the token's header
        claims <code>"alg":"none"</code>, some verifiers skip signature checking entirely, because
        the spec technically allows an unsecured JWT and the library didn't pin its accepted
        algorithm list.</p>
        <p>Your current token has <code>role: "user"</code>. Craft a new one that the verifier
        will accept as <code>role: "admin"</code>.</p>`,
      webapp: {
        height: 520,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:15px;}
  h3{font-size:13px;color:#555;margin:18px 0 6px;}
  input,textarea{width:100%;box-sizing:border-box;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:12px;font-family:monospace;}
  button{margin-top:8px;padding:7px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  #out{margin-top:14px;font-size:13px;}
  .ok{background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;}
  .bad{color:#9c1c1c;}
</style></head>
<body>
  <h2>Session Verifier</h2>
  <h3>Your current token (role: user)</h3>
  <textarea id="current" rows="2" readonly></textarea>

  <h3>Craft a token</h3>
  Header JSON:
  <input id="hdr" value='{"alg":"HS256","typ":"JWT"}' />
  Payload JSON:
  <input id="pl" value='{"sub":"alice","role":"user"}' />
  <button id="build">Build token</button>
  <textarea id="crafted" rows="2" placeholder="built token appears here — or paste your own"></textarea>

  <h3>&nbsp;</h3>
  <button id="check">Submit to /admin</button>
  <div id="out"></div>
<script>
  function b64url(str) {
    return btoa(unescape(encodeURIComponent(str))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
  }
  function b64urlDecode(str) {
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
  }
  var ORIGINAL = b64url('{"alg":"HS256","typ":"JWT"}') + '.' + b64url('{"sub":"alice","role":"user"}') + '.origsignature000';
  document.getElementById('current').value = ORIGINAL;

  function verify(token) {
    var parts = token.split('.');
    if (parts.length < 2) return null;
    var header, payload;
    try {
      header = JSON.parse(b64urlDecode(parts[0]));
      payload = JSON.parse(b64urlDecode(parts[1]));
    } catch (e) { return null; }
    if (String(header.alg).toLowerCase() === 'none') return payload;
    if (token === ORIGINAL) return payload;
    return null;
  }

  document.getElementById('build').addEventListener('click', function () {
    var hdr = document.getElementById('hdr').value;
    var pl = document.getElementById('pl').value;
    try {
      var token = b64url(hdr) + '.' + b64url(pl) + '.';
      document.getElementById('crafted').value = token;
    } catch (e) {
      document.getElementById('crafted').value = 'error building token: ' + e.message;
    }
  });

  document.getElementById('check').addEventListener('click', function () {
    var token = document.getElementById('crafted').value.trim() || document.getElementById('current').value;
    var payload = verify(token);
    var out = document.getElementById('out');
    if (payload && payload.role === 'admin') {
      out.innerHTML = '<div class="ok">Access granted to /admin as "' + payload.sub + '". FLAG{jwt_alg_none_admin}</div>';
    } else if (payload) {
      out.innerHTML = '<div class="bad">Token accepted, but role "' + payload.role + '" is not authorized for /admin.</div>';
    } else {
      out.innerHTML = '<div class="bad">Invalid token — signature check failed.</div>';
    }
  });
</script>
</body></html>`,
      },
      hints: [
        "The signature on an HS256 token can't be forged without the server's secret — but what if the header says there's no signature to check?",
        "Set Header JSON's <code>alg</code> to <code>none</code>, set Payload JSON's <code>role</code> to <code>admin</code>, click Build token, then Submit.",
      ],
      flag: "RkxBR3tqd3RfYWxnX25vbmVfYWRtaW59",
      debrief: `
        <p>This mirrors real historical CVEs in JWT libraries (and any hand-rolled verifier) that
        read the algorithm from the attacker-controlled header instead of pinning it server-side.
        A related variant, "algorithm confusion," tricks an RS256 verifier into treating the
        public key as an HMAC secret.</p>
        <p><strong>Remediation:</strong> the verifier must specify and enforce the exact expected
        algorithm(s) — never trust the <code>alg</code> field from the token itself — and reject
        <code>none</code> outright.</p>`,
    },
    {
      id: "auth-3",
      title: "Broken Access Control: Trusting the Client",
      difficulty: "Easy",
      tags: ["Access Control", "Client Trust"],
      type: "webapp",
      briefing: `
        <p>Some apps decide what you're allowed to see based on state that lives entirely in the
        browser — a cookie, a piece of <code>localStorage</code>, a hidden form field — and never
        re-check it against anything the server actually controls. If you can edit that state,
        you can edit your own permissions.</p>
        <p>Below is a simplified view of this app's client-side session state, the same way you'd
        see it in DevTools → Application → Storage. Edit it.</p>`,
      webapp: {
        height: 300,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  table{border-collapse:collapse;margin-bottom:12px;}
  td{padding:6px 8px;border:1px solid #ddd;font-size:13px;}
  input{padding:6px;border:1px solid #ccc;border-radius:4px;font-size:13px;}
  button{padding:7px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;margin-right:8px;}
  #out{margin-top:14px;font-size:13px;}
  .ok{background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;}
</style></head>
<body>
  <h2>Client-Side Session State (localStorage)</h2>
  <table><tr><td>role</td><td><input id="roleval" value="user" /></td></tr></table>
  <button id="apply">Apply</button>
  <button id="load">Load /admin</button>
  <div id="out"></div>
<script>
  var role = 'user';
  document.getElementById('apply').addEventListener('click', function () {
    role = document.getElementById('roleval').value.trim();
  });
  document.getElementById('load').addEventListener('click', function () {
    var out = document.getElementById('out');
    if (role === 'admin') {
      out.innerHTML = '<div class="ok">Welcome, admin. FLAG{trust_no_client_role}</div>';
    } else {
      out.textContent = 'Access denied — staff only.';
    }
  });
</script>
</body></html>`,
      },
      hints: [
        "Nothing here calls back to a server to check anything — the role value you edit is the entire authorization system.",
        "Change the role field to <code>admin</code>, click Apply, then Load /admin.",
      ],
      flag: "RkxBR3t0cnVzdF9ub19jbGllbnRfcm9sZX0=",
      debrief: `
        <p>Broken access control has topped the OWASP Top 10 for good reason: it's rarely one
        exotic bug, it's a design habit — trusting a cookie value, a JWT claim that's never
        actually verified, or a role flag echoed back from the client — instead of re-deriving
        permissions server-side on every request.</p>
        <p><strong>Remediation:</strong> authorization decisions must be made and enforced
        server-side, from server-held state, on every request — never inferred from anything the
        client hands you.</p>`,
    },
  ],
};
