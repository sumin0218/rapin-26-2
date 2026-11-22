// 아티스트 소개: 인스타그램 프로필처럼 3칸 사진 피드.
// 사진을 누르면 게시물처럼 크게 뜨고, 소개 글과 이번 공연에서 서는 곡이 보여요.
// 참여곡은 data/setlist.json 의 아티스트 이름(ko)과 맞춰서 자동으로 찾아요.
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const pick = (v, lang) => (v && typeof v === "object" ? v[lang] ?? v.ko : v);

let list = [];      // 화면에 그려진 순서의 아티스트
let at = -1;        // 지금 열린 게시물 위치
let lastTile = null;
let T = (k) => k;
let LANG = "ko";

// 사진이 아직 없을 때 쓰는 자리 표시 (아스팔트 바닥에 이름)
function placeholder(a, big) {
  const box = el("div", "ig-ph" + (big ? " big" : ""));
  box.dataset.tone = String(a._i % 4);
  box.append(el("b", null, pick(a.name, LANG)), el("small", null, T("igPhotoSoon")));
  return box;
}

function photo(a, big) {
  if (!a.photo) return placeholder(a, big);
  const img = el("img");
  img.src = a.photo; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
  return img;
}

function songsOf(name, setlist) {
  const out = [];
  let no = 0;
  setlist.parts.forEach((p, pi) => p.songs.forEach((s) => {
    no += 1;
    if ((s.artists || []).some((x) => (typeof x === "object" ? x.ko : x) === name)) out.push({ no, part: pi + 1, title: s.title });
  }));
  return out;
}

const post = () => document.getElementById("ig-post");

function fill(i) {
  at = (i + list.length) % list.length;
  const a = list[at];
  const ph = document.getElementById("ig-photo");
  ph.textContent = ""; ph.append(photo(a, true));
  document.getElementById("ig-post-name").textContent = pick(a.name, LANG);
  document.getElementById("ig-post-handle").textContent = a.instagram ? "@" + a.instagram : "";
  document.querySelector("#ig-post .ig-mini").textContent = pick(a.name, "en").slice(0, 1);
  document.getElementById("ig-caption").textContent = pick(a.bio, LANG) || T("igBioSoon");
  const ol = document.getElementById("ig-songs");
  ol.textContent = "";
  a._songs.forEach((s) => {
    const li = el("li");
    li.append(el("span", "n", String(s.no).padStart(2, "0")), el("span", "t", s.title), el("span", "p", T("part").replace("{n}", s.part)));
    ol.append(li);
  });
  const like = document.getElementById("ig-like");
  like.setAttribute("aria-pressed", a._liked ? "true" : "false");
}

function open(i, tile) {
  lastTile = tile || null;
  fill(i);
  const p = post();
  p.hidden = false;
  requestAnimationFrame(() => p.classList.add("open"));
  p.querySelector(".ig-x").focus({ preventScroll: true });
}

function close() {
  const p = post();
  if (p.hidden) return;
  p.classList.remove("open");
  setTimeout(() => { if (!p.classList.contains("open")) p.hidden = true; }, 250);
  if (lastTile) lastTile.focus({ preventScroll: true });
}

let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  const p = post();
  p.querySelector(".ig-x").addEventListener("click", close);
  p.addEventListener("click", (e) => { if (e.target === p) close(); });
  document.getElementById("ig-prev").addEventListener("click", () => fill(at - 1));
  document.getElementById("ig-next").addEventListener("click", () => fill(at + 1));
  document.getElementById("ig-like").addEventListener("click", (e) => {
    const a = list[at]; a._liked = !a._liked;
    e.currentTarget.setAttribute("aria-pressed", a._liked ? "true" : "false");
    const tile = document.querySelector(`.ig-tile[data-i="${at}"]`);
    if (tile) tile.classList.toggle("liked", a._liked);
  });
  // 게시물이 열려 있을 땐 Esc 가 게시물만 닫고, 좌우 화살표로 넘겨요 (패널은 그대로)
  addEventListener("keydown", (e) => {
    if (p.hidden) return;
    if (e.key === "Escape") { e.stopImmediatePropagation(); close(); }
    else if (e.key === "ArrowLeft") fill(at - 1);
    else if (e.key === "ArrowRight") fill(at + 1);
  }, true);
  // 모바일: 사진을 좌우로 밀어서 넘기기
  let x0 = null;
  const ph = document.getElementById("ig-photo");
  ph.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  ph.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) fill(at + (dx < 0 ? 1 : -1));
  });
  // 패널이 닫히면 게시물도 같이 닫기
  addEventListener("popstate", close);
}

export function renderArtists(data, setlist, lang, t) {
  T = t; LANG = lang;
  const liked = new Set(list.filter((a) => a._liked).map((a) => a.id));
  list = (data.artists || []).map((a, i) => ({ ...a, _i: i, _liked: liked.has(a.id), _songs: songsOf(pick(a.name, "ko"), setlist) }));

  document.getElementById("ig-n-artists").textContent = list.length;
  document.getElementById("ig-n-songs").textContent = setlist.parts.reduce((n, p) => n + p.songs.length, 0);

  const grid = document.getElementById("ig-grid");
  grid.textContent = "";
  // 아직 공개 전이면 피드 자리에 안내 한 줄
  const empty = !list.length;
  document.getElementById("ig-n-artists").textContent = empty ? "?" : list.length;
  if (empty) {
    document.getElementById("ig-n-songs").textContent = "?";
    const li = el("li", "ig-soon", t("artistsSoon"));
    grid.append(li);
    wire();
    return;
  }
  list.forEach((a, i) => {
    const li = el("li");
    const b = el("button", "ig-tile" + (a._liked ? " liked" : ""));
    b.type = "button"; b.dataset.i = i;
    b.setAttribute("aria-label", t("igOpen").replace("{n}", pick(a.name, lang)));
    b.append(photo(a, false));
    // 여러 곡이면 인스타 '여러 장' 표시처럼 오른쪽 위에 곡 수
    if (a._songs.length > 1) b.append(el("span", "ig-multi", String(a._songs.length)));
    const hover = el("span", "ig-hover");
    hover.append(el("b", null, pick(a.name, lang)), el("small", null, a._songs.length + " " + t("igSongs")));
    b.append(hover);
    b.addEventListener("click", () => open(i, b));
    li.append(b);
    grid.append(li);
  });
  if (!post().hidden) fill(at);
  wire();
}
