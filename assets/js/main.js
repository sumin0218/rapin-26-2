// 진입점: 데이터 불러오기 → 언어 적용 → 순서표 그리기 → 포스터 모션 시작
import { loadJSON } from "./data.js?v=11221439";
import { initI18n, t, getLang, onLangChange } from "./i18n.js";
import { renderInfo } from "./sections/info.js?v=11221439";
import { renderProgram } from "./sections/program.js?v=11221439";
import { initPoster } from "./motion/poster.js?v=11221439";
import { initPanels } from "./sections/panels.js?v=11221439";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) document.documentElement.classList.add("reduced");

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
  onLangChange(draw);

  // GSAP은 defer로 불러와서, 모듈이 실행될 때 이미 준비돼 있어요
  initPoster();
  initPanels();
}

start().catch((err) => {
  console.error(err);
  document.getElementById("setlist").textContent = "순서표를 불러오지 못했어요. 새로고침해 주세요.";
});
