// 배경음악: 오른쪽 위 작은 스피커 버튼으로 켜기/끄기. 기본값은 켜짐.
// 브라우저는 사용자가 화면을 한 번 누르거나 키를 누르기 전에는 소리를 못 내게 막아요.
// 그래서 "켜짐"이면 첫 터치(또는 클릭, 키 입력) 순간 재생을 시작해요.
// 셋리스트 미리듣기가 재생되면 잠깐 멈췄다가, 미리듣기가 끝나면 다시 이어져요.
const KEY = "rapin262-bgm";
const VOLUME = 0.35;

export function initBgm() {
  const btn = document.getElementById("bgm-btn");
  if (!btn) return null;
  const bar = document.querySelector(".topbar");
  const place = () => document.documentElement.style.setProperty("--band-h", (bar ? bar.offsetHeight : 32) + "px");
  place(); addEventListener("resize", place);
  const audio = new Audio("assets/audio/bgm.mp3");
  audio.loop = true;
  // PC는 미리 받아 두고, 폰은 재생할 때 받기 (메모리·데이터 아끼기)
  audio.preload = matchMedia("(hover: none), (max-width: 1099px)").matches ? "none" : "auto";
  audio.volume = VOLUME;

  let want = true;
  try { want = localStorage.getItem(KEY) !== "off"; } catch (e) {}
  let ducked = false;

  const sync = () => {
    const on = !audio.paused;
    btn.setAttribute("aria-pressed", want ? "true" : "false");
    btn.classList.toggle("is-on", want);
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-label", btn.dataset[want ? "labelOff" : "labelOn"] || (want ? "배경음악 끄기" : "배경음악 켜기"));
  };
  const play = () => audio.play().then(sync).catch(sync);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    want = !want;
    window.track?.("bgm_toggle", { on: want });
    try { localStorage.setItem(KEY, want ? "on" : "off"); } catch (err) {}
    if (want && !ducked) play(); else audio.pause();
    sync();
  });

  // 1) 로딩창이 걷히고 포스터가 등장하는 순간 재생을 시도해요. 브라우저가 허락하면(자주 방문한 사이트 등) 바로 나와요.
  const tryStart = () => { if (want && !ducked && audio.paused) audio.play().then(() => { off(); sync(); }).catch(() => {}); };
  if (document.querySelector(".poster .stage.ready")) tryStart();
  else addEventListener("poster:show", tryStart, { once: true });
  // 2) 막혔으면 첫 사용자 동작에서 시작 (스크롤만으로는 브라우저가 소리를 허락하지 않아요)
  const first = (e) => {
    if (e.target.closest && e.target.closest("#bgm-btn")) { off(); return; }
    if (!audio.paused) { off(); return; }
    if (want && !ducked) audio.play().then(() => { off(); sync(); }).catch(() => {});
  };
  const evs = ["pointerdown", "mousedown", "keydown", "touchend", "click"];
  function off() { evs.forEach((ev) => removeEventListener(ev, first, true)); }
  evs.forEach((ev) => addEventListener(ev, first, true));

  // 미리듣기와 겹치지 않게
  addEventListener("preview:play", () => { ducked = true; audio.pause(); sync(); });
  addEventListener("preview:stop", () => { ducked = false; if (want) play(); else sync(); });
  // 다른 탭으로 가면 멈추고, 돌아오면 이어서
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (want && !ducked && audio.currentTime > 0) play();
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  sync();
  initEgg(audio, () => { want = true; ducked = false; play(); });
  return audio;
}

