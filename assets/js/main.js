// 진입점: 데이터 불러오기 → 언어 적용 → 순서표 그리기 → 포스터 모션 시작
import { loadJSON } from "./data.js?v=11251754";
import { initI18n, t, getLang, onLangChange } from "./i18n.js";
import { renderInfo } from "./sections/info.js?v=11251754";
import { renderArtists } from "./sections/artists.js?v=11251754";
import { renderProgram } from "./sections/program.js?v=11251754";
import { initPoster } from "./motion/poster.js?v=11251754";
import { initPanels } from "./sections/panels.js?v=11251754";
import { initBgm } from "./bgm.js?v=11251754";
import { initBeat } from "./motion/beat.js?v=11251754";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) document.documentElement.classList.add("reduced");

// 상단 띠: 한 줄에 다 들어가면 그대로, 넘치면 전광판처럼 끊김 없이 흘러가요
function initBand() {
  const band = document.querySelector(".band");
  if (!band) return;
  const track = band.querySelector(".band-track");
  const item = track.querySelector(".band-item");
  track.querySelectorAll(".band-clone").forEach((n) => n.remove());
  band.classList.remove("is-marquee");
  if (item.scrollWidth > band.clientWidth + 1) {
    const clone = item.cloneNode(true);
    clone.classList.add("band-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("[data-i18n]").forEach((n) => n.removeAttribute("data-i18n"));
    track.append(clone);
    band.classList.add("is-marquee");
    // 글자 길이에 맞춰 속도 일정하게 (초당 약 55px)
    band.style.setProperty("--band-dur", (item.scrollWidth / 55).toFixed(1) + "s");
  }
}
let bandTimer = 0;
addEventListener("resize", () => { clearTimeout(bandTimer); bandTimer = setTimeout(initBand, 150); });
// 처음 들어올 때 한 번 주목 (포스터 등장이 거의 끝날 즈음)
function pingBand(delay) {
  const bar = document.querySelector(".topbar");
  if (!bar || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setTimeout(() => {
    bar.classList.remove("band-ping"); void bar.offsetWidth; bar.classList.add("band-ping");
  }, delay);
}

async function start() {
  const bgm = initBgm();   // 데이터를 기다리지 않고 바로 (음악이 늦게 시작되지 않게)
  const [concert, setlist, artists] = await Promise.all([
    loadJSON("data/concert.json"),
    loadJSON("data/setlist.json"),
    loadJSON("data/artists.json"),
  ]);

  await initI18n();

  const draw = () => {
    renderInfo(concert, getLang(), t);
    renderProgram(setlist, getLang(), t);
    renderArtists(artists, setlist, getLang(), t);
  };
  draw();
  initBand();
  pingBand(2600);
  onLangChange(() => { draw(); initBand(); });

  // GSAP은 defer로 불러와서, 모듈이 실행될 때 이미 준비돼 있어요
  initPoster();
  initBeat(bgm);   // 배경음악 킥에 맞춰 로고가 살짝 들썩
  initPanels();
}

start().catch((err) => {
  console.error(err);
  document.getElementById("setlist").textContent = "순서표를 불러오지 못했어요. 새로고침해 주세요.";
});
