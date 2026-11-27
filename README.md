<div align="center">

<img src="assets/img/og/og-image.jpg" alt="SAGGING 2026 — RAP-IN 26-2 정기공연" width="100%">

# SAGGING 2026

경희대학교 흑인음악 동아리 **RAP-IN**의 26-2 정기공연 웹페이지입니다.

**2026. 12. 3. (목) 19:00–21:00**<br>
국제캠퍼스 학생회관 소극장 · 무료 입장

<a href="https://khu-rapin-26-2.vercel.app/"><img src="https://img.shields.io/badge/Website-khu--rapin--26--2-111111?style=for-the-badge&logo=vercel&logoColor=white" alt="Website"></a>
<a href="https://www.instagram.com/rapin_khu/"><img src="https://img.shields.io/badge/Instagram-@rapin__khu-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"></a>

<img src="https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML">
<img src="https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS">
<img src="https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/GSAP-ScrollTrigger-0AE448?style=flat-square&logo=greensock&logoColor=black" alt="GSAP">
<img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
<img src="https://img.shields.io/badge/i18n-KO%20·%20EN%20·%20ZH-F5C518?style=flat-square" alt="i18n">

</div>

<br>

> 인쇄용 포스터를 웹에서 재구성한 인터랙티브 모션 포스터입니다. 스크롤에 따라 포스터의 인물과 오브젝트가 흩어지고, 셋리스트가 나타납니다. 공연 정보와 아티스트 소개는 사이드 패널에서 확인할 수 있습니다.
>
> HTML, CSS, Vanilla JavaScript(ES Modules)로 구현했으며 별도의 빌드 도구 없이 Vercel에 배포했습니다.

<br>

## 📱 Preview

<table>
  <tr>
    <td align="center" width="25%"><img src="docs/readme/poster-mobile.jpg" alt="모바일 포스터"></td>
    <td align="center" width="25%"><img src="docs/readme/scroll-mobile.jpg" alt="스크롤"></td>
    <td align="center" width="25%"><img src="docs/readme/setlist-mobile.jpg" alt="셋리스트"></td>
    <td align="center" width="25%"><img src="docs/readme/info-mobile.jpg" alt="공연 정보"></td>
  </tr>
  <tr>
    <td align="center"><b>모션 포스터</b></td>
    <td align="center"><b>스크롤</b><br><sub>레이어 분리</sub></td>
    <td align="center"><b>셋리스트</b><br><sub>미리듣기 · MC SEGMENT</sub></td>
    <td align="center"><b>공연 정보</b></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/readme/artists-mobile.jpg" alt="아티스트 콜라주"></td>
    <td align="center"><img src="docs/readme/artist-card.jpg" alt="아티스트 카드"></td>
    <td align="center"><img src="docs/readme/egg-bubble.jpg" alt="이스터 에그 힌트"></td>
    <td align="center"><img src="docs/readme/egg-ring.jpg" alt="이스터 에그"></td>
  </tr>
  <tr>
    <td align="center"><b>아티스트 콜라주</b></td>
    <td align="center"><b>아티스트 카드</b></td>
    <td align="center"><b>이스터 에그</b><br><sub>힌트 말풍선</sub></td>
    <td align="center"><b>이스터 에그</b><br><sub>닥터페퍼 링</sub></td>
  </tr>
</table>

<details open>
<summary><b>🖥️ PC</b></summary>
<br>

<img src="docs/readme/poster-desktop.jpg" alt="PC 모션 포스터">

<table>
  <tr>
    <td width="50%"><img src="docs/readme/setlist-desktop.jpg" alt="PC 셋리스트"></td>
    <td width="50%"><img src="docs/readme/artists-desktop.jpg" alt="PC 아티스트 콜라주"></td>
  </tr>
  <tr>
    <td align="center"><b>셋리스트</b><br><sub>1부 · INTERMISSION · 2부</sub></td>
    <td align="center"><b>아티스트 콜라주</b></td>
  </tr>
</table>

</details>

<br>

## ✨ Features

### 🎞️ Motion Poster

- 포스터 이미지 23장을 개별 레이어로 분리해 스크롤 기반 애니메이션 구현
- 레이어별 좌표와 크기를 관리하고 화면 비율에 맞게 배치
- 모바일과 PC의 포스터 레이아웃 분리
- GSAP ScrollTrigger를 활용한 스크롤 고정 및 레이어 이탈 애니메이션
- 레이어별 미세한 움직임 적용

배경음악 재생 시 킥 드럼에 맞춰 로고가 반응합니다. iOS에서 실시간 오디오 분석 시 발생하는 재생 문제를 피하기 위해 미리 추출한 킥 타임스탬프(`bgm-kicks.json`)를 기준으로 애니메이션을 동기화했습니다.

### 🎤 Setlist

- `data/setlist.json` 기반 셋리스트 관리
- `revealAt` 설정에 따른 공개 전 카운트다운
- 공개 이후 1·2부 각 12곡 표시, 3곡마다 MC SEGMENT, 1부와 2부 사이 INTERMISSION 표시
- 곡별 15초 미리듣기 (음량 -14 LUFS 기준으로 정규화)
- 무대 구분 태그(MC · STREET DANCE · R&B · COVER)와 prod. / 원곡 / feat. 표기

