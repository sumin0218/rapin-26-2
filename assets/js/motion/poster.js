// 모션 포스터
//   레이어마다 3겹으로 감싸서 움직임이 서로 부딪히지 않게 해요.
//     .L  (바깥)  스크롤 연출
//     .Le (가운데) 처음 등장 연출
//     .Li (안쪽)  가만히 있을 때 살랑살랑
import { LAYERS, POSTER_W, POSTER_H } from "./poster-layers.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildLayers(art) {
  LAYERS.forEach((L) => {
    const [x, y, w, h] = L.box;
    const outer = document.createElement("div");
    outer.className = "L";
    outer.dataset.id = L.id;
    outer.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    if (L.group) outer.dataset.group = L.group;

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
      holder.style.cssText = `width:${iw}px;height:${ih}px;left:${(w - iw) / 2}px;top:${(h - ih) / 2}px;transform:rotate(${L.rot}deg)`;
    }
    if (L.flip) holder.style.transform = (holder.style.transform || "") + " scaleX(-1)";
    if (L.shadow) holder.style.filter = `drop-shadow(${L.shadow})`;
    if (L.blend) outer.style.mixBlendMode = L.blend;

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
    outer.append(enter);
    art.append(outer);
  });
}

// 포스터를 화면에 맞게 키우거나 줄여요 (잘리지 않게 전체가 보이도록)
function fit(stage, art, frame) {
  const pad = innerWidth < 640 ? 16 : 40;
  const topbar = 56;
  const s = Math.min((stage.clientWidth - pad * 2) / POSTER_W, (stage.clientHeight - topbar - pad * 2) / POSTER_H);
  frame.style.width = POSTER_W * s + "px";
  frame.style.height = POSTER_H * s + "px";
  art.style.transform = `scale(${s})`;
}

// 반짝이: 로고 위에 별이 랜덤하게 번쩍
function sparkles(art) {
  const box = document.createElement("div");
  box.className = "sparkles";
  art.append(box);
  // 로고 글자가 있는 대략적인 영역 (SAGGING / 2026)
  const zones = [[20, 20, 560, 150], [90, 210, 380, 150]];
  for (let i = 0; i < 14; i++) {
    const z = zones[i % zones.length];
    const s = document.createElement("i");
    s.style.left = z[0] + Math.random() * z[2] + "px";
    s.style.top = z[1] + Math.random() * z[3] + "px";
    s.style.setProperty("--sz", 10 + Math.random() * 16 + "px");
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    s.style.animationDuration = (2.2 + Math.random() * 2.6).toFixed(2) + "s";
    box.append(s);
  }
}

function enterAnim(gsap) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const q = (id) => `.L[data-id="${id}"] .Le`;
  const by = (kind) => LAYERS.filter((L) => L.enter === kind).map((L) => q(L.id));

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
    .from(".sparkles", { opacity: 0, duration: 0.4 }, 1.7)
    .from(by("fly-in"), { xPercent: -160, yPercent: -40, rotation: -12, duration: 1.3, ease: "power2.out" }, 1.0)
    .from(by("slap"), { scale: 2.4, rotation: 25, opacity: 0, duration: 0.35, ease: "power4.in" }, 1.6)
    // 필기체: 왼쪽부터 써지듯
    .fromTo(by("write"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power1.inOut" }, 1.8)
    .from(".poster-band", { yPercent: 100, duration: 0.5 }, 1.9);
  return tl;
}

function idleAnim(gsap) {
  const R = gsap.utils.random;
  LAYERS.forEach((L) => {
    const el = document.querySelector(`.L[data-id="${L.id}"] .Li`);
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
        // 번개: 가끔 번쩍
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

function scrollAnim(gsap) {
  // 가운데(포스터 중심)에서 바깥으로, 깊이(depth)만큼 멀어지며 커짐 → 카메라가 콜라주 안으로 들어가는 느낌
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".poster.pin-wrap", start: "top top", end: "bottom bottom", scrub: 0.6 },
  });
  const cx = POSTER_W / 2, cy = POSTER_H / 2;
  LAYERS.forEach((L) => {
    const [x, y, w, h] = L.box;
    const dx = x + w / 2 - cx, dy = y + h / 2 - cy;
    const d = L.depth ?? 0.5;
    tl.to(`.L[data-id="${L.id}"]`, { x: dx * d * 1.3, y: dy * d * 1.3, scale: 1 + d * 1.1, opacity: d > 0.3 ? 0 : 1, ease: "power1.in", duration: 0.8 }, 0);
  });
  // 포스터 테두리가 풀리면서 화면 전체로 번지고, 끝에서 어두워지며 다음 섹션으로
  tl.fromTo(".poster-art", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(-60% -120% -60% -120%)", ease: "power2.in" }, 0)
    .to(".poster-art", { boxShadow: "0 0 0 rgba(0,0,0,0)" }, 0)
    .to(".poster-art", { opacity: 0, duration: 0.25 }, 0.75)
    .to(".sparkles", { opacity: 0, duration: 0.3 }, 0)
    .to(".poster-band", { scale: 1.12, y: -10 }, 0)
    .to(".poster .backdrop", { opacity: 0.25 }, 0)
    .to(".scroll-hint", { opacity: 0, duration: 0.15 }, 0);
  return tl;
}

export function initPoster() {
  const stage = document.querySelector(".poster .stage");
  const frame = stage.querySelector(".poster-frame");
  const art = stage.querySelector(".poster-art");
  buildLayers(art);
  sparkles(art);

  const refit = () => fit(stage, art, frame);
  refit();
  addEventListener("resize", refit);

  const { gsap, ScrollTrigger } = window;
  if (reduced || !gsap || !ScrollTrigger) {
    document.documentElement.classList.add(reduced ? "reduced" : "no-gsap");
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
