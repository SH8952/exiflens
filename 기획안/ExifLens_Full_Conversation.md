# [기획서 및 프롬프트] 카메라 EXIF 분석 & ND 필터 장노출 계산기 (ExifLens)

---

## 1. 서비스명 아이디어 및 핵심 가치 제안 (USP)

### 서비스명 아이디어
* **ExifLens.com** / **ExifCalc.com** (직관적이며 도메인 확보 및 기억하기 용이)
* **ShutterShift.com** / **LightND.com** (장노출 및 필터 전문 도구 느낌 강조)

### 핵심 가치 제안 (USP)
* **All-in-One 시각적 계산 프로세스:** 이미지 drag-and-drop만으로 0.1초 만에 EXIF(셔터스피드, ISO, 조리개, 렌즈 mm)를 자동 추출하고, 클릭 한 번으로 선택한 ND 필터 단수(예: ND1000)에 따른 최적의 장노출 시간을 즉시 계산해 줍니다.
* **100% Client-Side Privacy:** 이미지를 서버로 업로드하지 않고 브라우저(exifreader / exif-js)에서 계산하여 빠른 처리 속도와 강력한 보안성을 보장합니다.
* **장노출 타이머 & 시각적 노출 미리보기:** 계산에 그치지 않고 실제 촬영 시 활용할 수 있는 카운트다운 타이머(사운드 알림 포함)와 노출 변화 시뮬레이션을 제공합니다.

---

## 2. 기술 스택 추천

| 구 분 | 추천 기술 / 라이브러리 | 선정 사유 |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | SSR/SSG 지원으로 빠른 SEO 최적화 및 글로벌 검색 노출 극대화 |
| **Styling** | **Tailwind CSS + shadcn/ui** | 반응형 모바일 UI 구현 및 경량화된 UI 컴포넌트 구성 |
| **i18n** | **next-intl** | URL 파라미터 기반(`/en`, `/ja`, `/es` 등) 글로벌 SEO 대응 |
| **EXIF Parsing**| **exifreader** 또는 **exif-js** | 클라이언트 사이드에서 RAW 및 JPG/PNG EXIF 메타데이터 파싱 |
| **State / Form** | **Zustand** | 계산기 파라미터 및 타이머 상태를 경량화해서 관리 |
| **Deployment** | **Vercel** | 서버리스 기반의 빠른 Edge 네트워크 배포 및 Zero-Maintenance |

---

## 3. 페이지 구조 및 UI/UX 레이아웃 상세 설명

### 페이지 구조 (Single Page App / Multi-route SEO)
* `/` (Home): 메인 EXIF 파서 + ND 필터 계산기 통합 툴
* `/guides/[slug]`: ND 필터 가이드 및 장노출 촬영 팁 (SEO 블로그)
* `/privacy` & `/terms`: 구글 애드센스 승인 필수 정적 페이지

### UI/UX 레이아웃 디자인

```text
+-----------------------------------------------------------------------+
|  [Header] Logo | Language Selector (EN/ES/JA/KO)                      |
+-----------------------------------------------------------------------+
|  [Ad-Zone 1] Top Display Banner (Leaderboard 728x90)                  |
+-----------------------------------------------------------------------+
|  [Main Container]                                                     |
|  +-----------------------------------------------------------------+  |
|  |  [Section 1] Image Dropzone (Upload JPG/RAW)                    |  |
|  |  "Drag & Drop photo here to auto-extract EXIF"                  |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +--------------------------------+ +------------------------------+  |
|  | [Section 2] Extracted EXIF     | | [Section 3] ND Filter Calc   |  |
|  | - Camera: Sony A7 IV           | | - Target ND: [ ND1000 (10-Stop)|  |
|  | - Shutter: 1/125s (Auto Input) | | - New Shutter Speed: 8s      |  |
|  | - Aperture: f/8.0 | ISO: 100   | | [ Start Timer Button ]       |  |
|  +--------------------------------+ +------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Section 4] Gear Recommendation & Affiliate Cards (Amazon/B&H)  |  |
|  | - Recommended ND Filters for Sony 24-70mm f/2.8                 |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|  [Ad-Zone 2] In-feed / Bottom Banner                                  |
+-----------------------------------------------------------------------+
|  [Footer] Copyright & Links                                           |
+-----------------------------------------------------------------------+
```

---

## 4. 주요 기능별 데이터 로직 및 계산 공식

### EXIF 파싱 로직
* 유저가 이미지를 올리면 브라우저 단에서 `exifreader`로 메타데이터 읽기
* 추출 항목: `ExposureTime` (셔터스피드), `FNumber` (조리개), `ISOSpeedRatings` (ISO), `FocalLength` (초점거리), `LensModel` (렌즈 모델명)

