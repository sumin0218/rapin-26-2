// 진입점: 데이터 불러오기 → 언어 적용 → 순서표 그리기 → 포스터 모션 시작
import { loadJSON } from "./data.js?v=11221451";
import { initI18n, t, getLang, onLangChange } from "./i18n.js";
import { renderInfo } from "./sections/info.js?v=11221451";
import { renderProgram } from "./sections/program.js?v=11221451";
import { initPoster } from "./motion/poster.js?v=11221451";
import { initPanels } from "./sections/panels.js?v=11221451";
import { initBgm } from "./bgm.js?v=11221451";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) document.documentElement.classList.add("reduced");

// 상단 띠 글자: 화면 폭에 맞춰 가능한 크게 (넘치면 한 단계씩 줄여요)
function fitBand() {
  const b = document.querySelector(".band");
  if (!b) return;
  b.style.fontSize = "";
  let fs = parseFloat(getComputedStyle(b).fontSize);
  while (b.scrollWidth > b.clientWidth + 1 && fs > 9) { fs -= 0.5; b.style.fontSize = fs + "px"; }
}
addEventListener("resize", fitBand);

async function start() {
  const [concert, setlist] = await Promise.all([
    loadJSON("data/concert.json"),
    loadJSON("data/setlist.json"),
  ]);

  await initI18n();

  const draw = () => {
    renderInfo(concert, getLang());
    renderProgram(setlist, getLang(), t);
  };
  draw();
  fitBand();
  onLangChange(() => { draw(); fitBand(); });

  // GSAP은 defer로 불러와서, 모듈이 실행될 때 이미 준비돼 있어요
  initPoster();
  initPanels();
  initBgm();
}

start().catch((err) => {
  console.error(err);
  document.getElementById("setlist").textContent = "순서표를 불러오지 못했어요. 새로고침해 주세요.";
});
