// 모션 포스터: 스크롤 고정(pin) + 스크롤 연동(scrub)
// .pin-wrap 을 지나가는 동안 .stage 가 화면에 붙어 있고, 스크롤한 만큼 타임라인이 진행돼요.
// 실제 포스터 레이어가 나오면 아래 타임라인의 대상만 바꾸면 돼요.
export function initPosterMotion() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) {
    document.documentElement.classList.add("no-gsap");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // 1) 처음 들어왔을 때 등장 (스크롤과 무관)
  gsap.from(".poster .layer-shape", { scale: 0, opacity: 0, duration: 1.1, ease: "back.out(1.6)", stagger: 0.12 });
  gsap.from(".poster-text > *", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.25 });

  // 2) 스크롤 구간: 화면은 고정, 레이어만 움직임
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".poster.pin-wrap",
      start: "top top",
      end: "bottom bottom",   // .pin-wrap 높이(화면 3배)만큼
      scrub: 0.6,             // 스크롤을 살짝 따라오게 (0이면 즉시)
    },
  });

  tl.to(".layer-bg", { scale: 1.15 }, 0)
    .to(".layer-shape.s1", { xPercent: -60, yPercent: -30, scale: 1.4 }, 0)
    .to(".layer-shape.s2", { xPercent: 70, yPercent: 20, scale: 0.6 }, 0)
    .to(".layer-shape.s3", { yPercent: 80, scale: 1.8, opacity: 0.4 }, 0)
    .to(".poster-text", { scale: 0.86, yPercent: -10 }, 0)
    .to(".scroll-hint", { opacity: 0 }, 0)
    .to(".poster .stage", { opacity: 0.25 }, 0.75);  // 마지막에 어두워지며 순서표로 넘어감

  // 모바일 주소창 때문에 높이가 바뀌면 다시 계산
  addEventListener("orientationchange", () => ScrollTrigger.refresh());
}
