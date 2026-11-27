// 패널: 주소 끝 #info / #artists 에 맞춰 패널을 열고 닫아요.
// 뒤로가기로 닫히고, 링크를 공유하면 그 패널이 열린 채로 들어와요.
const MAP = { info: "info", artists: "artists" };
let current = null;
let lastFocus = null;
const PHONE = matchMedia("(hover: none), (max-width: 1099px)").matches;

function panelFor(hash) {
  const id = MAP[(hash || "").replace("#", "")];
  return id ? document.getElementById(id) : null;
}

function show(panel) {
  if (current === panel) return;
  if (current) hide(current, false);
  lastFocus = document.activeElement;
  panel.hidden = false;
  // 닫을 때 비워 둔 사진 다시 채우기
  panel.querySelectorAll("img[data-src]").forEach((i) => { i.src = i.dataset.src; i.removeAttribute("data-src"); });
  requestAnimationFrame(() => panel.classList.add("open"));
  document.documentElement.classList.add("panel-open");
  current = panel;
  const body = panel.querySelector(".panel-body, .wall-scroll");
  if (body) body.scrollTop = 0;
  panel.querySelector(".panel-close").focus({ preventScroll: true });
}

function hide(panel, restore = true) {
  panel.classList.remove("open");
  const done = () => {
    if (panel.classList.contains("open")) return;
    panel.hidden = true;
    // 폰: 닫힌 패널의 사진은 메모리에서 내려놓기 (다시 열면 캐시에서 바로 불러와요)
    if (PHONE) panel.querySelectorAll("img[src]").forEach((i) => { i.dataset.src = i.getAttribute("src"); i.removeAttribute("src"); });
  };
  panel.addEventListener("transitionend", done, { once: true });
  setTimeout(done, 400);
  if (current === panel) current = null;
  if (!current) document.documentElement.classList.remove("panel-open");
  if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
}

function sync() {
  const p = panelFor(location.hash);
  if (p) show(p);
  else if (current) hide(current);
}

export function initPanels() {
  // 링크 클릭: 브라우저 기본 앵커 이동(스크롤 점프) 대신 주소만 바꿔요
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href");
    if (hash !== "#" && !panelFor(hash)) return;
    e.preventDefault();
    if (hash === "#") {
      if (history.state && history.state.panel) history.back();
      else history.replaceState(null, "", location.pathname + location.search), sync();
    } else {
      history.pushState({ panel: true }, "", hash);
      sync();
    }
  });
  addEventListener("popstate", sync);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current) current.querySelector(".panel-close").click();
  });
  // 패널 바깥(어두운 부분)을 누르면 닫기
  document.querySelectorAll(".panel").forEach((p) => {
    p.addEventListener("click", (e) => { if (e.target === p) p.querySelector(".panel-close").click(); });
  });
  sync();
}
