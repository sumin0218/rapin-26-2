# RAP-IN 26-2 정기공연 페이지

정기공연 관객용 공식 페이지예요. 맨 앞에 포스터 기반 2D 모션 포스터가 있고, 그 아래로 공연 정보, 순서표, 동아리 소개가 이어져요.
빌드 과정 없이 GitHub Pages에 그대로 올리는 정적 사이트예요.

## 폴더 구조

```
rapin-26-2/
├─ index.html              페이지 뼈대 (섹션 순서: 포스터 → 공연 정보 → 순서표 → 소개)
├─ 404.html                없는 주소로 들어왔을 때
├─ .nojekyll               GitHub Pages가 파일을 가공하지 않게
├─ assets/
│  ├─ css/
│  │  ├─ base.css          글꼴, 색(:root 변수), 리셋
│  │  ├─ layout.css        상단 바, 섹션, 푸터
│  │  ├─ poster.css        모션 포스터 (스크롤 고정 구간)
│  │  └─ program.css       순서표
│  ├─ js/
│  │  ├─ main.js           진입점
│  │  ├─ data.js           JSON 불러오기
│  │  ├─ i18n.js           한국어 / EN / 中文
│  │  ├─ sections/
│  │  │  ├─ info.js        공연 정보 채우기
│  │  │  └─ program.js     순서표 그리기
│  │  └─ motion/
│  │     └─ poster.js      스크롤 고정 + 스크롤 연동 애니메이션 (GSAP ScrollTrigger)
│  ├─ fonts/               Pretendard (SIL OFL 1.1)
│  ├─ img/
│  │  ├─ poster/           포스터 레이어 이미지 자리
│  │  ├─ og/               공유 미리보기 이미지 (1200×630)
│  │  └─ favicon.svg
│  └─ vendor/              GSAP, ScrollTrigger (CDN 없이 저장소에 포함)
├─ docs/
│  └─ REQUIREMENTS.md  요구사항
└─ data/
   ├─ concert.json         날짜, 장소, 입장, 링크
   ├─ setlist.json         순서표
   └─ i18n/                언어별 문구 (ko, en, zh)
```

## 내용 바꾸기

- **공연 정보:** `data/concert.json`
- **순서표:** `data/setlist.json` (부 → 곡 순서대로. 아티스트는 공개해도 되는 활동명으로)
- **문구:** `data/i18n/ko.json`, `en.json`, `zh.json` (HTML에는 `data-i18n="키"`만 달아요)
- **색:** `assets/css/base.css`의 `:root` 변수
- **포스터 모션:** `assets/js/motion/poster.js`의 타임라인

## 내 컴퓨터에서 미리 보기

JSON을 불러오기 때문에 파일을 더블클릭해서 열면 안 되고, 간단한 서버로 열어야 해요.

```bash
cd rapin-26-2
python -m http.server 8000
# 브라우저에서 http://localhost:8000
```

## GitHub Pages에 올리기

1. GitHub에서 새 저장소를 만들어요 (예: `rapin-26-2`, Public).
2. 이 폴더를 올려요.
   ```bash
   git init -b main
   git add .
   git commit -m "Initial structure"
   git remote add origin https://github.com/sumin0218/rapin-26-2.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages**에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 저장해요.
4. 1~2분 뒤 `https://sumin0218.github.io/rapin-26-2/`에서 열려요.
5. 배포 주소가 정해지면 `index.html`의 `og:url`, `og:image`를 절대 주소로 바꿔 주세요 (카카오톡 미리보기용).

## 공개 페이지 체크리스트

- [ ] 아티스트 표기는 본인 동의를 받은 활동명으로
- [ ] 내부 자료(임원진 피드백, 리허설 영상, 전체 음원)는 넣지 않기
- [ ] 포스터 글꼴의 웹 사용 라이선스 확인
- [ ] 공유 미리보기 이미지(`assets/img/og/og-image.png`) 교체

## 라이선스

- Pretendard: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`)
- GSAP: GreenSock Standard License, 무료 사용 가능 (`assets/vendor/README.md`)
