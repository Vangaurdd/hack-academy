/* ============================================================
   Hack Academy — shared engine
   Renders four challenge kinds (terminal / webapp / answer /
   reading), tracks progress in localStorage, checks flags.
   All level content is authored by us — the only place raw
   innerHTML is used is with that trusted content. Anything
   that echoes what a *visitor* types goes through textContent.
   ============================================================ */

window.__academySecret = "FLAG{devtools_console_basics}";

const HA = (() => {
  const STORAGE_KEY = "hackacademy_progress_v1";
  const REGISTRY = window.HACKACADEMY_TRACKS || (window.HACKACADEMY_TRACKS = {});

  // ---------- progress ----------
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
  function isDone(levelId) {
    return !!loadProgress()[levelId];
  }
  function markDone(levelId) {
    const p = loadProgress();
    if (!p[levelId]) { p[levelId] = true; saveProgress(p); }
  }
  function resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ---------- track/level lookup ----------
  function allTracks() {
    return Object.values(REGISTRY).sort((a, b) => a.order - b.order);
  }
  function getTrack(trackId) { return REGISTRY[trackId]; }
  function getLevel(trackId, levelId) {
    const t = getTrack(trackId);
    return t && t.levels.find((l) => l.id === levelId);
  }
  function trackStats(trackId) {
    const t = getTrack(trackId);
    if (!t) return { done: 0, total: 0 };
    const done = t.levels.filter((l) => isDone(l.id)).length;
    return { done, total: t.levels.length };
  }
  function overallStats() {
    const tracks = allTracks();
    let done = 0, total = 0;
    tracks.forEach((t) => { total += t.levels.length; done += t.levels.filter((l) => isDone(l.id)).length; });
    return { done, total };
  }

  // ---------- flags ----------
  function decodeFlag(b64) {
    try { return decodeURIComponent(escape(atob(b64))); }
    catch { return ""; }
  }
  function checkFlag(level, input) {
    const expected = decodeFlag(level.flag);
    return input.trim() === expected;
  }

  // ---------- small dom helpers ----------
  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function qs(root, sel) { return root.querySelector(sel); }
  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  // ---------- terminal emulator ----------
  function resolvePath(fs, cwd, target) {
    let parts;
    if (target.startsWith("/")) parts = target.split("/").filter(Boolean);
    else parts = cwd.concat(target.split("/").filter(Boolean));
    const clean = [];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") clean.pop();
      else clean.push(p);
    }
    let node = fs;
    for (const p of clean) {
      if (node && typeof node === "object" && node.__dir && p in node.__dir) node = node.__dir[p];
      else return { node: null, path: clean };
    }
    return { node, path: clean };
  }
  function dir(children) { return { __dir: children }; }

  function renderTerminal(container, spec) {
    container.innerHTML = "";
    const wrap = h(`<div class="term">
      <div class="term-output" role="log" aria-live="polite"></div>
      <div class="term-input-row">
        <span class="term-prompt">${spec.promptLabel || "user@target"}:$</span>
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="terminal input" />
      </div>
    </div>`);
    container.appendChild(wrap);
    const output = qs(wrap, ".term-output");
    const input = qs(wrap, "input");
    let cwd = (spec.cwd || "/home/user").split("/").filter(Boolean);
    const fs = spec.fs;
    const history = [];
    let histIdx = -1;

    function print(text, cls) {
      const line = document.createElement("div");
      if (cls) line.className = cls;
      line.textContent = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
    function printBlock(text, cls) {
      text.split("\n").forEach((l) => print(l, cls));
    }

    const builtins = {
      help(args) {
        const extra = Object.keys(spec.commands || {}).join(", ");
        print("built-in: ls, cd, pwd, cat, find, grep, clear, whoami, id, echo", "ln-dim");
        if (extra) print("available: " + extra, "ln-dim");
      },
      pwd() { print("/" + cwd.join("/")); },
      whoami() { print(spec.whoami || "user"); },
      id() { print(spec.id || "uid=1000(user) gid=1000(user) groups=1000(user)"); },
      clear() { output.innerHTML = ""; },
      echo(args) { print(args.join(" ")); },
      ls(args) {
        const target = args[0] || ".";
        const { node } = resolvePath(fs, cwd, target);
        if (!node || !node.__dir) { print(`ls: cannot access '${target}': No such file or directory`, "ln-err"); return; }
        const names = Object.keys(node.__dir).map((k) => (node.__dir[k].__dir ? k + "/" : k));
        print(names.join("  ") || "(empty)");
      },
      cd(args) {
        const target = args[0] || "/home/user";
        const { node, path } = resolvePath(fs, cwd, target);
        if (!node || !node.__dir) { print(`cd: no such file or directory: ${target}`, "ln-err"); return; }
        cwd = path;
      },
      cat(args) {
        if (!args[0]) { print("cat: missing operand", "ln-err"); return; }
        const { node } = resolvePath(fs, cwd, args[0]);
        if (node == null) { print(`cat: ${args[0]}: No such file or directory`, "ln-err"); return; }
        if (node.__dir) { print(`cat: ${args[0]}: Is a directory`, "ln-err"); return; }
        printBlock(String(node));
      },
      find(args) {
        const pattern = (args.find((a) => a.includes("*")) || args[args.length - 1] || "*").replace(/\*/g, ".*");
        const re = new RegExp("^" + pattern + "$", "i");
        const hits = [];
        (function walk(node, path) {
          if (!node || !node.__dir) return;
          for (const name of Object.keys(node.__dir)) {
            const full = path.concat(name);
            if (re.test(name)) hits.push("/" + full.join("/"));
            walk(node.__dir[name], full);
          }
        })(fs, []);
        printBlock(hits.join("\n") || "(no matches)");
      },
      grep(args) {
        if (args.length < 2) { print("usage: grep PATTERN FILE", "ln-err"); return; }
        const pattern = args[0];
        const { node } = resolvePath(fs, cwd, args[1]);
        if (node == null || node.__dir) { print(`grep: ${args[1]}: No such file`, "ln-err"); return; }
        const lines = String(node).split("\n").filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
        printBlock(lines.join("\n") || "(no matches)");
      },
    };

    function run(raw) {
      print((spec.promptLabel || "user@target") + ":$ " + raw, "ln-cmd");
      const args = raw.trim().split(/\s+/).filter(Boolean);
      if (!args.length) return;
      const cmd = args.shift();
      if (spec.commands && spec.commands[cmd]) {
        const result = spec.commands[cmd](args, { cwd: "/" + cwd.join("/"), print, fs });
        if (typeof result === "string") printBlock(result);
        return;
      }
      if (builtins[cmd]) { builtins[cmd](args); return; }
      print(`command not found: ${cmd} (try 'help')`, "ln-err");
    }

    if (spec.banner) printBlock(spec.banner, "ln-dim");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = input.value;
        input.value = "";
        if (val.trim()) { history.push(val); histIdx = history.length; }
        run(val);
      } else if (e.key === "ArrowUp") {
        if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
        else { histIdx = history.length; input.value = ""; }
        e.preventDefault();
      }
    });
    wrap.addEventListener("click", () => input.focus());
    return wrap;
  }

  // ---------- webapp sandbox ----------
  function renderWebapp(container, spec) {
    container.innerHTML = "";
    const wrap = h(`<div class="sandbox-frame-wrap">
      <iframe sandbox="allow-scripts allow-forms" title="vulnerable sandbox"></iframe>
      <div class="sandbox-toolbar">
        <button type="button" class="btn btn-ghost" data-reset>&#8635; Reset sandbox</button>
      </div>
    </div>`);
    container.appendChild(wrap);
    const iframe = qs(wrap, "iframe");
    if (spec.height) iframe.style.height = spec.height + "px";
    function load() { iframe.srcdoc = spec.srcdoc; }
    load();
    qs(wrap, "[data-reset]").addEventListener("click", load);
  }

  // ---------- answer-type (decode/analyze) ----------
  function renderAnswerTools(container, tools) {
    container.innerHTML = "";
    const wrap = h(`<div class="answer-tools">
      <textarea rows="3" placeholder="Scratchpad — paste text here to transform" aria-label="scratchpad"></textarea>
      <div class="sandbox-toolbar" style="padding-left:0;"></div>
      <div class="term-output" style="height:120px;"></div>
    </div>`);
    container.appendChild(wrap);
    const area = qs(wrap, "textarea");
    const btnRow = qs(wrap, ".sandbox-toolbar");
    const log = qs(wrap, ".term-output");
    tools.forEach((tool) => {
      const btn = h(`<button type="button" class="btn btn-ghost">${tool.label}</button>`);
      btn.addEventListener("click", () => {
        let result;
        try { result = tool.fn(area.value); }
        catch (e) { result = "error: " + e.message; }
        const line = document.createElement("div");
        line.className = "ln-dim";
        line.textContent = "> " + tool.label + " → " + result;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
        area.value = result;
      });
      btnRow.appendChild(btn);
    });
    return wrap;
  }

  // ---------- level workspace ----------
  function renderWorkspace(container, track, level) {
    container.innerHTML = "";

    const header = h(`<div class="level-header">
      <span class="eyebrow">${track.title} • ${level.difficulty}</span>
      <h1></h1>
      <div class="level-tags"></div>
    </div>`);
    qs(header, "h1").textContent = level.title;
    (level.tags || []).forEach((tag) => {
      header.querySelector(".level-tags").appendChild(h(`<span class="chip">${tag}</span>`));
    });
    container.appendChild(header);

    const briefing = h(`<div class="panel"><div class="panel-head"><span>Briefing</span></div><div class="panel-body"></div></div>`);
    qs(briefing, ".panel-body").innerHTML = level.briefing;
    container.appendChild(briefing);

    if (level.type !== "reading") {
      const sandboxPanel = h(`<div class="panel"><div class="panel-head"><span>${
        level.type === "terminal" ? "Terminal" : level.type === "webapp" ? "Target sandbox" : "Evidence"
      }</span></div><div class="panel-body flush"></div></div>`);
      const body = qs(sandboxPanel, ".panel-body");
      if (level.type === "terminal") renderTerminal(body, level.terminal);
      if (level.type === "webapp") renderWebapp(body, level.webapp);
      if (level.type === "answer") {
        body.classList.remove("flush");
        body.innerHTML = level.answer.artifactHtml || "";
        if (level.answer.tools) {
          const toolHost = document.createElement("div");
          body.appendChild(toolHost);
          renderAnswerTools(toolHost, level.answer.tools);
        }
      }
      container.appendChild(sandboxPanel);

      if (level.hints && level.hints.length) {
        const hintsPanel = h(`<div class="panel"><div class="panel-head"><span>Hints</span></div><div class="panel-body flush"></div></div>`);
        const hbody = qs(hintsPanel, ".panel-body");
        level.hints.forEach((hint, i) => {
          const row = h(`<div class="hint">
            <button type="button" class="hint-toggle"><span>Hint ${i + 1}</span><span>+</span></button>
            <div class="hint-body"></div>
          </div>`);
          qs(row, ".hint-body").innerHTML = hint;
          const toggle = qs(row, ".hint-toggle");
          toggle.addEventListener("click", () => {
            const body = qs(row, ".hint-body");
            body.classList.toggle("open");
            toggle.querySelector("span:last-child").textContent = body.classList.contains("open") ? "−" : "+";
          });
          hbody.appendChild(row);
        });
        container.appendChild(hintsPanel);
      }

      const flagPanel = h(`<div class="panel">
        <div class="panel-head"><span>Submit flag</span></div>
        <div class="panel-body">
          <div class="flag-row">
            <input type="text" placeholder="FLAG{...}" aria-label="flag" />
            <button type="button" class="btn btn-primary">Submit</button>
          </div>
          <div class="flag-feedback" role="status"></div>
        </div>
      </div>`);
      container.appendChild(flagPanel);

      const debriefPanel = h(`<div class="panel debrief" style="display:none;">
        <div class="panel-head"><span>&#10003; Debrief &amp; remediation</span></div>
        <div class="panel-body"></div>
      </div>`);
      qs(debriefPanel, ".panel-body").innerHTML = level.debrief;
      container.appendChild(debriefPanel);

      function reveal() {
        debriefPanel.style.display = "";
        markDone(level.id);
        document.dispatchEvent(new CustomEvent("ha:levelsolved", { detail: { levelId: level.id } }));
      }
      if (isDone(level.id)) reveal();

      const input = qs(flagPanel, "input");
      const feedback = qs(flagPanel, ".flag-feedback");
      function attempt() {
        const val = input.value;
        if (!val.trim()) return;
        if (checkFlag(level, val)) {
          feedback.textContent = "✓ Correct — sandbox cleared.";
          feedback.className = "flag-feedback ok";
          reveal();
        } else {
          feedback.textContent = "✗ Not quite. Re-check the sandbox output, or open a hint.";
          feedback.className = "flag-feedback bad";
        }
      }
      qs(flagPanel, "button").addEventListener("click", attempt);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") attempt(); });
    } else {
      const markRow = h(`<div class="mark-complete-row">
        <button type="button" class="btn btn-primary">Mark as read</button>
        <span class="eyebrow" data-status></span>
      </div>`);
      function refresh() {
        const done = isDone(level.id);
        markRow.querySelector("[data-status]").textContent = done ? "✓ completed" : "";
        markRow.querySelector("button").textContent = done ? "Mark as unread" : "Mark as read";
      }
      markRow.querySelector("button").addEventListener("click", () => {
        const p = loadProgress();
        if (p[level.id]) delete p[level.id]; else p[level.id] = true;
        saveProgress(p);
        refresh();
        document.dispatchEvent(new CustomEvent("ha:levelsolved", { detail: { levelId: level.id } }));
      });
      refresh();
      container.appendChild(markRow);
    }
  }

  return {
    allTracks, getTrack, getLevel, trackStats, overallStats,
    isDone, markDone, resetAllProgress,
    decodeFlag, checkFlag, dir, renderWorkspace, h, qs, qsa,
  };
})();
