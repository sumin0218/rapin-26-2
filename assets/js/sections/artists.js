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

let list = [], LANG = "ko", lastTile = null, T = (k) => k;

// 왕관 (색은 CSS 의 --c1(밝은 면) --c2(어두운 면) 로)
const CROWN = '<svg viewBox="0 0 64 44"><path d="M4 38 L2 10 L18 22 L32 2 L46 22 L62 10 L60 38 Z" fill="var(--c1)" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M32 2 L46 22 L62 10 L60 38 L32 38 Z" fill="var(--c2)" opacity=".55"/><rect x="4" y="34" width="56" height="8" rx="1.5" fill="var(--c2)" stroke="#111" stroke-width="3"/><circle cx="2.5" cy="10" r="3.6" fill="var(--c1)" stroke="#111" stroke-width="2.4"/><circle cx="32" cy="3" r="3.6" fill="var(--c1)" stroke="#111" stroke-width="2.4"/><circle cx="61.5" cy="10" r="3.6" fill="var(--c1)" stroke="#111" stroke-width="2.4"/><path d="M12 30 L16 26 L20 30 L16 34 Z M28 30 L32 26 L36 30 L32 34 Z M44 30 L48 26 L52 30 L48 34 Z" fill="#c8281e" stroke="#111" stroke-width="1.6"/><path d="M8 14 L10 32" stroke="#fff" stroke-width="2.2" opacity=".7" stroke-linecap="round"/></svg>';
const card = () => document.getElementById("artist-card");

function openCard(a, tile) {
  lastTile = tile;
  const c = card();
  document.getElementById("ac-img").src = a.photo;
  document.getElementById("ac-name").textContent = pick(a.name, LANG);
  document.getElementById("ac-dept").textContent = a.dept || "";
  // 이름 옆: 학과 (줄바꿈) 학번
  const school = document.getElementById("ac-school");
  school.textContent = "";
  if (a.major) school.append(el("span", null, a.major));
  if (a.year) school.append(el("span", null, T("yearFmt").replace("{n}", a.year)));
  school.hidden = !a.major && !a.year;
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

export function renderArtists(data, _setlist, lang, t) {
  LANG = lang; if (t) T = t;
  list = data.artists || [];
  const board = document.getElementById("wall-board");
  board.textContent = "";
  list.forEach((a, i) => {
    const r = seeded(a.id || pick(a.name, "ko"));
    const li = el("li", "cut");
    // 콜라주처럼: 기울기 -7~7도, 위아래 엇갈림, 크기 조금씩 다르게
    // 콜라주처럼 흐트러뜨리되, 칸 안에서만 움직여서 옆 사람과 겹치지 않게
    li.style.setProperty("--rot", ((r() - 0.5) * 10).toFixed(1) + "deg");
    li.style.setProperty("--dy", Math.round((r() - 0.5) * 24 + (i % 2) * 18) + "px");
    li.style.setProperty("--dx", Math.round((r() - 0.5) * 14) + "px");
    li.style.setProperty("--sz", (0.92 + r() * 0.1).toFixed(2));
    li.style.setProperty("--tag-rot", ((r() - 0.5) * 10).toFixed(1) + "deg");
    li.style.setProperty("--tag-dx", Math.round((r() - 0.5) * 24) + "px");
    li.style.zIndex = String(1 + Math.floor(r() * 5));

    const b = el("button", "cut-btn");
    b.type = "button";
    b.setAttribute("aria-label", pick(a.name, lang));
    const img = el("img");
    img.src = a.photo; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    const tag = el("span", "cut-tag", pick(a.name, lang));
    // 임원진은 이름표에 왕관 (회장단 은색, 부장 동색)
    if (a.crown) {
      tag.classList.add("crowned");
      const c = el("i", "crown crown-" + a.crown);
      c.setAttribute("aria-hidden", "true");
      c.innerHTML = CROWN;
      tag.prepend(c);
    }
    b.append(img, tag);
    b.addEventListener("click", () => openCard(a, b));
    li.append(b);
    board.append(li);
  });
  if (!card().hidden && lastTile) closeCard();
  wire();
}
