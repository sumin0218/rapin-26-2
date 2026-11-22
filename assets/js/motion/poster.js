// 모션 포스터
//   레이어마다 4겹으로 감싸서 움직임이 서로 부딪히지 않게 해요.
//     .L  (바깥)  화면 크기에 맞춘 위치
//     .Lr        좁은/넓은 화면에서 크기 조절
//     .Le        처음 등장 연출
//     .Li (안쪽)  가만히 있을 때 살랑살랑
//   스크롤 연출은 레이어들을 담은 .poster-cam 전체에 걸어요.
import { LAYERS, POSTER_W, POSTER_H } from "./poster-layers.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LOGO_LIFT = 34; // SAGGING 2026 글자 높이 미세 조정 (+면 아래로)
const $ = (s, r = document) => r.querySelector(s);

function buildLayers(art) {
  // 배경(개선문)과 앞쪽 레이어를 나눠 담아요. 스크롤하면 앞쪽만 빨려 들어가고 배경은 남아요.
  const bgs = document.createElement("div");
  bgs.className = "poster-bgs";
  const fg = document.createElement("div");
  fg.className = "poster-fg";
  art.append(bgs, fg);
  LAYERS.forEach((L) => {
    const [, , w, h] = L.box;
    const outer = document.createElement("div");
    outer.className = "L";
    outer.dataset.id = L.id;
    outer.style.width = w + "px";
    outer.style.height = h + "px";
    if (L.blend) outer.style.mixBlendMode = L.blend;

    const resp = document.createElement("div");
    resp.className = "Lr";
    const enter = document.createElement("div");
    enter.className = "Le";
    const idle = document.createElement("div");
    idle.className = "Li";
    if (L.origin) idle.style.transformOrigin = L.origin;

    // 회전된 레이어는 바깥 상자 가운데에 안쪽 크기로 놓고 돌려요 (피그마와 같은 방식)
    const holder = document.createElement("div");
    holder.className = "Lh";
    if (L.inner) {
      const [iw, ih] = L.inner;
      holder.style.cssText = `width:${iw}px;height:${ih}px;left:${(w - iw) / 2}px;top:${(h - ih) / 2}px;right:auto;bottom:auto;transform:rotate(${L.rot}deg)`;
    }
    if (L.flip) holder.style.transform = (holder.style.transform || "") + " scaleX(-1)";
    if (L.shadow) holder.style.filter = `drop-shadow(${L.shadow})`;

    const img = document.createElement("img");
    img.src = L.src;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    if (L.radius) img.style.borderRadius = L.radius + "px";
    if (L.fit) img.style.objectFit = L.fit;

    holder.append(img);
    idle.append(holder);
    enter.append(idle);
    resp.append(enter);
    outer.append(resp);
    (L.kind === "bg" ? bgs : fg).append(outer);
  });
}

// 화면 가득 채우기
//   높이는 포스터 높이(842)를 화면 높이에 맞추고,
//   가로는 화면이 좁으면 레이어들을 가운데로 모으고(조금 작게), 넓으면 옆으로 벌려요.
//   배경 레이어는 화면 전체를 덮도록 키워요.
function fit(stage, art) {
  const W = stage.clientWidth, H = stage.clientHeight;
  const s = H / POSTER_H;
  const VW = W / s;                         // 포스터 좌표 기준 화면 너비
  const ox = (VW - POSTER_W) / 2;           // 포스터 원래 가운데를 화면 가운데로
  const k = Math.min(1.45, Math.max(0.62, VW / POSTER_W));
  const cx = POSTER_W / 2;

  art.style.width = VW + "px";
  art.style.transform = `scale(${s})`;

  LAYERS.forEach((L) => {
    const el = art.querySelector(`.L[data-id="${L.id}"]`);
    const r = el.firstChild;
    const [x, y, w, h] = L.box;

    if (L.kind === "bg") {
      const c = Math.max(1, VW / w, POSTER_H / h);
      const bcx = ox + x + w / 2, bcy = y + h / 2;
      el.style.width = w * c + "px";
      el.style.height = h * c + "px";
      el.style.left = Math.min(0, Math.max(VW - w * c, bcx - (w * c) / 2)) + "px";
      el.style.top = Math.min(0, bcy - (h * c) / 2) + "px";
      return;
    }

    const ncx = cx + (x + w / 2 - cx) * k;
    el.style.left = ox + ncx - w / 2 + "px";
    el.style.top = y + (L.kind === "logo" ? LOGO_LIFT : 0) + (L.dy || 0) + "px";

    let rs = 1, origin = "50% 50%";
    if (L.kind === "logo") { rs = Math.min(k, 1); origin = "50% 27%"; }
    else if (k < 1) { rs = (1 + k) / 2; origin = L.origin || "50% 50%"; }
    r.style.transformOrigin = origin;
    r.style.transform = rs === 1 ? "" : `scale(${rs})`;
  });
}

