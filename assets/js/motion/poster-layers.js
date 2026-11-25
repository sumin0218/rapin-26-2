// 포스터 레이어 (피그마 rapin-26-2 / "A4 실물 화질 픽셀 사이즈" 프레임 기준, 595 × 842. A3 인쇄본과 같은 배치)
// 순서 = 아래에서 위로 쌓이는 순서. 좌표는 피그마 그대로(px).
//   box:   레이어 바깥 상자 [left, top, width, height]
//   inner: 회전된 레이어일 때 안쪽 크기 [width, height]와 rot(도)
//   flip:  좌우 반전
//   shadow: 그림자 (CSS drop-shadow 값)
//   depth: 스크롤할 때 얼마나 크게 움직일지 (0 = 거의 안 움직임)
//   enter: 처음 등장 방식, idle: 가만히 있을 때 움직임
//   kind:  "bg" = 화면 전체를 덮는 배경, "logo" = 좁은 화면에서 통째로 줄이는 타이틀
//   dy:    피그마 위치에서 위아래로 더 옮길 양(px, +면 아래)
//   focus: 스크롤하면 이 레이어 쪽으로 빨려 들어가요
const A = "assets/img/poster/";

export const POSTER_W = 595;
export const POSTER_H = 842;

export const LAYERS = [
  { id: "bg",           src: A + "bg.webp",           box: [-132, -25, 890, 938], kind: "bg", depth: 0.08, enter: "fade",
                        // 셋리스트로 넘어가면 같은 자리의 번개 버전으로 바뀌고 번개가 쳐요
                        storm: A + "bg-storm.webp", bolts: A + "lightning.webp" },
  { id: "tile",         src: A + "tile.webp",         box: [72.09, 277.31, 382.172, 309.23], inner: [334.875, 233.995], rot: -14.25, radius: 9,
                        shadow: "8px 5px 8.3px rgba(140,130,63,.26)", depth: 0.4, enter: "slide-up" },
  { id: "logo-a",       src: A + "logo.webp", box: [-3, -218, 602, 802], kind: "logo", depth: 0.9, enter: "drop", group: "logo" },
  { id: "logo-b",       src: A + "logo.webp", box: [-3, -218, 602, 802], kind: "logo", depth: 0.9, enter: "drop", group: "logo" },
  { id: "logo-c",       src: A + "logo.webp", box: [-3, -217, 602, 802], kind: "logo", depth: 0.9, enter: "drop", group: "logo" },
  { id: "panda",        src: A + "panda.webp", box: [-35, 252, 122, 249], depth: 0.85, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "hongseong",    src: A + "hongseong-tingjun.webp", box: [111, 306, 234, 271], shadow: "9px -3px 4px rgba(0,0,0,.31)",
                        depth: 0.55, enter: "stick", idle: "sway", origin: "50% 100%", alt: "" },
  { id: "heli",         src: A + "heli.webp", box: [-50, -36, 183, 145], dy: 22, depth: 1.2, enter: "fly-in", idle: "hover" },
  { id: "jimen2",       src: A + "jimen2.webp", box: [258, 283, 325, 435], flip: true, depth: 0.6, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "giraffe",      src: A + "giraffe.webp", fit: "fill", box: [400, 106, 239, 449], depth: 0.7, enter: "rise", idle: "nod", origin: "60% 100%" },
  { id: "mrdongmen",    src: A + "mrdongmen.webp", box: [223, 283, 451, 652], flip: true, shadow: "11px 4px 4px rgba(0,0,0,.25)",
                        depth: 0.75, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "chicken",      src: A + "chicken.webp", box: [398, 620, 159, 159], depth: 0.85, enter: "pop", idle: "peck", origin: "50% 90%" },
  { id: "bodo",         src: A + "tile.webp", box: [344.4, 657, 341.494, 298.898], inner: [292.905, 233.995], rot: -14.25, radius: 9,
                        shadow: "0 -12px 8.3px rgba(140,130,63,.5)", depth: 0.5, enter: "slide-up" },
  { id: "pizza",        src: A + "pizza.webp", box: [-211, 484, 370.667, 373.916], depth: 0.6, enter: "slide-up" },
  { id: "hakgwan",      src: A + "hakgwan.webp", fit: "fill", focus: true, box: [388.21, 646.04, 230.261, 215.805], inner: [192.123, 171.596], rot: -15.13,
                        shadow: "-3px 1px 4px rgba(0,0,0,.73)", depth: 0.95, enter: "stamp", idle: "tilt" },
  { id: "lildonggyu",   src: A + "lildonggyu.webp", box: [-111, 306, 285, 623], flip: true, shadow: "7px 1px 4px rgba(0,0,0,.25)",
                        depth: 0.9, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "gyumanjok",    src: A + "gyumanjok.webp", box: [87, 404, 286, 389], shadow: "-12px 5px 4px rgba(0,0,0,.25)",
                        depth: 0.8, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "baksa",        src: A + "baksa-hannam.webp", box: [-62, 530, 407, 329], shadow: "-9px 1px 4px rgba(0,0,0,.25)",
                        depth: 1.0, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "police",       src: A + "police.webp", fit: "fill", box: [230, 633, 226, 209], shadow: "15px 1px 4px rgba(0,0,0,.25)",
                        depth: 1.05, enter: "stick", idle: "sway", origin: "50% 100%" },
  { id: "rapinisready", src: A + "rapinisready.webp", box: [358, 463, 111.59, 91.513], inner: [105, 83], rot: -4.81,
                        depth: 1.15, enter: "slap", idle: "wobble" },
  { id: "bieber",       src: A + "bieber.webp", box: [89, 519, 111.491, 130.748], depth: 1.1, enter: "pop", idle: "wobble" },
  { id: "outofmind",    src: A + "outofmind.webp", fit: "fill", box: [258, 530, 328.937, 109.646], shadow: "0 -5px 4px rgba(255,255,255,.15)",
                        depth: 1.1, enter: "write" },
  { id: "business",     src: A + "business.webp", box: [26, 484, 204, 68], depth: 1.2, enter: "slap" },
];
