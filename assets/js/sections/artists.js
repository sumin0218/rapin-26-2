// 아티스트 소개: 공터 벽에 오려 붙인 사진 콜라주.
// 사진과 이름표는 사람마다 정해진 무작위(이름으로 만든 시드)로 기울기와 위치가 달라져요.
// 그래서 새로고침해도 배치는 그대로예요. 누르면 정보 카드(사진, 이름, 인스타, 부서, 한줄소개)가 떠요.
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const pick = (v, lang) => (v && typeof v === "object" ? v[lang] ?? v.ko : v);

// 이름 → 0~1 사이 고정 난수들
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

let list = [], LANG = "ko", lastTile = null;
const card = () => document.getElementById("artist-card");

function openCard(a, tile) {
  lastTile = tile;
  const c = card();
  document.getElementById("ac-img").src = a.photo;
  document.getElementById("ac-name").textContent = pick(a.name, LANG);
  document.getElementById("ac-dept").textContent = a.dept || "";
  const ig = document.getElementById("ac-ig");
  ig.hidden = !a.instagram;
  if (a.instagram) { const id = a.instagram.toLowerCase(); ig.textContent = "@" + id; ig.href = "https://www.instagram.com/" + id + "/"; }
  document.getElementById("ac-bio").textContent = pick(a.bio, LANG) || "";
  c.hidden = false;
  requestAnimationFrame(() => c.classList.add("open"));
  c.querySelector(".ac-x").focus({ preventScroll: true });
}
function closeCard() {
  const c = card();
  if (c.hidden) return;
  c.classList.remove("open");
  setTimeout(() => { if (!c.classList.contains("open")) c.hidden = true; }, 220);
  if (lastTile) lastTile.focus({ preventScroll: true });
}

let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  const c = card();
  c.querySelector(".ac-x").addEventListener("click", closeCard);
  c.addEventListener("click", (e) => { if (e.target === c) closeCard(); });
  // 카드가 열려 있으면 Esc 는 카드만 닫아요 (벽 패널은 그대로)
  addEventListener("keydown", (e) => { if (!c.hidden && e.key === "Escape") { e.stopImmediatePropagation(); closeCard(); } }, true);
  addEventListener("popstate", closeCard);
}

export function renderArtists(data, _setlist, lang) {
  LANG = lang;
  list = data.artists || [];
  const board = document.getElementById("wall-board");
  board.textContent = "";
  list.forEach((a, i) => {
    const r = seeded(a.id || pick(a.name, "ko"));
    const li = el("li", "cut");
    // 콜라주처럼: 기울기 -7~7도, 위아래 엇갈림, 크기 조금씩 다르게
    li.style.setProperty("--rot", ((r() - 0.5) * 14).toFixed(1) + "deg");
    li.style.setProperty("--dy", Math.round((r() - 0.3) * 70 + (i % 2) * 40) + "px");
    li.style.setProperty("--dx", Math.round((r() - 0.5) * 40) + "px");
    li.style.setProperty("--sz", (0.88 + r() * 0.24).toFixed(2));
    li.style.setProperty("--tag-rot", ((r() - 0.5) * 12).toFixed(1) + "deg");
    li.style.setProperty("--tag-dx", Math.round((r() - 0.5) * 50) + "px");
    li.style.zIndex = String(1 + Math.floor(r() * 5));

    const b = el("button", "cut-btn");
    b.type = "button";
    b.setAttribute("aria-label", pick(a.name, lang));
    const img = el("img");
    img.src = a.photo; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    b.append(img, el("span", "cut-tag", pick(a.name, lang)));
    b.addEventListener("click", () => openCard(a, b));
    li.append(b);
    board.append(li);
  });
  if (!card().hidden && lastTile) closeCard();
  wire();
}