// 이스터 에그: 메인 포스터의 lil donggyu를 빠르게 세 번 누르면 BGM이 바뀌어요 (한 번 더 세 번 누르면 원래대로)
// 포스터 레이어들이 겹쳐 있어서, 누른 자리가 실제로 동규 그림(투명하지 않은 픽셀) 위인지 직접 확인해요.
function initEgg(audio, start) {
  const SRC = ["assets/audio/bgm.mp3", "assets/audio/pepper.mp3"];
  let alt = false, taps = [], cv = null, ctx = null;
  const hitDonggyu = (x, y) => {
    const img = document.querySelector('.L[data-id="lildonggyu"] .Lh img');
    if (!img || !img.complete || !img.naturalWidth) return false;
    const r = img.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom || !r.width) return false;
    let u = (x - r.left) / r.width; const v = (y - r.top) / r.height;
    if (getComputedStyle(img.parentElement).transform.startsWith("matrix(-")) u = 1 - u;   // 좌우 뒤집힘
    try {
      if (!cv) { cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        ctx = cv.getContext("2d", { willReadFrequently: true }); ctx.drawImage(img, 0, 0); }
      return ctx.getImageData(Math.floor(u * (cv.width - 1)), Math.floor(v * (cv.height - 1)), 1, 1).data[3] > 40;
    } catch (e) { return true; }
  };
  addEventListener("pointerdown", (e) => {
    // 포스터를 직접 누른 경우만 (공연 정보·아티스트 소개 같은 창이 위에 떠 있을 땐 무시)
    const onPoster = e.target.closest && e.target.closest("#poster") && !e.target.closest(".lineup.is-shown, a, button");
    const hh = onPoster && !document.querySelector(".panel:not([hidden]), .artist-card:not([hidden])") && hitDonggyu(e.clientX, e.clientY);
    if (!hh) { taps = []; return; }
    const now = performance.now();
    taps = taps.filter((t) => now - t < 2000); taps.push(now);
    if (taps.length < 3) { bubble(e.clientX, e.clientY, 3 - taps.length, alt); return; }
    taps = [];
    document.querySelector(".egg-bubble")?.remove();
    alt = !alt;
    window.track?.("easter_egg", { on: alt });
    if (alt) pepperRing(); else document.querySelector(".pep-ring")?.remove();
    audio.src = SRC[alt ? 1 : 0] + "?v=11272003";
    audio.currentTime = 0;
    start();
  }, true);
}

// 닥터 페퍼 캔 여러 개가 화면 가운데를 중심으로 원을 그리며 돌다가 사라져요
function pepperRing() {
  document.querySelector(".pep-ring")?.remove();
  if ((window.RAPIN_LITE || matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  const w = innerWidth, h = innerHeight;
  const cw = Math.round(Math.max(38, Math.min(78, Math.min(w, h) * 0.11)));
  const r = Math.min(w, h) / 2 - cw * 0.55;              // 화면 가장자리를 따라 감싸는 원
  const n = Math.max(10, Math.min(18, Math.round((2 * Math.PI * r) / (cw * 1.9))));
  const ring = document.createElement("div");
  ring.className = "pep-ring"; ring.setAttribute("aria-hidden", "true");
  ring.style.cssText = `--cw:${cw}px;--r:${r}px`;
  const spin = document.createElement("div"); spin.className = "pr-spin";
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div"); c.className = "pr-can";
    c.style.cssText = `--a:${(360 / n) * i}deg;--d:${(i * 0.06).toFixed(2)}s`;
    const img = document.createElement("img"); img.src = "assets/img/drpepper.webp"; img.alt = ""; img.decoding = "async";
    c.append(img); spin.append(c);
  }
  ring.append(spin); document.body.append(ring);
  setTimeout(() => { ring.classList.add("out"); setTimeout(() => ring.remove(), 650); }, 7000);
}

// 동규를 누르면 말풍선으로 몇 번 더 누르라고 알려줘요
function bubble(x, y, left, alt) {
  const lang = (document.documentElement.lang || "ko").slice(0, 2);
  const T = {
    ko: [left === 2 ? "나 눌렀어? 2번 더 눌러봐" : "1번 더!!", "원래 노래로? 1번 더"],
    en: [left === 2 ? "Psst… tap me 2 more times" : "1 more!!", "Back to normal? 1 more"],
    zh: [left === 2 ? "点到我了？再点2下" : "再点1下!!", "换回原曲？再点1下"],
  }[lang] || [];
  const text = alt && left === 1 ? T[1] : T[0];
  let b = document.querySelector(".egg-bubble");
  if (!b) { b = document.createElement("div"); b.className = "egg-bubble"; b.setAttribute("role", "status"); document.body.append(b); }
  b.textContent = text;
  const w = Math.min(220, innerWidth - 24);
  b.style.left = Math.max(12, Math.min(innerWidth - w - 12, x - w / 2)) + "px";
  b.style.top = Math.max(50, y - 70) + "px";
  b.style.maxWidth = w + "px";
  b.style.setProperty("--tx", (x - Math.max(12, Math.min(innerWidth - w - 12, x - w / 2))) + "px");
  b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
  clearTimeout(b._t); b._t = setTimeout(() => b.remove(), 2000);
}
