// 배경음악: 오른쪽 위 작은 스피커 버튼으로 켜기/끄기. 기본값은 켜짐.
// 브라우저는 사용자가 화면을 한 번 누르거나 키를 누르기 전에는 소리를 못 내게 막아요.
// 그래서 "켜짐"이면 첫 터치(또는 클릭, 키 입력) 순간 재생을 시작해요.
// 셋리스트 미리듣기가 재생되면 잠깐 멈췄다가, 미리듣기가 끝나면 다시 이어져요.
const KEY = "rapin262-bgm";
const VOLUME = 0.35;

export function initBgm() {
  const btn = document.getElementById("bgm-btn");
  if (!btn) return;
  const bar = document.querySelector(".topbar");
  const place = () => document.documentElement.style.setProperty("--band-h", (bar ? bar.offsetHeight : 32) + "px");
  place(); addEventListener("resize", place);
  const audio = new Audio("assets/audio/bgm.mp3");
  audio.loop = true;
  audio.preload = "auto";   // 들어오자마자 미리 받아 둬서 누르는 순간 바로 나오게
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
    try { localStorage.setItem(KEY, want ? "on" : "off"); } catch (err) {}
    if (want && !ducked) play(); else audio.pause();
    sync();
  });

  // 1) 들어오자마자 바로 재생을 시도해요. 브라우저가 허락하면(자주 방문한 사이트 등) 바로 나와요.
  if (want) audio.play().then(() => { off(); sync(); }).catch(() => {});
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
}
