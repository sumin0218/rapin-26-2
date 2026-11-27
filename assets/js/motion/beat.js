// 배경음악 킥에 맞춰 SAGGING 2026 로고가 아주 살짝 커졌다 돌아와요.
// 킥 위치는 bgm.mp3 를 미리 분석해 둔 data/bgm-kicks.json 을 써요.
// (실시간 소리 분석은 아이폰에서 음악이 끊길 수 있어서 쓰지 않아요)
// 음악이 재생 중일 때만 움직이고, 멈추면 원래 크기로 돌아와요.
const AMOUNT = 0.028;   // 가장 센 킥에서 커지는 정도 (2.8%)
const DECAY = 0.13;     // 커졌다가 돌아오는 빠르기 (초)
const LATENCY = 0.02;   // 스피커 지연 보정 (초)

export async function initBeat(audio) {
  if (!audio || (window.RAPIN_LITE || matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  let kicks;
  try { kicks = await (await fetch("data/bgm-kicks.json")).json(); } catch (e) { return; }
  const T = kicks.t, A = kicks.a;
  const targets = () => [...document.querySelectorAll('.L[data-id^="logo"] .Lh')];
  let els = targets();
  els.forEach((el) => { el.style.transformOrigin = "50% 32%"; el.style.willChange = "transform"; });

  let raf = 0, i = 0, lastT = 0;
  const set = (s) => { const v = s === 1 ? "" : `scale(${s.toFixed(4)})`; for (const el of els) el.style.transform = v; };

  function frame() {
    raf = 0;
    if (audio.paused || document.hidden) { set(1); return; }
    if (!els.length || !els[0].isConnected) els = targets();
    const t = audio.currentTime - LATENCY;
    if (t < lastT) i = 0;           // 처음으로 돌아갔을 때(반복 재생)
    lastT = t;
    while (i + 1 < T.length && T[i + 1] <= t) i++;
    const dt = t - T[i];
    const env = dt >= 0 && dt < 0.6 ? (A[i] ?? 1) * Math.exp(-dt / DECAY) : 0;
    set(1 + AMOUNT * Math.min(1, env));
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  audio.addEventListener("play", start);
  audio.addEventListener("playing", start);
  audio.addEventListener("seeked", () => { i = 0; lastT = 0; });
  if (!audio.paused) start();
}
