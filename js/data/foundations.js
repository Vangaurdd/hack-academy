window.HACKACADEMY_TRACKS = window.HACKACADEMY_TRACKS || {};
window.HACKACADEMY_TRACKS.foundations = {
  id: "foundations",
  order: 0,
  title: "Foundations",
  category: "Foundations",
  color: "#8891a3",
  description: "Zero assumed knowledge. Everything later in this academy builds on these nine levels.",
  levels: [
    {
      id: "found-1",
      title: "What Is a Website, Really?",
      difficulty: "Read",
      tags: ["Client/Server", "URLs"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Every level in this academy talks about "the client" and "the server." Here's the whole
        idea, in plain terms:</p>
        <ul>
          <li>Your browser (Chrome, Safari, Firefox…) is the <strong>client</strong>. It's the
          thing you're using right now.</li>
          <li>Somewhere else in the world, a computer is storing the website's files and data.
          That's the <strong>server</strong>.</li>
          <li>When you go to a web address, your browser <strong>asks</strong> the server for that
          page, and the server <strong>answers</strong> with the content to show you.</li>
        </ul>
        <p>That's it — a website is just two computers talking, one asking and one answering. Later
        on, "client-side" means "happening in your browser" and "server-side" means "happening on
        that other computer, out of your direct view."</p>
        <h3>Reading a URL</h3>
        <p>A web address (URL) is a small set of instructions for exactly what to ask for:</p>
        <pre>https://shop.example.com/products?category=jackets&sort=price
└─┬─┘   └──────┬───────┘└────┬────┘└────────────┬────────────┘
scheme      domain          path            query string</pre>
        <table class="field-table">
          <tr><th>Part</th><th>What it means</th></tr>
          <tr><td>scheme (<code>https://</code>)</td><td>how to connect — the "s" means the connection is encrypted</td></tr>
          <tr><td>domain (<code>shop.example.com</code>)</td><td>which server to talk to</td></tr>
          <tr><td>path (<code>/products</code>)</td><td>which page or resource on that server</td></tr>
          <tr><td>query string (<code>?category=jackets&amp;sort=price</code>)</td><td>extra <code>key=value</code> options, joined with <code>&amp;</code></td></tr>
        </table>
        <p>You'll see this same anatomy — domain, path, query parameters — constantly, from recon
        (which domain?) to injection (which parameter?) to IDOR (which value in the query string
        can I change?).</p>
      </div>`,
      debrief: "",
    },
    {
      id: "found-2",
      title: "Your First Terminal Commands",
      difficulty: "Easy",
      tags: ["Terminal", "Command Line"],
      type: "terminal",
      briefing: `
        <p>A <strong>terminal</strong> is a way to control a computer entirely by typing — no
        clicking, no icons. You type an instruction called a <strong>command</strong>, press
        <kbd>Enter</kbd>, and the computer responds directly below it.</p>
        <p>The text before the blinking cursor (like <code>user@target:$</code>) is called the
        <strong>prompt</strong> — it just means "I'm ready, type something." Words you type after a
        command, separated by spaces, are called <strong>arguments</strong> — they tell the command
        what to act on.</p>
        <p>Try these three, one at a time, in order:</p>
        <ol>
          <li><code>pwd</code> — "print working directory": shows where you currently are</li>
          <li><code>ls</code> — "list": shows what files exist right here</li>
          <li><code>cat welcome.txt</code> — "concatenate" (in practice: print a file's contents to the screen)</li>
        </ol>`,
      terminal: {
        promptLabel: "you@academy",
        whoami: "you",
        cwd: "/home/you",
        banner: "Type a command and press Enter. Try: pwd, then ls, then cat welcome.txt\n",
        fs: HA.dir({
          home: HA.dir({
            you: HA.dir({
              "welcome.txt":
                "Welcome! If you can read this, you just used your first three terminal commands: pwd, ls, and cat.\n\n" +
                "FLAG{first_commands_pwd_ls_cat}",
              "notes.txt": "Tip: cd moves you into a different folder. Try 'cd ..' to go up one level, or 'cd home' to go back down.\n",
            }),
          }),
        }),
      },
      hints: [
        "Type <code>pwd</code> and press Enter. That's the whole command — no arguments needed.",
        "Type <code>ls</code> and press Enter to see what files are sitting in this folder.",
        "Type <code>cat welcome.txt</code> and press Enter to print that file's contents.",
      ],
      flag: "RkxBR3tmaXJzdF9jb21tYW5kc19wd2RfbHNfY2F0fQ==",
      debrief: `
        <p>That's genuinely most of it. Every terminal level later in this academy — recon tools,
        content discovery, command injection — is the same three moves on repeat: look around
        (<code>ls</code>), see where you are (<code>pwd</code>), read something
        (<code>cat</code>) — plus <code>cd</code> to move between folders. Specialized security
        tools like <code>whois</code>, <code>dig</code>, and <code>gobuster</code> that show up
        later are typed exactly the same way: a command, a space, then arguments.</p>`,
    },
    {
      id: "found-3",
      title: "How Browsers and Servers Talk: HTTP",
      difficulty: "Read",
      tags: ["HTTP", "Requests"],
      type: "reading",
      briefing: `<div class="reading">
        <p>The conversation between your browser (the client) and a server happens using a shared
        language called <strong>HTTP</strong>. Every single thing a browser does — loading a page,
        submitting a form, checking your inbox — is one HTTP <strong>request</strong> answered by
        one HTTP <strong>response</strong>.</p>
        <h3>The two requests you'll see constantly</h3>
        <table class="field-table">
          <tr><th>Method</th><th>Plain English</th></tr>
          <tr><td><code>GET</code></td><td>"Give me something" — loading a page, an image, a search result. Nothing on the server is supposed to change.</td></tr>
          <tr><td><code>POST</code></td><td>"Here, take this" — submitting a login form, posting a comment, transferring money. Something on the server changes.</td></tr>
        </table>
        <h3>Status codes: the server's one-line answer</h3>
        <table class="field-table">
          <tr><th>Code</th><th>Meaning</th></tr>
          <tr><td>200</td><td>OK — here's what you asked for</td></tr>
          <tr><td>403</td><td>Forbidden — I understood you, but you're not allowed</td></tr>
          <tr><td>404</td><td>Not Found — nothing exists at that path</td></tr>
          <tr><td>500</td><td>Server Error — something broke on their end</td></tr>
        </table>
        <p>Requests and responses also carry <strong>headers</strong> — extra labeled information
        riding alongside the main content, the same idea as a shipping label riding alongside a
        package. One header you'll meet very soon, <code>Cookie</code>, is how a site remembers
        who you are between one request and the next.</p>
      </div>`,
      debrief: "",
    },
    {
      id: "found-4",
      title: "Reading HTML: Tags, Attributes, and View Source",
      difficulty: "Easy",
      tags: ["HTML", "DevTools"],
      type: "webapp",
      briefing: `
        <p><strong>HTML</strong> is the language that describes what's on a page — headings,
        paragraphs, images, buttons. It's built from <strong>tags</strong>, written like
        <code>&lt;tagname&gt;content&lt;/tagname&gt;</code>. Tags can carry extra settings called
        <strong>attributes</strong>, written inside the opening tag —
        <code>&lt;img src="cat.jpg"&gt;</code> has one attribute, <code>src</code>, telling the
        browser which image file to load.</p>
        <p>HTML also supports <strong>comments</strong> — <code>&lt;!-- like this --&gt;</code> —
        text that lives in the page's source but is never displayed. Developers use these for
        notes to themselves, and forgetting to remove one is a very real, very common source of
        accidental information leaks.</p>
        <p>Every browser lets you see a page's raw HTML: <strong>right-click anywhere and choose
        "Inspect"</strong> (or press <kbd>F12</kbd>, or <kbd>Cmd+Option+I</kbd> on Mac) to open
        DevTools' <strong>Elements</strong> panel — a live, exact tree of every tag on the page,
        including inside the sandbox below. Open it now and look for something that isn't visible
        anywhere on the rendered page.</p>`,
      webapp: {
        height: 220,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
</style></head>
<body>
  <h2>Welcome</h2>
  <p>Nothing to see here on screen... or is there?</p>
  <!-- audit note: staging flag FLAG{view_source_basics} - remove this comment before launch -->
</body></html>`,
      },
      hints: [
        "Right-click on the sandbox and choose Inspect (or press F12 / Cmd+Option+I on Mac) to open DevTools.",
        "In the Elements panel, look for a comment node — it's written as <code>&lt;!-- text --&gt;</code> and is invisible on the actual page.",
      ],
      flag: "RkxBR3t2aWV3X3NvdXJjZV9iYXNpY3N9",
      debrief: `
        <p>Checking a page's HTML source for leftover comments and notes is a genuinely common bug
        bounty recon step — the exact same idea as the leaked DNS TXT record from the Recon track,
        just at the HTML layer instead of the DNS layer. From here on, "inspect it" is one of your
        default moves.</p>
        <p><strong>Note for developers reading this later:</strong> never rely on something being
        "not visible" as security — comments, hidden form fields, and disabled buttons are all
        fully readable in page source.</p>`,
    },
    {
      id: "found-5",
      title: "Meet the Console",
      difficulty: "Easy",
      tags: ["DevTools", "Console"],
      type: "answer",
      briefing: `
        <p>DevTools has several panels; the one you'll live in most often is the
        <strong>Console</strong>. It's a place to type small pieces of JavaScript directly and see
        the result immediately — and it's also where a page's own errors and logged messages show
        up automatically, which makes it your main way of confirming "did my payload actually
        run?" later in this academy.</p>
        <p>Open DevTools now (<kbd>F12</kbd>, or <kbd>Cmd+Option+I</kbd> on Mac) and click the
        <strong>Console</strong> tab. This exact Hack Academy page has a small value stashed on it
        for you to practice retrieving. Type this and press <kbd>Enter</kbd>:</p>
        <pre>window.__academySecret</pre>`,
      answer: {
        artifactHtml: `<p style="font-size:13px;color:var(--text-dim);">No sandbox for this one — open DevTools on this actual Hack Academy tab, not a target inside another level.</p>`,
      },
      hints: [
        "Make sure you're looking at DevTools for this Hack Academy tab itself — there's no target sandbox on this level.",
        "Type exactly <code>window.__academySecret</code> (or just <code>__academySecret</code>) into the Console and press Enter. Whatever it prints is your flag.",
      ],
      flag: "RkxBR3tkZXZ0b29sc19jb25zb2xlX2Jhc2ljc30=",
      debrief: `
        <p>You'll use the Console constantly from here on — to check whether a script tag actually
        executed, to read a variable a page exposed, or to try a quick snippet before committing to
        it as a real payload. One more thing worth knowing: when a page includes an iframe (like
        the sandboxes in every other track), DevTools can usually target that frame's own console
        context too, via a dropdown at the bottom of the Console panel — useful for inspecting
        exactly what's running inside one of these sandboxes.</p>`,
    },
    {
      id: "found-6",
      title: "Cookies & Why Websites Remember You",
      difficulty: "Read",
      tags: ["Cookies", "Sessions"],
      type: "reading",
      briefing: `<div class="reading">
        <p>Here's a puzzle: HTTP requests are independent of each other — the server doesn't
        automatically remember your last request when handling your next one. So how does a site
        keep you logged in as you click from page to page?</p>
        <p>The answer is a <strong>cookie</strong>: a small piece of data the server asks your
        browser to store, usually right after you log in. From then on, your browser automatically
        attaches that cookie to <em>every</em> request it sends to that same site — no action
        needed from you. The server checks the cookie against its own records and effectively
        thinks "ah, this is the browser I gave a login session to earlier."</p>
        <p>That server-side record is called a <strong>session</strong> — "this specific cookie
        value belongs to User X, who is currently logged in." The cookie itself is usually just a
        random-looking ID; the actual account data lives safely on the server, keyed by that ID.</p>
        <p>Keep this in mind for later: because the browser attaches cookies <em>automatically</em>,
        a request doesn't have to be something you consciously chose to send for your cookie to
        ride along with it. That single fact is the entire basis of the CSRF attack you'll meet in
        Track 5.</p>
      </div>`,
      debrief: "",
    },
    {
      id: "found-7",
      title: "Data Formats: What Is JSON?",
      difficulty: "Easy",
      tags: ["JSON", "Data"],
      type: "answer",
      briefing: `
        <p><strong>JSON</strong> (JavaScript Object Notation) is just a plain-text way to write
        structured, labeled data. It's everywhere — APIs, config files, and (later in this academy)
        the payloads you'll craft by hand.</p>
        <ul>
          <li>Curly braces <code>{ }</code> hold a group of labeled values.</li>
          <li>Each entry is written <code>"key": value</code>, separated by commas.</li>
          <li>Keys are <strong>always</strong> wrapped in double quotes — this is the single most
          common mistake when writing JSON by hand.</li>
          <li>Text values are also in double quotes; numbers and <code>true</code>/<code>false</code> are written plain.</li>
        </ul>
        <pre>{
  "name": "Alex",
  "isAdmin": false,
  "age": 7
}</pre>
        <p>Below is a config snippet with exactly one mistake. Paste it into the scratchpad, fix
        it, and click Validate JSON.</p>
        <pre>{
  name: "Agent Smith",
  "role": "scanner",
  "active": true
}</pre>`,
      answer: {
        tools: [
          {
            label: "Validate JSON",
            fn: (s) => {
              try {
                const v = JSON.parse(s);
                return "Valid JSON! Parsed as: " + JSON.stringify(v) + " — FLAG{json_101}";
              } catch (e) {
                return "Invalid JSON — " + e.message;
              }
            },
          },
        ],
      },
      hints: [
        "The error is on the very first key. Every key needs double quotes around it — <code>name</code> should be <code>\"name\"</code>.",
        "Fixed version: <code>{\"name\": \"Agent Smith\", \"role\": \"scanner\", \"active\": true}</code>",
      ],
      flag: "RkxBR3tqc29uXzEwMX0=",
      debrief: `
        <p>You'll write JSON by hand again soon — crafting a JWT payload in the Auth track, and
        deliberately exploiting a broken merge function with a <code>__proto__</code> payload in
        the Crypto/Client-Side track. Both are just this same curly-brace, quoted-key syntax.</p>`,
    },
    {
      id: "found-8",
      title: "Databases in Plain English: Your First Query",
      difficulty: "Easy",
      tags: ["SQL", "Databases"],
      type: "webapp",
      briefing: `
        <p>A <strong>database</strong> stores data in <strong>tables</strong> — think of a
        spreadsheet: each <strong>row</strong> is one record, each <strong>column</strong> is one
        field. To ask a database for data, you write a request called a <strong>SQL query</strong>.
        The most common shape:</p>
        <pre>SELECT <em>which columns</em> FROM <em>which table</em> WHERE <em>which rows match</em></pre>
        <p>One detail that matters a lot later: text values in SQL are wrapped in
        <strong>single</strong> quotes, like <code>'jackets'</code> — not double quotes.</p>
        <p>Here's a <code>products</code> table:</p>
        <table class="field-table">
          <tr><th>id</th><th>name</th><th>price</th><th>category</th></tr>
          <tr><td>1</td><td>Trail Runner</td><td>89.00</td><td>shoes</td></tr>
          <tr><td>2</td><td>Court Classic</td><td>64.00</td><td>shoes</td></tr>
          <tr><td>3</td><td>Storm Shell</td><td>142.00</td><td>jackets</td></tr>
          <tr><td>4</td><td>Down Parka</td><td>210.00</td><td>jackets</td></tr>
        </table>
        <p>Write a query below that selects the <code>name</code> and <code>price</code> of every
        product in the <code>jackets</code> category.</p>`,
      webapp: {
        height: 260,
        srcdoc: `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f4f2ec;color:#20242c;}
  h2{margin-top:0;font-size:16px;}
  input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;font-family:monospace;}
  button{padding:8px 14px;border:none;background:#20242c;color:#fff;border-radius:4px;cursor:pointer;margin-top:8px;}
  table{width:100%;margin-top:12px;border-collapse:collapse;font-size:13px;}
  td,th{padding:5px 8px;border-bottom:1px solid #ddd;text-align:left;}
  #out{margin-top:10px;font-size:13px;color:#555;}
</style></head>
<body>
  <h2>Query Runner</h2>
  <input id="q" placeholder="SELECT name, price FROM products WHERE category = 'jackets'" autocomplete="off" />
  <button id="go">Run query</button>
  <div id="out"></div>
<script>
  var rows = [
    ['Trail Runner', '89.00', 'shoes'],
    ['Court Classic', '64.00', 'shoes'],
    ['Storm Shell', '142.00', 'jackets'],
    ['Down Parka', '210.00', 'jackets']
  ];
  document.getElementById('go').addEventListener('click', function () {
    var q = document.getElementById('q').value.toLowerCase();
    var out = document.getElementById('out');
    var ok = ['select', 'name', 'price', 'from', 'products', 'where', 'category', 'jackets'].every(function (w) {
      return q.indexOf(w) !== -1;
    });
    if (!ok) { out.textContent = 'Not quite a match yet — check you have SELECT, name, price, FROM products, WHERE, and category = \\'jackets\\'.'; return; }
    var matched = rows.filter(function (r) { return r[2] === 'jackets'; });
    var html = '<table><tr><th>name</th><th>price</th></tr>';
    matched.forEach(function (r) { html += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; });
    out.innerHTML = html + '</table><p>Query understood. FLAG{first_select_query}</p>';
  });
</script>
</body></html>`,
      },
      hints: [
        "Column list first, then FROM and the table, then WHERE and the condition — in that order.",
        "Try exactly: <code>SELECT name, price FROM products WHERE category = 'jackets'</code>",
      ],
      flag: "RkxBR3tmaXJzdF9zZWxlY3RfcXVlcnl9",
      debrief: `
        <p>That's the exact query shape every login form, search box, and product page runs behind
        the scenes when you use a real website. The Injection track picks up right where this
        leaves off — instead of writing a well-formed query yourself, you'll be looking at an
        app that builds one by pasting in your input directly, and finding out what happens when
        your input includes a quote it wasn't expecting.</p>`,
    },
    {
      id: "found-9",
      title: "Encoding 101: Why %20 Means Space",
      difficulty: "Easy",
      tags: ["Encoding", "URLs"],
      type: "answer",
      briefing: `
        <p>URLs can't safely contain every character — spaces, <code>&amp;</code>,
        <code>?</code>, and <code>#</code> already mean something structural in a URL (remember
        the anatomy from Level 1: <code>&amp;</code> separates query parameters). So browsers
        <strong>percent-encode</strong> risky characters: a space becomes <code>%20</code>, an
        <code>&amp;</code> inside a value becomes <code>%26</code>, and so on — a percent sign
        followed by two hex digits standing in for the original character.</p>
        <p>This is <strong>not</strong> secrecy, just a safe way to transport awkward characters —
        the same non-secret idea you'll see again later with Base64. Anyone can decode it back
        instantly, which is exactly what you're about to do.</p>
        <p>Here's a URL-encoded value. Paste it into the scratchpad and decode it:</p>
        <pre>FLAG%7Burl_encoding_basics%7D</pre>`,
      answer: {
        tools: [
          { label: "URL Decode", fn: (s) => decodeURIComponent(s) },
          { label: "URL Encode", fn: (s) => encodeURIComponent(s) },
        ],
      },
      hints: [
        "<code>%7B</code> and <code>%7D</code> are just the curly braces <code>{</code> and <code>}</code>, percent-encoded.",
        "Click URL Decode with the value in the scratchpad.",
      ],
      flag: "RkxBR3t1cmxfZW5jb2RpbmdfYmFzaWNzfQ==",
      debrief: `
        <p>You now have the full toolkit this academy assumes: a terminal, HTTP, HTML, the
        Console, cookies, JSON, a first SQL query, and encoding. Everything from here — Recon
        through Methodology — is applying these same basics to find and explain real bugs. Head to
        Track 1: Recon &amp; Footprinting.</p>`,
    },
  ],
};
