window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.xss = {
  id: "xss",
  order: 3,
  title: "Cross-Site Scripting",
  category: "XSS",
  color: "#f2784b",
  description: "Get your own JavaScript to run in someone else's browser session.",
  levels: [
    {
      id: "xss-1",
      title: "Reflected XSS",
      difficulty: "Easy",
      tags: ["XSS", "Reflected"],
      type: "webapp",
      briefing: `
        <p><strong>Reflected XSS</strong> happens when input is echoed straight back into the page
        with no encoding — normally via a URL parameter a victim is tricked into clicking. Imagine
        the search box below reflects a <code>?q=</code> query-string parameter.</p>
        <p><strong>Gotcha:</strong> a literal <code>&lt;script&gt;</code> tag inserted via
        <code>innerHTML</code> will <em>not</em> execute — that's spec behavior, not a defense.
        Real-world payloads instead reuse a tag and attribute the way you learned in Foundations
        (<code>&lt;tagname attribute="value"&gt;</code>) — an <strong>event-handler attribute</strong>
        like <code>onerror</code> runs JavaScript the moment it fires, e.g. an image that fails to load:</p>
        <pre>&lt;img src=x onerror="/* your JS here */"&gt;</pre>`,
      webapp: {
        height: 340,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:70%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  #results{margin-top:16px;font-size:14px;}
</style></head>
<body>
  <h2>Search MegaCorp Shop</h2>
  <input id="q" placeholder="search term" autocomplete="off" />
  <button id="go">Search</button>
  <div id="results"></div>
<script>
  window.xssCallback = function () {
    document.getElementById('results').innerHTML =
      '<div style="background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;">' +
      'Your script executed inside the page. FLAG{reflected_xss_fired}</div>';
  };
  document.getElementById('go').addEventListener('click', function () {
    var q = document.getElementById('q').value;
    document.getElementById('results').innerHTML = 'You searched for: ' + q;
  });
</script>
</body></html>`,
      },
      hints: [
        "There's a global function <code>xssCallback()</code> already defined on the page — your goal is to make the page call it.",
        "Try: <code>&lt;img src=x onerror=xssCallback()&gt;</code> in the search box.",
      ],
      flag: "RkxBR3tyZWZsZWN0ZWRfeHNzX2ZpcmVkfQ==",
      debrief: `
        <p>In a real attack you'd host this payload in a link — <code>?q=&lt;img src=x
        onerror=...&gt;</code> — and get a victim to click it. Because the script runs as the
        victim, it inherits their session: reading their cookies, making authenticated requests,
        or redirecting them entirely.</p>
        <p><strong>Remediation:</strong> HTML-encode output by context, use a template engine
        that auto-escapes by default, and set a Content-Security-Policy as defense in depth.</p>`,
    },
    {
      id: "xss-2",
      title: "Stored XSS",
      difficulty: "Medium",
      tags: ["XSS", "Stored"],
      type: "webapp",
      briefing: `
        <p><strong>Stored XSS</strong> is more dangerous than reflected: the payload is saved
        server-side (a comment, a profile bio, a support ticket) and fires for <em>every</em>
        visitor who later views it — no crafted link required.</p>
        <p>Post a comment below, then use "Simulate another visitor loading the page" to see what
        happens when someone else's browser renders the stored comment feed.</p>`,
      webapp: {
        height: 420,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  textarea{width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;}
  button{margin-top:8px;padding:8px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;margin-right:8px;}
  .note{font-size:12px;color:#666;margin-top:6px;}
  #feed{margin-top:16px;border-top:1px solid #ddd;padding-top:10px;}
  .c{padding:8px 0;border-bottom:1px solid #eee;font-size:13px;}
</style></head>
<body>
  <h2>Product Reviews</h2>
  <textarea id="c" rows="2" placeholder="Write a review..."></textarea><br/>
  <button id="post">Post review</button>
  <button id="visit">Simulate another visitor loading the page</button>
  <div class="note" id="confirm"></div>
  <div id="feed"></div>
<script>
  var comments = ['Great product, fast shipping!'];
  window.xssCallback = function () {
    document.getElementById('feed').innerHTML =
      '<div style="background:#e6f7ef;color:#0b6b41;padding:10px;border-radius:4px;">' +
      'Executed while rendering the comment feed for another visitor. FLAG{stored_xss_persists}</div>';
  };
  document.getElementById('post').addEventListener('click', function () {
    var box = document.getElementById('c');
    if (!box.value.trim()) return;
    comments.push(box.value);
    box.value = '';
    document.getElementById('confirm').textContent = 'Review submitted (' + comments.length + ' total). Nobody has viewed the feed yet.';
  });
  document.getElementById('visit').addEventListener('click', function () {
    var html = '';
    comments.forEach(function (c) { html += '<div class="c">' + c + '</div>'; });
    document.getElementById('feed').innerHTML = html;
  });
</script>
</body></html>`,
      },
      hints: [
        "Posting doesn't render your comment back to you — you need the separate 'visitor' render to trigger it.",
        "Post <code>&lt;img src=x onerror=xssCallback()&gt;</code> as your review, then click 'Simulate another visitor'.",
      ],
      flag: "RkxBR3tzdG9yZWRfeHNzX3BlcnNpc3RzfQ==",
      debrief: `
        <p>Notice the payload didn't fire when you posted it — it fired later, for a different
        page load, exactly as it would for a real victim browsing reviews. That persistence is
        what makes stored XSS a favorite for session hijacking and worm-style propagation
        (self-replicating payloads that repost themselves).</p>
        <p><strong>Remediation:</strong> sanitize on output (not just input — attackers can bypass
        input filters), and consider an allow-list HTML sanitizer if any rich text is genuinely
        needed.</p>`,
    },
    {
      id: "xss-3",
      title: "DOM-Based XSS",
      difficulty: "Medium",
      tags: ["XSS", "DOM", "Client-Side"],
      type: "webapp",
      briefing: `
        <p><strong>DOM-based XSS</strong> never touches the server at all — the vulnerable source
        and sink are both client-side JavaScript. Here, the page reads
        <code>location.hash</code> and writes it straight into the DOM with
        <code>innerHTML</code>. Since the fragment after <code>#</code> is never sent to a server,
        this class of bug is invisible to server-side logs and WAFs.</p>
        <p>Use the field below to set the page's URL fragment, then click Navigate.</p>`,
      webapp: {
        height: 340,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:70%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;font-size:14px;}
  button{padding:8px 16px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;}
  #content{margin-top:16px;font-size:14px;padding:10px;border:1px dashed #ccc;border-radius:4px;}
</style></head>
<body>
  <h2>Welcome Banner</h2>
  <input id="frag" placeholder="#fragment, e.g. #hello" autocomplete="off" />
  <button id="go">Navigate</button>
  <div id="content">Add a #fragment to personalize this banner.</div>
<script>
  window.xssCallback = function () {
    document.getElementById('content').innerHTML =
      '<div style="background:#e6f7ef;color:#0b6b41;padding:6px;border-radius:4px;">' +
      'Executed straight from location.hash, no server involved. FLAG{dom_xss_hash_sink}</div>';
  };
  function render() {
    var h = location.hash.slice(1);
    if (h) document.getElementById('content').innerHTML = decodeURIComponent(h);
  }
  window.addEventListener('hashchange', render);
  document.getElementById('go').addEventListener('click', function () {
    location.hash = document.getElementById('frag').value;
  });
</script>
</body></html>`,
      },
      hints: [
        "The sink is <code>innerHTML</code> fed directly by <code>location.hash</code> — same event-handler trick works here.",
        "Try: <code>#&lt;img src=x onerror=xssCallback()&gt;</code>",
      ],
      flag: "RkxBR3tkb21feHNzX2hhc2hfc2lua30=",
      debrief: `
        <p>DOM XSS bugs hide in client-side routing, single-page apps, and any code that reads
        <code>location.hash</code>/<code>location.search</code>/<code>document.referrer</code>
        and writes it into the DOM. Static analysis tools flag risky sink functions
        (<code>innerHTML</code>, <code>document.write</code>, <code>eval</code>) precisely because
        this class is easy to miss in review.</p>
        <p><strong>Remediation:</strong> use <code>textContent</code> for plain text, and if HTML
        insertion is unavoidable, sanitize with a vetted library before it reaches the DOM.</p>`,
    },
  ],
};
