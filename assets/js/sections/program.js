// 셋리스트 그리기: data/setlist.json → #setlist
// 한 줄 = 순서 | 제목 (크레딧) | 아티스트 | 20초 미리듣기
// 미리듣기는 한 번에 한 곡만. 버튼 테두리에 진행 정도가 빙 둘러 그려져요.
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const PREVIEW_SEC = 20;

const audio = new Audio();
audio.preload = "none";
let playingBtn = null;
let raf = 0;

function setBtn(btn, state) {
  btn.dataset.state = state;
  btn.setAttribute("aria-pressed", state === "play" ? "true" : "false");
  const label = btn.dataset.title;
  btn.setAttribute("aria-label", (state === "play" ? btn.dataset.stopLabel : btn.dataset.playLabel).replace("{t}", label));
  btn.closest(".cue").classList.toggle("is-playing", state === "play" || state === "load");
  if (state === "idle") btn.style.setProperty("--p", 0);
}

function tick() {
  if (!playingBtn) return;
  const p = Math.min(1, (audio.currentTime || 0) / PREVIEW_SEC);
  playingBtn.style.setProperty("--p", p.toFixed(4));
  raf = requestAnimationFrame(tick);
}

function stop() {
  audio.pause();
  cancelAnimationFrame(raf);
  if (playingBtn) setBtn(playingBtn, "idle");
  playingBtn = null;
}

function toggle(btn) {
  if (playingBtn === btn) { stop(); return; }
  stop();
  playingBtn = btn;
  setBtn(btn, "load");
  audio.src = btn.dataset.src;
  audio.currentTime = 0;
  audio.play().then(() => {
    if (playingBtn !== btn) return;
    setBtn(btn, "play");
    tick();
  }).catch(() => { if (playingBtn === btn) stop(); });
}

audio.addEventListener("ended", stop);
audio.addEventListener("timeupdate", () => { if (audio.currentTime >= PREVIEW_SEC) stop(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });

export function renderProgram(setlist, lang, t) {
  stop();
  const root = document.getElementById("setlist");
  root.textContent = "";
  let no = 0;

  setlist.parts.forEach((part, pi) => {
    const sec = el("section", "part");
    const name = t("part").replace("{n}", pi + 1);
    sec.setAttribute("aria-label", name);

    const head = el("div", "part-head");
    head.append(el("span", "n", String(pi + 1).padStart(2, "0")), el("span", "t", name));
    sec.append(head);

    const list = el("ol", "cues");
    part.songs.forEach((s) => {
      no += 1;
      const li = el("li", "cue");
      li.append(el("span", "no", String(no).padStart(2, "0")));

      const song = el("div", "song");
      song.append(el("b", "title", s.title));
      if (s.credit) song.append(el("small", "credit", s.credit));
      li.append(song);

      const names = (s.artists || []).map((a) => (typeof a === "object" ? a[lang] ?? a.ko : a));
      li.append(el("div", "artists", names.length ? names.join(", ") : t("tba")));

      if (s.preview) {
        const b = el("button", "pv");
        b.type = "button";
        b.dataset.src = s.preview;
        b.dataset.title = s.title;
        b.dataset.playLabel = t("previewPlay");
        b.dataset.stopLabel = t("previewStop");
        b.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="trk" cx="20" cy="20" r="18.2"/><circle class="bar" cx="20" cy="20" r="18.2"/></svg><span class="ic" aria-hidden="true"></span><span class="sec" aria-hidden="true">20s</span>';
        b.addEventListener("click", () => toggle(b));
        li.append(b);
        setBtn(b, "idle");
      }
      list.append(li);
    });

    sec.append(list);
    root.append(sec);
  });
}