### ND 필터 장노출 계산 공식
ND 필터를 착용했을 때의 최종 셔터스피드 $T_{	ext{new}}$는 기준 셔터스피드 $T_{	ext{base}}$와 ND 필터의 스탑 수 $N$에 의해 다음과 같이 계산됩니다.

$$T_{	ext{new}} = T_{	ext{base}} 	imes 2^N$$

* **예시:** $T_{	ext{base}} = 1/125$초, ND1000 ($N = 10$ 스탑)
  $$T_{	ext{new}} = rac{1}{125} 	imes 2^{10} = rac{1024}{125} pprox 8.19 	ext{초}$$
* UI 출력 시 $T_{	ext{new}} \ge 1$초 이상이면 소수점 첫째 자리 또는 분/초 단위로 변환해 가독성을 높입니다.

---

## 5. SEO 최적화 및 애드센스 광고 배치 구역 제안

### SEO 최적화 전략
1. **Dynamic Metadata & Open Graph:** `next-intl` 기반으로 각 언어별 canonical URL 및 hreflang 태그 자동 생성
2. **Schema.org Structured Data:** `WebApplication` 및 `HowTo` 구조화 데이터 적용으로 Google Rich Snippet 노출 증대
3. **Keyword Target:** "ND filter calculator", "EXIF viewer online", "Long exposure shutter speed calc"

### 애드센스 & 제휴 마케팅 배치 전략
* **Ad-Zone 1 (Top Header):** 728x90 반응형 디스플레이 광고
* **Ad-Zone 2 (Side/In-content):** 계산기 결과 출력 하단에 300x250 네이티브 광고 배치
* **Affiliate Monetization (핵심 수익원):** EXIF에서 렌즈 필터 구경(예: 82mm)을 감지하면 "Top 82mm ND Filters on Amazon" 클릭 시 제휴 링크(Amazon Affiliate Tag) 연결 카드 노출

---

## 6. 클로드(Claude)에게 전달할 단계별 프롬프트 (Prompt for Claude)

---

### Phase 1: 프로젝트 셋업 및 기본 레이아웃 구성
```text
I am building a web service called "ExifLens" using Next.js 14 (App Router), Tailwind CSS, and shadcn/ui.
This app is a global tool that parses photo EXIF data and calculates long exposure times for ND filters.

Please set up the initial layout and routing structure with the following requirements:
1. Support i18n structure using `next-intl` (Default language: English).
2. Create a clean, responsive layout with a Header, Main Container, Ad Banner Placeholders (Top, Middle, Bottom), and Footer.
3. Use dark mode by default, tailored for photographers.
4. Provide the code for `app/[locale]/page.tsx` and the main layout.
```

---

### Phase 2: EXIF 파서 및 드래그앤드롭 컴포넌트 개발
```text
Now let's build the EXIF Parsing feature.

Requirements:
1. Create a client-side Drag and Drop file upload component (`ExifUploader.tsx`).
2. Use the `exifreader` library to parse EXIF metadata directly in the browser without uploading files to a server.
3. Extract and display the following data cleanly:
   - Camera Model & Lens Model
   - Shutter Speed (ExposureTime)
   - Aperture (FNumber)
   - ISO
   - Focal Length
4. If Shutter Speed is successfully extracted, pass this value directly to the ND Filter Calculator state.
5. Provide the code for the component and necessary utility functions.
```

---

### Phase 3: ND 필터 장노출 계산기 및 타이머 개발
```text
Let's implement the ND Filter Long Exposure Calculator logic and Timer UI.

Requirements:
1. Create `NdCalculator.tsx`.
2. Input: Base Shutter Speed (Auto-filled from EXIF or manually selectable via dropdown like 1/1000s to 30s).
3. Selection: ND Filter Stop selection (ND4/2-Stop, ND8/3-Stop, ND64/6-Stop, ND1000/10-Stop, ND32000/15-Stop, or custom stop input).
4. Calculation Logic: Calculate new shutter speed using the formula: New Speed = Base Speed * (2 ^ Stops).
5. Output & Feature:
   - Display the target shutter speed clearly (e.g., "8.2 seconds" or "2 mins 15 secs").
   - If calculated time is >= 1 second, display a "Start Countdown Timer" button with audio/visual notification when finished.
6. Provide complete Next.js React code using Tailwind CSS.
```

---

### Phase 4: SEO, i18n 적용 및 제휴 링크 모듈 완성
```text
Finally, let's optimize the application for SEO and Affiliate Monetization.

Requirements:
1. Add dynamic metadata generation in `page.tsx` including Open Graph tags, canonical URLs, and structured data (Schema.org WebApplication).
2. Add dynamic Amazon Affiliate recommendation links based on extracted lens info or selected filter thread size (e.g., "Recommended 82mm ND Filters").
3. Add placeholder components for Google AdSense banners (Leaderboard 728x90, Rectangle 300x250) positioned for maximum CTR without violating AdSense policies.
4. Output the complete integrated page file and SEO utility files.
```
