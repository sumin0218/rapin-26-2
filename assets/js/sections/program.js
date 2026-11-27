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

// 영문 전용 포스터 글씨(Bungee)와 한글/한자가 섞일 때, 한글/한자는 굵은 Pretendard로 따로 감싸요
function mixed(cls, text) {
  const e = el("b", cls);
  for (const part of String(text).split(/([^\x00-\x7F]+)/)) {
    if (!part) continue;
    if (/[^\x00-\x7F]/.test(part)) e.append(el("span", "nl", part));
    else e.append(document.createTextNode(part));
  }
  return e;
}

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

  // 공개 전: 공개 시각 카드 + 카운트다운 (곡 데이터는 아예 올리지 않아요)
  if (setlist.released === false) { renderSoon(root, setlist, t); return; }
  let no = 0;

  setlist.parts.forEach((part, pi) => {
    const sec = el("section", "part p" + (pi + 1));
    const name = t("part").replace("{n}", pi + 1);
    sec.setAttribute("aria-label", name);

    const head = el("div", "part-head");
    head.append(mixed("tape t" + pi, name), mixed("cnt", t("songs").replace("{n}", part.songs.length)));
    sec.append(head);

    const list = el("ol", "cues");
    part.songs.forEach((s, si) => {
      // 세 곡마다 MC 멘트 구간 (부의 마지막 곡 뒤에는 없음)
      if (si > 0 && si % 3 === 0) {
        const mc = el("li", "mc-seg");
        mc.append(el("span", null, "MC SEGMENT"));
        list.append(mc);
      }
      no += 1;
      const li = el("li", "cue");
      li.append(el("span", "no", String(no).padStart(2, "0")));

      const song = el("div", "song");
      // 윗줄: 제목, 무대 종류 표시, 크레딧 (PC에선 한 줄로, 모바일에선 세로로)
      const top = el("div", "top");
      top.append(el("b", "title", s.title));
      for (const tg of s.tags || []) {
        const label = tg === "sd" ? "STREET DANCE" : tg === "cover" ? "COVER" : tg.toUpperCase();
        top.append(el("span", "tag tag-" + tg, label));
      }
      if (s.credit) top.append(el("small", "credit", typeof s.credit === "object" ? s.credit[lang] ?? s.credit.ko : s.credit));
      song.append(top);
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
    root.append(sec);
    // 1부와 2부 사이 쉬는 시간
    if (pi < setlist.parts.length - 1) {
      const im = el("div", "intermission");
      im.setAttribute("role", "separator");
      im.setAttribute("aria-label", "INTERMISSION · " + t("intermission"));
      im.append(el("b", null, "INTERMISSION"), el("small", null, t("intermission")));
      root.append(im);
    }
  });
}

// ───── 공개 전 카드 ─────
let cdTimer = 0;
function renderSoon(root, setlist, t) {
  clearInterval(cdTimer);
  const card = el("section", "part soon");
  const head = el("div", "part-head");
  head.append(el("b", "tape", t("soonKicker")));
  card.append(head);
  const body = el("div", "soon-body");
  const when = el("p", "soon-when");
  const side = el("span", "side");
  side.append(el("small", null, t("soonOpen")), el("span", null, "FRI 22:00"));
  when.append(el("b", null, "11.27"), side);
  body.append(when);
  const cd = el("div", "soon-cd");
  cd.setAttribute("aria-hidden", "true");
  const units = ["cdD", "cdH", "cdM", "cdS"].map((k) => {
    const u = el("div", "u"); const n = el("b", null, "--"); u.append(n, el("small", null, t(k))); cd.append(u); return n;
  });
  body.append(cd);
  card.append(body);
  root.append(card);

  const at = Date.parse(setlist.revealAt || "2026-11-27T22:00:00+09:00");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((at - Date.now()) / 1000));
    if (s === 0) { cd.replaceWith(el("p", "soon-done", t("soonDone"))); clearInterval(cdTimer); return; }
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    [d, h, m, s].forEach((v, i) => { units[i].textContent = i === 0 ? String(v) : pad(v); });
  };
  tick();
  cdTimer = setInterval(tick, 1000);
}
