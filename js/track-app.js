(function () {
  function params() { return new URLSearchParams(location.search); }

  function currentTrack() {
    const id = params().get("t") || "foundations";
    return HA.getTrack(id) || HA.allTracks()[0];
  }

  function pickLevel(track) {
    const requested = params().get("l");
    if (requested) {
      const found = track.levels.find((l) => l.id === requested);
      if (found) return found;
    }
    const firstUndone = track.levels.find((l) => !HA.isDone(l.id));
    return firstUndone || track.levels[0];
  }

  function navigate(trackId, levelId) {
    const url = `track.html?t=${trackId}&l=${levelId}`;
    history.pushState({ trackId, levelId }, "", url);
    render();
  }

  function renderRail(track, activeLevel) {
    document.getElementById("track-eyebrow").textContent = `Track ${String(track.order).padStart(2, "0")} — ${track.category}`;
    document.getElementById("track-title").textContent = track.title;
    const list = document.getElementById("level-list");
    list.innerHTML = "";
    track.levels.forEach((level) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `track.html?t=${track.id}&l=${level.id}`;
      a.className = "level-item" + (level.id === activeLevel.id ? " active" : "") + (HA.isDone(level.id) ? " done" : "");
      a.innerHTML = `<span class="mark">${HA.isDone(level.id) ? "&#10003;" : ""}</span><span></span>`;
      a.querySelector("span:last-child").textContent = level.title;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(track.id, level.id);
      });
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  let activeTrackId = null;
  let activeLevelId = null;

  function render() {
    const track = currentTrack();
    const level = pickLevel(track);
    activeTrackId = track.id;
    activeLevelId = level.id;
    renderRail(track, level);
    const main = document.getElementById("workspace-main");
    HA.renderWorkspace(main, track, level);
    document.title = `${level.title} — ${track.title} — Hack Academy`;
  }

  document.addEventListener("ha:levelsolved", () => {
    if (!activeTrackId) return;
    const track = HA.getTrack(activeTrackId);
    const level = track.levels.find((l) => l.id === activeLevelId) || track.levels[0];
    renderRail(track, level);
  });

  window.addEventListener("popstate", render);
  render();
})();
