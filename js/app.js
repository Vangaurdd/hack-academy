(function () {
  // ---------- boot sequence ----------
  const bootLines = [
    "academy@sandbox:~$ whoami",
    "guest",
    "academy@sandbox:~$ cat /etc/motto",
    '"Break it safely here, so you can break it responsibly out there."',
    "academy@sandbox:~$ ./init --tracks=7 --levels=22",
    "[ok] recon & footprinting",
    "[ok] injection",
    "[ok] cross-site scripting",
    "[ok] auth & access control",
    "[ok] csrf & ssrf",
    "[ok] crypto & client-side",
    "[ok] bug bounty methodology",
    "academy@sandbox:~$ _",
  ];
  const bootEl = document.getElementById("boot-body");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (bootEl) {
    if (reduceMotion) {
      bootEl.textContent = bootLines.join("\n");
    } else {
      let i = 0;
      function next() {
        if (i >= bootLines.length) return;
        const line = document.createElement("div");
        line.textContent = bootLines[i];
        if (bootLines[i].startsWith("[ok]")) line.className = "dim";
        bootEl.appendChild(line);
        i++;
        setTimeout(next, i <= 4 ? 260 : 130);
      }
      next();
    }
  }

  // ---------- track grid ----------
  const grid = document.getElementById("track-grid");
  function statusChip(done, total) {
    if (done === 0) return `<span class="chip">Not started</span>`;
    if (done === total) return `<span class="chip chip-cleared">Cleared</span>`;
    return `<span class="chip chip-progress">In progress</span>`;
  }
  function render() {
    grid.innerHTML = "";
    const tracks = HA.allTracks();
    tracks.forEach((track, idx) => {
      const { done, total } = HA.trackStats(track.id);
      const pct = total ? Math.round((done / total) * 100) : 0;
      const card = document.createElement("a");
      card.href = `track.html?t=${track.id}`;
      card.className = "track-card";
      card.style.setProperty("--cat", track.color);
      card.innerHTML = `
        <div class="track-card-top">
          <span class="track-index">TRACK ${String(idx + 1).padStart(2, "0")}</span>
          ${statusChip(done, total)}
        </div>
        <h3>${track.title}</h3>
        <p class="desc">${track.description}</p>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-meta"><span>${done}/${total} complete</span><span>${track.category}</span></div>
      `;
      grid.appendChild(card);
    });
    const overall = HA.overallStats();
    document.getElementById("overall-progress").textContent = `${overall.done}/${overall.total} levels cleared`;
  }
  render();
  document.addEventListener("ha:levelsolved", render);

  // ---------- reset progress ----------
  const resetLink = document.getElementById("reset-link");
  if (resetLink) {
    resetLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Reset all progress? This clears every completed level from this browser.")) {
        HA.resetAllProgress();
        render();
      }
    });
  }
})();