### 🧑‍🎤 Artist & Info Panels

- 공연 정보 및 아티스트 소개를 사이드 패널로 구성
- URL hash를 통한 패널 직접 접근 (`#info`, `#artists`)
- 34명의 아티스트 프로필을 이미지 콜라주 형태로 구성
- 임원진 우선 배치 후 이름순 정렬
- 이미지 클릭 시 상세 카드 제공
- 키보드, 버튼, 스와이프를 통한 카드 탐색

아티스트 정보는 학과와 입학 연도만 공개하며, 학번·나이·국적은 표시하지 않습니다.

### 🌐 Internationalization

한국어, 영어, 중국어를 지원합니다.

- 번역 데이터와 UI 분리 (`data/i18n/`)
- 언어 변경 시에도 아티스트 정렬 순서 유지
- 학과명 영문 표기는 경희대학교 공식 표기 기준
- 영어·중국어 화면에서는 한글 곡 제목을 영문 제목으로 표시

### 🥤 Easter Egg

포스터 속 lil donggyu를 세 번 클릭하면 배경음악이 전환되고 닥터페퍼 캔이 화면 주위를 회전합니다. 클릭 횟수에 따라 안내 메시지가 표시되며, 캔버스로 클릭 위치의 실제 이미지 영역을 확인해 인터랙션을 처리합니다.

### ♿ Accessibility & Performance

- `prefers-reduced-motion` 설정 지원
- 애니메이션 최소화 설정 시 정적 포스터 제공
- 이미지 및 스크립트 버전 쿼리를 통한 캐시 갱신
- 모바일 메모리 최적화: 화면 크기에 맞춘 포스터·아티스트 이미지, 화면 밖 레이어 렌더링 생략, 무거운 필터 효과 축소
- 방문 통계는 Google Analytics로만 수집하며, 개인을 식별할 수 있는 정보는 수집하지 않습니다

<br>

## 🛠️ Tech Stack

| 구분 | 사용 기술 |
|---|---|
| Markup / Style | HTML, CSS |
| Script | Vanilla JavaScript (ES Modules) |
| Animation | GSAP / ScrollTrigger |
| Data | JSON |
| Analytics | Google Analytics 4 |
| Deploy | Vercel |

<br>

## 📁 Project Structure

```text
rapin-26-2/
├── index.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── poster.css
│   │   ├── panels.css
│   │   └── program.css
│   ├── js/
│   │   ├── main.js
│   │   ├── data.js
│   │   ├── i18n.js
│   │   ├── bgm.js
│   │   ├── sections/
│   │   └── motion/
│   ├── img/
│   │   ├── poster/
│   │   ├── artists/
│   │   └── og/
│   ├── audio/
│   ├── fonts/
│   └── vendor/
├── data/
│   ├── concert.json
│   ├── setlist.json
│   ├── artists.json
│   ├── bgm-kicks.json
│   └── i18n/
├── docs/
│   ├── REQUIREMENTS.md
│   └── readme/
```

<br>

## 📝 Content Management

| 항목 | 파일 |
|---|---|
| 공연 날짜, 장소, 링크 | `data/concert.json` |
| 셋리스트, 공개 시각 | `data/setlist.json` |
| 아티스트 정보 및 이미지 | `data/artists.json`, `assets/img/artists/` |
| 다국어 문구 | `data/i18n/*.json` |
| 포스터 레이어 위치 | `assets/js/motion/poster-layers.js` |

이미지나 JavaScript 수정 시 파일 URL의 `?v=` 값을 변경해 캐시를 갱신합니다.

<br>

## 💻 Development

JSON 데이터를 `fetch`로 불러오기 때문에 로컬 서버에서 실행해야 합니다.

```bash
python -m http.server 8000
```

→ [http://localhost:8000](http://localhost:8000)

<br>

## 🚀 Deployment

`main` 브랜치에 push하면 Vercel에서 자동 배포됩니다. 별도의 빌드 과정 없이 저장소 파일을 그대로 배포합니다.

<br>

## 🙌 Credits

<table>
  <tr>
    <td align="center" width="50%"><b>Development</b><br><a href="https://www.instagram.com/sohnsvmin/">@sohnsvmin</a></td>
    <td align="center" width="50%"><b>Design</b><br><a href="https://www.instagram.com/dongmen8lildongu/">@dongmen8lildongu</a></td>
  </tr>
</table>

아티스트 정보 수정 및 삭제 요청은 [@rapin_khu](https://www.instagram.com/rapin_khu/)로 문의 바랍니다.

<br>

## 📄 License

- Fonts — Pretendard, Bungee, Anton (SIL Open Font License 1.1)
- GSAP — GreenSock Standard License
- Poster, artist images, and music — RAP-IN 및 각 아티스트 소유

<br>

<div align="center">
<sub>© 2026 RAP-IN · Kyung Hee University Black Music Club</sub>
</div>
