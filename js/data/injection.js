window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.injection = {
  id: "injection",
  order: 2,
  title: "Injection",
  category: "Injection",
  color: "#ef5350",
  description: "When user input becomes code: SQL and OS command injection.",
  levels: [
    {
      id: "injection-1",
      title: "SQL Injection: Authentication Bypass",
      difficulty: "Easy",
      tags: ["SQLi", "Auth Bypass"],
      type: "webapp",
      briefing: `
        <p>Remember writing your first <code>SELECT ... FROM ... WHERE ...</code> query in
        Foundations? Under the hood, this staff login builds that same shape of query by pasting
        your input directly into the text — plain string concatenation, a real, still-common
        anti-pattern:</p>
        <pre>SELECT * FROM users WHERE username='&lt;input&gt;' AND password='&lt;input&gt;'</pre>
        <p>If your input can close that quote early, you can rewrite the logic of the
        <code>WHERE</code> clause instead of just supplying a value for it. The sandbox has a
        live debug panel echoing the query as you type — watch how your input reshapes it.</p>`,
      webapp: {
        height: 420,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  label{display:block;font-size:12px;margin:10px 0 4px;color:#555;}
  input{width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{margin-top:14px;padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  .msg{margin-top:14px;padding:10px;border-radius:4px;font-size:13px;}
  .msg.err{background:#fde8e8;color:#9c1c1c;}
  .msg.ok{background:#e6f7ef;color:#0b6b41;}
  pre.dbg{margin-top:16px;background:#14171c;color:#8fd694;padding:10px;border-radius:4px;font-size:11px;overflow-x:auto;}
</style></head>
<body>
  <h2>MegaCorp Shop — Staff Login</h2>
  <form id="f">
    <label>Username</label>
    <input id="u" autocomplete="off" />
    <label>Password</label>
    <input id="p" type="password" autocomplete="off" />
    <button type="submit">Sign in</button>
  </form>
  <div id="out"></div>
  <pre class="dbg" id="dbg">-- debug mode: query preview --</pre>
<script>
  var u = document.getElementById('u');
  var p = document.getElementById('p');
  var dbg = document.getElementById('dbg');
  var out = document.getElementById('out');
  function preview() {
    dbg.textContent = "SELECT * FROM users WHERE username='" + u.value + "' AND password='" + p.value + "'";
  }
  u.addEventListener('input', preview);
  p.addEventListener('input', preview);
  preview();
  function looksLikeBypass(s) {
    var patterns = [
      /'\\s*or\\s*'?1'?\\s*=\\s*'?1'?\\s*(--|#|;)?/i,
      /'\\s*or\\s*true\\s*(--|#|;)?/i,
      /admin'\\s*(--|#)/i,
      /'\\s*or\\s*''\\s*=\\s*''/i
    ];
    return patterns.some(function(re){ return re.test(s); });
  }
  document.getElementById('f').addEventListener('submit', function(e){
    e.preventDefault();
    var bypass = looksLikeBypass(u.value) || looksLikeBypass(p.value);
    if (bypass) {
      out.innerHTML = '<div class="msg ok">Login successful &mdash; welcome, admin.<br>Session token issued. Internal note: FLAG{sqli_auth_bypass_ok}</div>';
    } else {
      out.innerHTML = '<div class="msg err">Invalid username or password.</div>';
    }
  });
</script>
</body></html>`,
      },
      hints: [
        "You don't need the real password — you need input that makes the WHERE clause always true.",
        "Classic payload for the username field: <code>' OR '1'='1' --&nbsp;</code>",
      ],
      flag: "RkxBR3tzcWxpX2F1dGhfYnlwYXNzX29rfQ==",
      debrief: `
        <p>You just performed a boolean-based auth bypass. Once the query becomes
        <code>... WHERE username='' OR '1'='1' --...</code>, the always-true clause matches every
        row and the trailing comment strips the password check entirely.</p>
        <p><strong>Remediation:</strong> parameterized queries / prepared statements, always —
        never build SQL by string concatenation. An ORM with proper parameter binding closes this
        entire vulnerability class by construction.</p>`,
    },
    {
      id: "injection-2",
      title: "SQL Injection: UNION-Based Extraction",
      difficulty: "Medium",
      tags: ["SQLi", "UNION", "Data Exfiltration"],
      type: "webapp",
      briefing: `
        <p>The product search below runs:</p>
        <pre>SELECT name, price FROM products WHERE category = '&lt;input&gt;'</pre>
        <p>When an injection point returns data directly to the page, <code>UNION SELECT</code>
        lets you append rows from a completely different table — as long as the column count and
        types line up. Try searching for a normal category first (<code>shoes</code>), then break
        out of the string and union in data from the <code>users</code> table.</p>`,
      webapp: {
        height: 440,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:70%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  table{width:100%;margin-top:14px;border-collapse:collapse;font-size:13px;}
  td,th{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;}
  pre.dbg{margin-top:16px;background:#14171c;color:#8fd694;padding:10px;border-radius:4px;font-size:11px;overflow-x:auto;}
  .empty{color:#777;font-size:13px;margin-top:14px;}
</style></head>
<body>
  <h2>MegaCorp Shop — Product Search</h2>
  <input id="q" placeholder="category, e.g. shoes" autocomplete="off" />
  <button id="go">Search</button>
  <div id="out"></div>
  <pre class="dbg" id="dbg">-- debug mode: query preview --</pre>
<script>
  var q = document.getElementById('q');
  var out = document.getElementById('out');
  var dbg = document.getElementById('dbg');
  function preview() {
    dbg.textContent = "SELECT name, price FROM products WHERE category = '" + q.value + "'";
  }
  q.addEventListener('input', preview);
  preview();
  var catalog = {
    shoes: [["Trail Runner", "$89.00"], ["Court Classic", "$64.00"]],
    jackets: [["Storm Shell", "$142.00"]]
  };
  function run() {
    var raw = q.value;
    var lower = raw.toLowerCase();
    var rows = [];
    Object.keys(catalog).forEach(function(k){
      if (lower.indexOf(k) !== -1) rows = rows.concat(catalog[k]);
    });
    var isInjection = raw.indexOf("'") !== -1 && lower.indexOf('union') !== -1 &&
      lower.indexOf('select') !== -1 && lower.indexOf('users') !== -1;
    if (isInjection) rows.push(["admin (password_hash)", "FLAG{union_select_exfil}"]);
    if (!rows.length) { out.innerHTML = '<div class="empty">No products found.</div>'; return; }
    var html = '<table><tr><th>Name</th><th>Price</th></tr>';
    rows.forEach(function(r){ html += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; });
    out.innerHTML = html + '</table>';
  }
  document.getElementById('go').addEventListener('click', run);
  q.addEventListener('keydown', function(e){ if (e.key === 'Enter') run(); });
</script>
</body></html>`,
      },
      hints: [
        "The visible query returns two columns — your UNION SELECT needs exactly two as well.",
        "Try: <code>nomatch' UNION SELECT username, password FROM users -- </code>",
      ],
      flag: "RkxBR3t1bmlvbl9zZWxlY3RfZXhmaWx9",
      debrief: `
        <p>UNION-based injection only works when the results render directly on the page and you
        can match the target query's column count/types — which is exactly what you just did.
        When results aren't reflected, attackers fall back to blind techniques (boolean- or
        time-based) — this is what <code>sqlmap</code> automates in real engagements once you've
        confirmed a parameter is injectable by hand.</p>
        <p><strong>Remediation:</strong> parameterized queries, plus least-privilege database
        accounts so even a successful injection can't reach tables it has no business touching.</p>`,
    },
    {
      id: "injection-3",
      title: "OS Command Injection",
      difficulty: "Medium",
      tags: ["Command Injection", "RCE"],
      type: "webapp",
      briefing: `
        <p>This "network diagnostics" tool builds a shell command by pasting your input straight
        into it:</p>
        <pre>ping -c 3 &lt;input&gt;</pre>
        <p>Shell metacharacters — <code>;</code>, <code>&amp;&amp;</code>, <code>|</code>,
        backticks — let you terminate the intended command and chain your own. There's a file at
        <code>/etc/appsecret.txt</code> on this box worth reading.</p>`,
      webapp: {
        height: 400,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:70%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  pre.out{margin-top:14px;background:#14171c;color:#c9d1d9;padding:12px;border-radius:4px;font-size:12px;min-height:60px;white-space:pre-wrap;}
  pre.dbg{margin-top:10px;background:#14171c;color:#8fd694;padding:10px;border-radius:4px;font-size:11px;overflow-x:auto;}
</style></head>
<body>
  <h2>MegaCorp Shop — Network Diagnostics</h2>
  <input id="host" placeholder="host to ping, e.g. 8.8.8.8" autocomplete="off" />
  <button id="go">Ping</button>
  <pre class="dbg" id="dbg">-- debug mode: shell command preview --</pre>
  <pre class="out" id="out"></pre>
<script>
  var host = document.getElementById('host');
  var out = document.getElementById('out');
  var dbg = document.getElementById('dbg');
  function preview() { dbg.textContent = "ping -c 3 " + host.value; }
  host.addEventListener('input', preview);
  preview();
  function run() {
    var raw = host.value;
    var lower = raw.toLowerCase();
    var seps = [';', '&&', '|', '\`'];
    var hasSep = seps.some(function(s){ return raw.indexOf(s) !== -1; });
    var hostPart = raw.split(/;|&&|\\|/)[0].trim() || 'target';
    var lines = ['PING ' + hostPart + ': 3 packets transmitted, 3 received, 0% packet loss'];
    if (hasSep) {
      if (lower.indexOf('cat') !== -1 && lower.indexOf('appsecret') !== -1) {
        lines.push('');
        lines.push('FLAG{cmd_injection_chain}');
      } else if (lower.indexOf('whoami') !== -1) {
        lines.push('');
        lines.push('www-data');
      } else if (lower.indexOf('ls') !== -1) {
        lines.push('');
        lines.push('index.php  config.php  /etc/appsecret.txt');
      } else if (lower.indexOf('cat') !== -1) {
        lines.push('');
        lines.push('cat: missing file operand (try /etc/appsecret.txt)');
      }
    }
    out.textContent = lines.join('\\n');
  }
  document.getElementById('go').addEventListener('click', run);
  host.addEventListener('keydown', function(e){ if (e.key === 'Enter') run(); });
</script>
</body></html>`,
      },
      hints: [
        "Try chaining with <code>;</code> and running <code>ls</code> first to see what's on disk.",
        "Then: <code>8.8.8.8; cat /etc/appsecret.txt</code>",
      ],
      flag: "RkxBR3tjbWRfaW5qZWN0aW9uX2NoYWlufQ==",
      debrief: `
        <p>Command injection is usually rated critical — it's a direct path to remote code
        execution, not just data disclosure. Any feature that shells out (image conversion, ping
        utilities, PDF generation) is a prime target to check for this.</p>
        <p><strong>Remediation:</strong> avoid invoking a shell at all — use library APIs or an
        execve-style call with an argument array instead of a concatenated string, and
        allow-list input strictly (e.g. valid IP/hostname format only).</p>`,
    },
  ],
};
