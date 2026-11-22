// 셋리스트 그리기: data/setlist.json → #setlist
// 1차 리허설 큐시트처럼: 부마다 카드 한 장, 머리에 테이프 라벨
// 한 줄 = 순서 | 제목, 크레딧, 아티스트 | 미리듣기 알약 버튼 (재생하면 안이 차올라요)
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
  const was = !!playingBtn;
  audio.pause();
  cancelAnimationFrame(raf);
  if (playingBtn) setBtn(playingBtn, "idle");
  playingBtn = null;
  if (was) dispatchEvent(new Event("preview:stop"));
}

function toggle(btn) {
  if (playingBtn === btn) { stop(); return; }
  stop();
  dispatchEvent(new Event("preview:play"));
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
    head.append(el("b", "tape t" + pi, name), el("span", "cnt", t("songs").replace("{n}", part.songs.length)));
    sec.append(head);

    const list = el("ol", "cues");
    part.songs.forEach((s) => {
      no += 1;
      const li = el("li", "cue");
      li.append(el("span", "no", String(no).padStart(2, "0")));

      const song = el("div", "song");
      song.append(el("b", "title", s.title));
      if (s.credit) song.append(el("small", "credit", typeof s.credit === "object" ? s.credit[lang] ?? s.credit.ko : s.credit));
      const names = (s.artists || []).map((a) => (typeof a === "object" ? a[lang] ?? a.ko : a));
      song.append(el("small", "artists", names.length ? names.join(", ") : t("tba")));
      li.append(song);

      if (s.preview) {
        const b = el("button", "pv");
        b.type = "button";
        b.dataset.src = s.preview;
        b.dataset.title = s.title;
        b.dataset.playLabel = t("previewPlay");
        b.dataset.stopLabel = t("previewStop");
        b.innerHTML = '<span class="fill" aria-hidden="true"></span><span class="ic" aria-hidden="true"></span><span class="lb" aria-hidden="true"></span>';
        b.querySelector(".lb").textContent = t("preview");
        b.addEventListener("click", () => toggle(b));
        li.append(b);
        setBtn(b, "idle");
      }
      list.append(li);
    });

    sec.append(list);
    // 테두리 위에서 반짝이는 별 몇 개 (자리와 박자는 매번 조금씩 달라요)
    for (let i = 0; i < 6; i++) {
      const k = el("i", "spk");
      const edge = i % 4, at = 8 + Math.random() * 84;
      k.style.cssText = edge === 0 ? `left:${at}%;top:0` : edge === 1 ? `right:0;top:${at}%` : edge === 2 ? `left:${at}%;bottom:0` : `left:0;top:${at}%`;
      k.style.setProperty("--d", (Math.random() * 3.2).toFixed(2) + "s");
      k.style.setProperty("--s", (0.6 + Math.random() * 0.7).toFixed(2));
      k.setAttribute("aria-hidden", "true");
      sec.append(k);
    }
    root.append(sec);
  });
}
