window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS["crypto-client"] = {
  id: "crypto-client",
  order: 6,
  title: "Crypto & Client-Side Bugs",
  category: "Crypto/Client",
  color: "#4fd1e8",
  description: "Weak hashing, encoding mistaken for encryption, and JavaScript's sharpest edge.",
  levels: [
    {
      id: "crypto-1",
      title: "Cracking an Unsalted Password Hash",
      difficulty: "Easy",
      tags: ["Hashing", "Dictionary Attack"],
      type: "webapp",
      briefing: `
        <p>Fast, unsalted hashes turn "we don't store plaintext passwords" into a false sense of
        security. If the same password always produces the same hash and there's no per-user salt,
        anyone with the hash and a common-password wordlist can just hash each candidate and
        compare — a <strong>dictionary attack</strong>.</p>
        <p>This sandbox uses a toy legacy hash (not real MD5, but the same fatal shape: fast,
        deterministic, unsalted) on a password pulled from a leaked auth table. Try candidates from
        the wordlist below.</p>`,
      webapp: {
        height: 420,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;width:200px;}
  button{padding:8px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  pre{background:#14171c;color:#c9d1d9;padding:10px;border-radius:4px;font-size:12px;overflow-x:auto;}
  #out{margin-top:12px;font-size:13px;}
  .ok{background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;}
</style></head>
<body>
  <h2>Leaked Auth Table — Row #4471</h2>
  <p style="font-size:13px;">Common-password wordlist:</p>
  <pre>123456
password
qwerty
letmein
changeme123
admin
welcome1
dragon</pre>
  <div id="hashline" style="font-size:13px;margin-bottom:10px;"></div>
  <input id="cand" placeholder="try a candidate password" autocomplete="off" />
  <button id="go">Test candidate</button>
  <div id="out"></div>
<script>
  function toyHash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) { h = ((h * 33) ^ str.charCodeAt(i)) >>> 0; }
    return h.toString(16);
  }
  var target = toyHash('changeme123');
  document.getElementById('hashline').textContent = 'stored_hash = ' + target;
  document.getElementById('go').addEventListener('click', function () {
    var cand = document.getElementById('cand').value;
    var out = document.getElementById('out');
    if (!cand) return;
    var h = toyHash(cand);
    if (h === target) {
      out.innerHTML = '<div class="ok">MATCH — password was &quot;' + cand + '&quot;. FLAG{dictionary_cracked_hash}</div>';
    } else {
      out.textContent = 'toyHash("' + cand + '") = ' + h + ' — no match.';
    }
  });
  document.getElementById('cand').addEventListener('keydown', function(e){ if (e.key === 'Enter') document.getElementById('go').click(); });
</script>
</body></html>`,
      },
      hints: [
        "You don't need to reverse the hash — just hash every word in the list and compare.",
        "One of the eight words in the wordlist is the answer. Try them in order.",
      ],
      flag: "RkxBR3tkaWN0aW9uYXJ5X2NyYWNrZWRfaGFzaH0=",
      debrief: `
        <p>Real tools (<code>hashcat</code>, <code>john</code>) do exactly this at billions of
        guesses per second on real algorithms, which is why fast general-purpose hashes
        (MD5, SHA-1, even unsalted SHA-256) are unsuitable for passwords no matter how "random"
        individual passwords look.</p>
        <p><strong>Remediation:</strong> use a slow, purpose-built password hash —
        <code>bcrypt</code>, <code>scrypt</code>, or <code>argon2</code> — with a unique salt per
        user, so attackers can't precompute or share cracking work across accounts.</p>`,
    },
    {
      id: "crypto-2",
      title: "Encoding Is Not Encryption",
      difficulty: "Easy",
      tags: ["Base64", "Misconception"],
      type: "answer",
      briefing: `
        <p>A shockingly common finding: something labeled "encrypted" that's actually just
        <strong>encoded</strong>. You already met one encoding scheme in Foundations
        (<code>%20</code>-style URL-encoding) — Base64 is another, same non-secret idea, just a
        different alphabet. Encoding is about representing data safely in a given format — it is
        fully and trivially reversible by design, with no key or
        secret involved. Encryption requires a key and is meant to resist reversal without one.
        Conflating the two is how "secure" tokens, IDs, and notes end up readable by anyone who
        knows to look.</p>
        <p>Here's a support ticket note from this app's source comments:</p>
        <blockquote style="font-size:13px;color:#555;">// encrypted at rest, don't worry about it 🔒</blockquote>
        <p>And the stored value for a user's "encrypted" note:</p>
        <pre>RkxBR3tiYXNlNjRfaXNfbm90X2NyeXB0b30=</pre>
        <p>Paste it into the scratchpad and decode it.</p>`,
      answer: {
        tools: [
          { label: "Base64 Decode", fn: (s) => atob(s) },
          { label: "Base64 Encode", fn: (s) => btoa(s) },
          { label: "URL Decode", fn: (s) => decodeURIComponent(s) },
        ],
      },
      hints: [
        "\"Encrypted at rest\" should mean unreadable without a key. Does this value need one?",
        "It's plain Base64 — click Base64 Decode with it in the scratchpad.",
      ],
      flag: "RkxBR3tiYXNlNjRfaXNfbm90X2NyeXB0b30=",
      debrief: `
        <p>This exact mistake shows up constantly in bug bounty scope: "encrypted" query
        parameters, session values, or password-reset tokens that decode in one click. It's worth
        Base64/hex/URL-decoding <em>any</em> opaque-looking value you find during recon — you're
        occasionally handed the whole vulnerability for free.</p>
        <p><strong>Remediation:</strong> use real authenticated encryption (e.g. AES-GCM) with
        properly managed keys for anything that needs confidentiality — and never describe
        encoding as encryption in your own documentation, because the next engineer will believe
        it.</p>`,
    },
    {
      id: "crypto-3",
      title: "Prototype Pollution",
      difficulty: "Hard",
      tags: ["Prototype Pollution", "JavaScript"],
      type: "webapp",
      briefing: `
        <p>JavaScript objects inherit properties through a prototype chain, and every plain object
        shares the same root: <code>Object.prototype</code>. A naive recursive "merge" or "clone"
        utility — the kind hand-rolled in a lot of config-loading code — will happily walk into a
        key literally named <code>__proto__</code> if it appears in attacker-controlled JSON (the
        same curly-brace, quoted-key syntax from Foundations), and write straight onto that shared
        root. Do that, and the property shows up on
        <strong>every plain object in the program</strong>, including ones that don't exist yet.</p>
        <p>Below is exactly that merge function, wired to a "save preferences" form. Try merging in
        a payload that adds an <code>isAdmin</code> property to <code>__proto__</code>.</p>`,
      webapp: {
        height: 400,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  textarea{width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:12px;font-family:monospace;height:70px;}
  button{padding:8px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;margin-top:8px;margin-right:8px;}
  #out{margin-top:14px;font-size:13px;}
  .ok{background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;}
</style></head>
<body>
  <h2>Save Preferences</h2>
  <p style="font-size:13px;color:#555;">JSON merged into your preferences object:</p>
  <textarea id="payload">{"theme":"dark"}</textarea>
  <br/>
  <button id="save">Save preferences</button>
  <button id="check">Check admin status (new object)</button>
  <div id="out"></div>
<script>
  function merge(target, source) {
    for (var key in source) {
      if (source[key] && typeof source[key] === 'object') {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  document.getElementById('save').addEventListener('click', function () {
    var out = document.getElementById('out');
    try {
      var parsed = JSON.parse(document.getElementById('payload').value);
      var userPrefs = {};
      merge(userPrefs, parsed);
      out.textContent = 'Saved: ' + JSON.stringify(userPrefs);
    } catch (e) {
      out.textContent = 'Invalid JSON: ' + e.message;
    }
  });
  document.getElementById('check').addEventListener('click', function () {
    var out = document.getElementById('out');
    var brandNewObject = {};
    if (brandNewObject.isAdmin) {
      out.innerHTML = '<div class="ok">A brand-new, unrelated object has isAdmin === true. FLAG{proto_pollution_isadmin}</div>';
    } else {
      out.textContent = 'brandNewObject.isAdmin is falsy — nothing polluted yet.';
    }
  });
</script>
</body></html>`,
      },
      hints: [
        "The merge function recurses into any key whose value is an object — including a key literally named <code>__proto__</code>.",
        'Try: <code>{"__proto__":{"isAdmin":true}}</code> in the preferences box, click Save, then Check admin status.',
      ],
      flag: "RkxBR3twcm90b19wb2xsdXRpb25faXNhZG1pbn0=",
      debrief: `
        <p>This is a real, not simulated, JavaScript behavior — several widely-used npm packages
        have shipped exactly this merge pattern and been assigned CVEs for it. Depending on how the
        polluted property is later read (an <code>isAdmin</code> check, a template path, a command
        argument), prototype pollution has been escalated all the way to remote code execution in
        real-world reports.</p>
        <p><strong>Remediation:</strong> reject or explicitly skip <code>__proto__</code>,
        <code>constructor</code>, and <code>prototype</code> keys during merge/clone, use
        <code>Object.create(null)</code> for dictionary-style objects, or reach for a merge utility
        that's already been hardened against this.</p>`,
    },
  ],
};