// 반짝이: 로고 위에 별이 랜덤하게 번쩍 (로고 레이어 안에 넣어서 로고와 같이 움직여요)
function sparkles() {
  const logo = $('.L[data-id="logo-c"] .Li');
  const box = document.createElement("div");
  box.className = "sparkles";
  logo.append(box);
  // 로고 레이어(602 × 802) 안에서 SAGGING / 2026 글자가 있는 대략적인 영역
  const zones = [[24, 238, 556, 150], [94, 428, 380, 150]];
  for (let i = 0; i < 16; i++) {
    const z = zones[i % zones.length];
    const st = document.createElement("i");
    st.style.left = z[0] + Math.random() * z[2] + "px";
    st.style.top = z[1] + Math.random() * z[3] + "px";
    st.style.setProperty("--sz", 10 + Math.random() * 18 + "px");
    st.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    st.style.animationDuration = (2.2 + Math.random() * 2.6).toFixed(2) + "s";
    box.append(st);
  }
}

function enterAnim(gsap) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const by = (kind) => LAYERS.filter((L) => L.enter === kind).map((L) => `.L[data-id="${L.id}"] .Le`);

  tl.from(by("fade"), { opacity: 0, scale: 1.08, duration: 1.0, ease: "power2.out" }, 0)
    .from(by("slide-up"), { yPercent: 40, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.25)
    // 인물: 콜라주 붙이듯 하나씩 탁탁
    .from(by("stick"), {
      scale: 1.25, rotation: () => gsap.utils.random(-10, 10), opacity: 0,
      duration: 0.45, ease: "back.out(2.2)", stagger: 0.09,
    }, 0.45)
    .from(by("rise"), { yPercent: 60, opacity: 0, duration: 0.9, ease: "power4.out" }, 0.6)
    .from(by("pop"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 1.05)
    .from(by("stamp"), { scale: 1.8, opacity: 0, duration: 0.35, ease: "power4.in" }, 1.1)
    // 로고: 위에서 쿵
    .from(by("drop"), { yPercent: -45, opacity: 0, duration: 0.7, ease: "bounce.out" }, 1.15)
    .from(by("fly-in"), { xPercent: -160, yPercent: -40, rotation: -12, duration: 1.3, ease: "power2.out" }, 1.0)
    .from(by("slap"), { scale: 2.4, rotation: 25, opacity: 0, duration: 0.35, ease: "power4.in" }, 1.6)
    // 필기체: 왼쪽부터 써지듯
    .fromTo(by("write"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power1.inOut" }, 1.8)
    .from(".scroll-cue", { autoAlpha: 0, y: 30, duration: 0.6, ease: "back.out(2)" }, 2.3);
  return tl;
}

function idleAnim(gsap) {
  const R = gsap.utils.random;
  LAYERS.forEach((L) => {
    const el = $(`.L[data-id="${L.id}"] .Li`);
    if (!el || !L.idle) return;
    switch (L.idle) {
      case "sway":
        gsap.to(el, { rotation: R(-1.6, 1.6), y: R(-3, 3), duration: R(2.4, 3.8), ease: "sine.inOut", repeat: -1, yoyo: true, delay: R(0, 1.5) });
        break;
      case "hover":
        gsap.to(el, { y: -6, rotation: 2, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to(el, { x: 26, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true });
        break;
      case "nod":
        gsap.to(el, { rotation: 2.2, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
        break;
      case "peck": {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        tl.to(el, { rotation: 9, y: 4, duration: 0.12, ease: "power2.in" })
          .to(el, { rotation: 0, y: 0, duration: 0.18, ease: "power2.out" })
          .to(el, { rotation: 9, y: 4, duration: 0.12, ease: "power2.in" }, "+=0.15")
          .to(el, { rotation: 0, y: 0, duration: 0.18, ease: "power2.out" });
        break;
      }
      case "wobble":
        gsap.to(el, { rotation: 6, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true, transformOrigin: "50% 0%" });
        break;
      case "tilt":
        gsap.to(el, { rotation: -2, y: -2, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true });
        break;
      case "flash": {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 3.5 });
        tl.to(el, { filter: "brightness(1.6)", duration: 0.06 })
          .to(el, { filter: "brightness(1)", duration: 0.12 })
          .to(el, { filter: "brightness(1.4)", duration: 0.05 }, "+=0.08")
          .to(el, { filter: "brightness(1)", duration: 0.3 });
        break;
      }
    }
  });
}

// 스크롤: 학관소극장 타일(장소, 시간이 적힌 타일)이 화면 가운데로 다가오며 똑바로 서고,
//         나머지 앞쪽 레이어는 빨려 들어가듯 지나가며 사라져요. 개선문 배경은 그대로 남아요.
function scrollAnim(gsap) {
  const focusLayer = LAYERS.find((L) => L.focus);
  const focusEl = $(`.L[data-id="${focusLayer.id}"]`);
  const art = $(".poster-art");
  const cam = $(".poster-cam");
  // 포스터 좌표(.poster-art 기준)
  const fp = () => ({ x: focusEl.offsetLeft + focusEl.offsetWidth / 2, y: focusEl.offsetTop + focusEl.offsetHeight / 2 });
  const artScale = () => cam.clientHeight / POSTER_H;
  // 타일이 화면에 꽉 차지 않고 크게 보이도록 배율 계산
  const zoom = () => {
    const [iw, ih] = focusLayer.inner;
    const s = artScale();
    return Math.min((cam.clientWidth * 0.62) / (iw * s), (cam.clientHeight * 0.25) / (ih * s));
  };
  // 타일을 상단 띠 바로 아래에 박을 위치 (화면 px)
  const band = () => (document.querySelector(".topbar")?.offsetHeight || 0);
  const tileH = () => focusLayer.inner[1] * artScale() * zoom();
  const tileCY = () => band() + 12 + tileH() / 2;
  const placeLineup = () => {
    const top = tileCY() + tileH() / 2 + 6;
    document.querySelector(".lineup").style.setProperty("--lineup-top", top + "px");
  };
  placeLineup();
  addEventListener("resize", placeLineup);
  const sel = (fn) => LAYERS.filter(fn).map((L) => `.L[data-id="${L.id}"]`);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".poster.pin-wrap", start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
  });

  tl.fromTo(".poster-fg",
      { x: 0, y: 0, scale: 1, rotation: 0 },
      {
        x: () => cam.clientWidth / 2 / artScale() - fp().x,
        y: () => tileCY() / artScale() - fp().y,
        scale: zoom, rotation: -(focusLayer.rot || 0),
        transformOrigin: () => { const p = fp(); return `${p.x}px ${p.y}px`; },
        ease: "power2.inOut", duration: 0.6,
      }, 0)
    // 앞쪽 인물들은 스쳐 지나가듯 커지며 먼저 사라짐 (깊이감)
    .to(sel((L) => (L.depth ?? 0) >= 0.75 && !L.focus && L.kind !== "logo"),
      { scale: 1.6, opacity: 0, ease: "power1.in", duration: 0.35 }, 0)
    // 로고, 뒤쪽 인물, 타일 벽도 차례로 사라지고 학관소극장 타일만 남음
    .to(sel((L) => !L.focus && L.kind !== "bg" && ((L.depth ?? 0) < 0.75 || L.kind === "logo")),
      { opacity: 0, ease: "power1.in", duration: 0.3 }, 0.12)
    // 배경은 살짝만 다가오고 조금 어두워져서 타일이 돋보이게
    .fromTo(".poster-bgs", { scale: 1, filter: "brightness(1) saturate(1)" },
      { scale: 1.12, filter: "brightness(.6) saturate(1.05)", transformOrigin: "50% 45%", duration: 0.6, ease: "power1.inOut" }, 0)
    .to(".scroll-cue", { autoAlpha: 0, y: 20, duration: 0.08 }, 0)
    // 타일이 위에 박히면 그 아래로 셋리스트가 올라옴 (여기서 페이지 스크롤 끝, 이후는 셋리스트 안에서 스크롤)
    .fromTo(".lineup", { autoAlpha: 0, yPercent: 35 }, { autoAlpha: 1, yPercent: 0, duration: 0.2, ease: "power3.out" }, 0.55)
    .fromTo(".lineup .cue", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.12, stagger: 0.012, ease: "power2.out" }, 0.6)
    .to({}, { duration: 0.05 }, 0.95);
  return tl;
}

// 스크롤 유도: 버튼을 누르면 공연 정보가 나오는 지점까지 자동으로 내려가요
function scrollCue() {
  const btn = $(".scroll-cue");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const wrap = $(".poster.pin-wrap");
    const target = wrap.offsetTop + wrap.offsetHeight - innerHeight;
    scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  });
}

export function initPoster() {
  const stage = $(".poster .stage");
  const art = $(".poster-art", stage);
  buildLayers(art);
  sparkles();

  scrollCue();
  const refit = () => fit($(".poster-cam", stage), art);
  refit();
  addEventListener("resize", refit);

  const { gsap, ScrollTrigger } = window;
  if (reduced || !gsap || !ScrollTrigger) {
    document.documentElement.classList.add(reduced ? "reduced" : "no-gsap");
    stage.classList.add("ready");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // 이미지가 다 준비된 뒤에 등장 (중간에 뚝뚝 끊겨 보이지 않게)
  const imgs = [...art.querySelectorAll("img")];
  Promise.race([
    Promise.all(imgs.map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))),
    new Promise((r) => setTimeout(r, 2500)),
  ]).then(() => {
    stage.classList.add("ready");
    enterAnim(gsap).eventCallback("onComplete", () => idleAnim(gsap));
    scrollAnim(gsap);
    addEventListener("orientationchange", () => ScrollTrigger.refresh());
  });
}
