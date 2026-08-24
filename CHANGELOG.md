# 개발 이력 (Development History)

## 2026-08-24 — 브랜드 배지 로고, 헤더 뒤로가기, 사진 교체 UX 개선

- **브랜드 로고**: 석한님 의도 재확인(원래대로 브랜드 로고 사용, 실제 도메인 연결 전 삭제 여부는 추후 재검토) — 실제 공식 SVG 로고 파일을 스크래핑/번들링하는 대신, "Shot on Brand" 테마에 캐논(레드)·소니·니콘·라이카·후지필름·핫셀블라드·애플 등 브랜드별 색상의 알약형 워드마크 배지를 캔버스에 직접 그려 표시하도록 구현(`theme-renderer.ts`의 `BRAND_BADGES`/`detectBrand`/`drawBrandBadge`). 인식되지 않는 제조사는 기존처럼 "Shot on <카메라명>" 텍스트로 폴백. 배지·모델명·우측 촬영정보가 겹치지 않도록 실제 렌더링 폭 측정 기반 축소/말줄임 로직도 배지 폭까지 포함해 재계산하도록 확장
- **헤더 뒤로가기**: `/frame` 페이지에 들어가면 되돌아갈 방법이 없다는 문제 확인 — 헤더의 "프레임 생성기" 버튼과 같은 자리에, 프레임 페이지에 있을 때는 "ExifLens" 문구로 바뀌어 홈으로 돌아가는 링크가 되도록 `SiteHeader`를 현재 경로 기반 조건부 렌더링으로 수정 (`usePathname` 사용)
- **사진 교체(드래그 앤 드롭)**: 프레임 생성기 페이지에서 사진을 이미 올린 후에는 새 사진으로 교체할 방법이 없던 문제 확인 — 원인은 사진 업로드 성공 시 업로더 컴포넌트 자체가 언마운트되고 캔버스 미리보기만 남아 드롭 영역이 사라졌기 때문. 업로드/파싱 로직을 `src/hooks/use-photo-upload.ts` 공용 훅으로 분리해 메인 페이지 업로더와 공유하고, 프레임 미리보기 캔버스 영역에도 동일한 드래그앤드롭·클릭 교체 기능을 추가(호버 시 "여기에 다른 사진을 드래그하면 교체됩니다" 안내 오버레이 표시)
- 4개 언어에 안내 문구 번역 추가
- 검증: `npm run build`(8개 페이지 SSG 유지), `npm run lint` 통과. Playwright로 (1) 헤더 "프레임 생성기"→"ExifLens" 왕복 네비게이션, (2) Canon 샘플로 브랜드 배지 겹침 없이 정상 렌더링, (3) 프레임 페이지에서 다른 사진을 드래그로 떨어뜨려 실제로 교체(카메라 필드 값이 새 사진 것으로 바뀜)까지 종단 확인

## 2026-08-24 — EXIF 프레임 생성기 테마 확장 Phase 1 (6/15 테마 + 드롭다운 UI)

- exif-frame.yuru.cam을 좀 더 참고한 제미나이의 추가 프롬프트(15개 테마 + 커스텀 테마)를 토대로, 우선 6개 테마 + 새 UI로 1차 진행. 나머지 9개(Leica/Hasselblad/필름 스트립/블러 배경/빈티지 앰버/그리드 스펙시트/다크 그라디언트/커스텀 등)는 다음 단계에서 이어서 진행 예정 (석한님 요청에 따라 나누어 진행)
- 진행 전 확인해 방향을 정한 사항:
  - **브랜드 로고 미사용**: 소니/캐논/라이카/애플 등 실제 브랜드 로고는 상표권 문제 소지가 있어 이미지 로고 대신 "Shot on Canon EOS R5m2"처럼 텍스트로만 브랜드를 표기 — 도메인 연결 전 최종적으로 다시 검토하기로 함(석한님 확인사항)
  - **폰트**: 외부 폰트 로딩 없이 시스템 폰트(고딕/명조/모노스페이스 3종)만 사용
- `src/lib/theme-renderer.ts` 신규 추가(테마 렌더링 전략 모듈): `ThemeDefinition`(id/배경색/글자색/폰트/레이아웃 스타일/기본 여백) 타입과 6개 프리셋(Classic Dark, Classic Light, Polaroid, Shot on Brand, Minimal Overlay, Full Border) 정의, 레이아웃 스타일(`bottom-bar`/`polaroid`/`shot-on-brand`/`overlay`/`square-border`)별 캔버스 드로잉 함수로 분리
- `src/lib/frame-canvas.ts`는 화면비 크롭/캔버스 내보내기 등 범용 유틸리티만 남기고, 테마별 렌더링 로직은 전부 `theme-renderer.ts`로 이전
- UI: 기존 다크/라이트 버튼을 **드롭다운(Select)**으로 교체 — 첨부해주신 참고 화면처럼 "프레임 테마" 라벨 바로 아래 드롭다운을 두고, 테마 선택 시 좌측 미리보기 캔버스에 즉시 반영되도록 구현. 테마 전환 시 해당 테마의 권장 여백(padding) 값도 함께 적용(이후 슬라이더로 재조정 가능)
- 4개 언어 메시지에 6개 테마명 번역 추가
- 구현 중 발견 후 수정한 버그: "Shot on Brand" 테마에서 카메라명이 길 경우 좌측 "Shot on ..." 텍스트와 우측 촬영정보 텍스트가 겹치는 문제 발견 → 실제 렌더링 폭을 측정(`measureText`)해 겹치면 두 텍스트 폰트 크기를 함께 축소하고, 그래도 안 맞으면 좌측 텍스트를 말줄임(…) 처리하도록 수정
- 검증: `npm run build`(8개 페이지 모두 SSG 유지), `npm run lint` 통과. Playwright로 6개 테마 전체를 실제 사진에 순회 적용해 캔버스 렌더링/드롭다운 동작을 확인하고, 스크린샷으로 각 테마의 실제 결과물을 육안 검증(테마 전환 시 좌측 미리보기 즉시 갱신 확인). "Shot on Brand" 겹침 버그는 일반 카메라명과 의도적으로 아주 긴 가상의 카메라명 두 경우 모두로 재검증

## 2026-08-24 — 신기능: EXIF 프레임 생성기 (exif-frame.yuru.cam 참고)

- 제미나이와의 추가 대화를 통해 도출된 신규 프롬프트를 기반으로, 업로드한 사진 하단에 촬영정보(카메라·렌즈·초점거리·조리개·셔터스피드·ISO·촬영일)를 담은 깔끔한 프레임을 자동으로 붙여 다운로드하는 기능을 별도 페이지(`/[locale]/frame`)로 추가
- 배치 방식은 석한님 요청에 따라 메인 페이지에 섹션을 더 쌓는 대신 완전히 독립된 페이지로 분리 — 메인 페이지의 광고 위치가 더 밀리지 않도록 함, 헤더 내비게이션에 "프레임 생성기" 링크 추가
- `src/lib/frame-canvas.ts`: 외부 라이브러리(html-to-image 등) 없이 순수 HTML5 Canvas API만으로 사진 합성 로직 구현 — 화면비 크롭(원본/1:1/4:5/4:3/3:2/16:9/9:16), 여백(사진 폭 기준 % 슬라이더), 다크(검정+흰 글씨)/라이트(흰색+검정 글씨) 테마, 정보 바 렌더링. 미리보기와 다운로드가 동일한 원본 해상도 캔버스를 그대로 사용해 별도의 저해상도/고해상도 렌더링 경로가 없음
- `src/lib/exif.ts`: EXIF `DateTimeOriginal` 필드를 "YYYY-MM-DD" 형식으로 추출하는 촬영일(`takenAt`) 파싱 추가
- `src/store/exif-store.ts`: 업로드된 사진의 원본 바이트(objectURL)를 함께 보관하도록 확장 — 메인 페이지에서 이미 사진을 업로드했다면 프레임 생성기 페이지로 이동 시 재업로드 없이 바로 이어서 사용 가능 (교체/초기화 시 기존 objectURL 해제)
- `src/components/exif-frame-generator.tsx`: 테마 토글, 화면비 선택, 여백 슬라이더, 메타데이터 수동 수정(입력값은 프레임에만 반영되며 상단 EXIF 패널 값은 변경되지 않음, "초기화" 버튼으로 감지값 복원), PNG/JPG 내보내기 형식 선택, "프레임 사진 다운로드" 버튼 구현
- `src/components/ui/slider.tsx` 추가 (기존 shadcn 스타일 수동 구현 관례를 따라 네이티브 `<input type="range">` 기반)
- 4개 언어(en/ko/es/ja) 메시지에 `Frame` 네임스페이스 및 헤더 내비게이션 문구 신규 번역 추가
- 구현 중 발견한 이슈: 사진 전환 시 상태를 초기화하는 로직을 처음에는 `useEffect` 안에서 직접 `setState`를 호출하는 방식으로 작성했으나, 이는 "effect 안에서의 동기적 setState는 연쇄 렌더링을 유발할 수 있다"는 린트 규칙에 걸림 → React 공식 권장 패턴대로 편집 UI를 `imageUrl`로 키(key)를 건 하위 컴포넌트로 분리해, 사진이 바뀌면 자연스럽게 리마운트되며 상태가 초기화되도록 재설계 (effect 내 동기적 setState 완전히 제거)
- 검증: `npm run build`(en/ko/es/ja 각각 메인 페이지 + `/frame` 페이지 총 8개 모두 `● SSG` 정적 생성 확인), `npm run lint` 모두 통과. Playwright로 실제 프로덕션 빌드에 대해 (1) `/frame` 페이지 직접 접속 후 업로드→프레임 렌더링→메타데이터 필드 값 확인(Canon EOS R7 등)→편집→초기화→PNG 다운로드까지 종단 테스트, (2) `DateTimeOriginal` 태그가 있는 별도 샘플로 촬영일 파싱("2026-08-20") 검증, (3) 메인 페이지에서 업로드 후 헤더 내비게이션으로 프레임 생성기로 이동 시 재업로드 없이 캔버스가 바로 렌더링되는 것까지 확인

## 2026-08-24 — Phase 4: SEO, 실제 애드센스 & 쿠팡파트너스 API 연동

- **SEO**: `src/lib/seo.ts` 추가 (사이트 URL, OG locale, hreflang alternates, WebApplication JSON-LD 생성). `src/app/[locale]/layout.tsx`를 `generateMetadata`로 전환해 4개 언어 canonical/hreflang(`x-default` 포함)/Open Graph/Twitter 카드 메타데이터와 JSON-LD 구조화 데이터를 실제로 출력하도록 구현
- **구글 애드센스 실계정 연동**: 발급받은 퍼블리셔 ID(`pub-0042120343274941`)를 `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` 환경변수로 등록, 레이아웃에 조건부 `next/script` 애드센스 로더 추가, `public/ads.txt` 생성
- **쿠팡파트너스 Open API 실연동**:
  - `src/lib/coupang.ts`: HMAC-SHA256 기반 "CEA" 서명 방식으로 인증하는 서버 전용 API 클라이언트 작성, 상품 검색 결과 캐싱(6시간) 적용
  - `src/app/api/coupang/search/route.ts`: ND 필터별 검색 키워드 화이트리스트를 둔 Route Handler로 임의 키워드 남용 방지 및 시간당 10회 쿼터 보호
  - 발급받으신 실제 Access Key/Secret Key는 `.env.local`에만 저장(git 추적 제외, `NEXT_PUBLIC_` 접두사 미사용으로 클라이언트에 노출되지 않음), 소스 코드에는 하드코딩하지 않음
- **국가/언어 혼합 제휴사 분기**: `src/proxy.ts`가 Vercel의 `x-vercel-ip-country` 헤더를 `geo-country` 쿠키로 전달하도록 수정. 이 쿠키를 클라이언트 컴포넌트(`src/components/gear-recommendation.tsx`)에서 읽어 지역(한국→쿠팡) 우선, 신호가 없을 때는 UI 언어(ko→쿠팡)로 폴백하는 로직(`src/lib/affiliate.ts`) 구현. 아마존 제휴는 계정 미보유로 현재 `null`(섹션 숨김) 처리, 계정 준비 시 바로 확장 가능한 구조로 작성
  - ⚠️ 설계 변경: 최초에는 이 분기 로직을 서버 컴포넌트에서 `cookies()`로 읽도록 구현했으나, 이 경우 Next.js가 페이지 전체를 정적 생성(SSG) 대상에서 제외하고 매 요청마다 서버 렌더링(동적)하게 되는 부작용을 발견 → SEO/성능 저하 방지를 위해 즉시 클라이언트 사이드 분기(쿠키를 브라우저에서 직접 읽음, `useSyncExternalStore` 사용)로 재작성하여 4개 언어 페이지 모두 정적 생성(●, SSG)이 유지되도록 수정함
  - `src/components/coupang-gear-cards.tsx`: 상품 카드 UI(로딩 스켈레톤/상품 그리드/실패 시 안내 문구 폴백), 법적 고지 문구(`gearDisclosure`, 4개 언어) 표시, 링크에 `rel="nofollow sponsored noopener noreferrer"` 적용
- 검증: `npm run build`(4개 언어 페이지 모두 `● SSG`로 정적 생성 확인), `npm run lint` 모두 통과. Playwright로 `/ko` 페이지의 하이드레이션 불일치 여부 및 API 실패 시 안내 문구 폴백 정상 동작 확인
- ⚠️ **미검증 항목**: 클라우드 샌드박스와 석한님 macOS 데스크톱 브리지(격리된 VM) 양쪽 모두에서 `api-gateway.coupang.com`으로의 네트워크 접근이 차단되어(`CONNECT tunnel failed, 403`), 실제 쿠팡 API 호출 자체는 제가 직접 검증하지 못했습니다. 석한님의 실제 macOS 터미널에서 개발 서버 실행 후 직접 확인이 필요합니다 (시간당 10회 쿼터 유의)

## 2026-08-24 — Phase 3: ND 필터 계산기 실동작 & 카운트다운 타이머

- `src/lib/nd-calculator.ts`: ND 필터 프리셋(ND4/2-stop, ND8/3-stop, ND64/6-stop, ND1000/10-stop, ND32000/15-stop, 커스텀), 기준 셔터스피드 프리셋(1/1000s~30s), 계산 공식(`T_new = T_base × 2^stops`), 결과 포맷팅(초/분초/시분/일시 단위 자동 전환) 구현
- `src/store/nd-calculator-store.ts`: 기준 셔터스피드·필터 선택·커스텀 스톱 값을 관리하는 Zustand 스토어. 업로드된 사진의 EXIF 셔터스피드가 파일당 1회 자동으로 기준값에 반영되며, 이후 드롭다운으로 수동 변경 가능
- `src/components/nd-calculator-card.tsx`: 기준 셔터스피드/ND 필터 드롭다운, 커스텀 스톱 입력, 실시간 계산 결과, 카운트다운 타이머 UI를 모두 실동작으로 구현 (더 이상 더미 값 아님)
- `src/hooks/use-countdown-timer.ts`, `src/lib/beep.ts`: 실제 카운트다운 타이머(진행 중 mm:ss 표시, 정지/재시작) 및 Web Audio API 기반 완료 알림음(사운드) + 시각적 완료 표시 구현. 계산된 셔터스피드가 1초 이상일 때만 타이머 버튼 노출(요구사항 5번 충족)
- 4개 언어 메시지에 커스텀 스톱, 감지됨 표시, 타이머 정지/재시작/완료 문구 추가
- 검증: 기본값(1/125s, ND1000)에서 스펙 예시와 동일한 "8.2s" 산출 확인, 1/4s+ND4(2-stop)→1s, 커스텀 3스톱(0.25s 기준)→2s 등 계산값을 Playwright로 검증, 실제 8초 타이머를 끝까지 실행해 카운트다운·완료 알림·재시작까지 종단 테스트 통과 (스크린샷 확인)

## 2026-08-24 — 버그 수정: 캐논 카메라명 중복 표시

- 석한님이 실제 Canon EOS R7으로 촬영한 원본 사진으로 테스트 중, "카메라" 항목이 "Canon Canon EOS R7"로 제조사명이 중복 표시되는 것을 발견
- 원인: 캐논/파나소닉 등 일부 제조사는 EXIF Model 필드에 이미 제조사명이 포함되어 있는데(`Model: "Canon EOS R7"`), Make + Model을 단순히 이어붙이는 로직이라 중복 발생
- `src/lib/exif.ts`에 `combineMakeAndModel()` 추가: Model이 이미 Make로 시작하면 Model만 사용하도록 수정
- 검증: 동일한 Canon 샘플(`Canon`/`Canon EOS R7`)로 Playwright 재테스트 → "Canon EOS R7"로 정상 표시 확인, 기존 Sony 샘플(`Sony`/`ILCE-7M4`, 중복 아님)로 회귀 테스트 → "Sony ILCE-7M4" 그대로 정상 유지 확인

## 2026-08-24 — 원클릭 실행 스크립트 추가

- `ExifLens 실행.command` 추가: Finder에서 더블클릭하면 (1) 이 파일이 있는 프로젝트 폴더로 자동 이동(`cd`) → (2) `npm run dev` 실행 → (3) 개발 서버 준비되면 Chrome이 자동으로 `localhost:3000`을 여는 완전 원클릭 흐름
- macOS에서 더블클릭으로 실행되려면 실행 권한(`chmod +x`)이 필요해 실행 권한을 부여해 둠
- 석한님의 macOS 데스크톱 폴더 접근 권한을 받아 `~/Desktop/exiflens/`에 직접 반영 완료

## 2026-08-24 — 개발 편의: `npm run dev` 시 Chrome 자동 실행

- `scripts/dev-open.mjs` 추가: `next dev`를 실행하고 개발 서버가 준비되면(stdout에서 실제 URL 감지) 자동으로 Google Chrome을 열도록 함
- `package.json`의 `dev` 스크립트를 `node scripts/dev-open.mjs`로 변경, 자동 실행을 원치 않을 경우를 위해 `dev:plain`(기존 `next dev`) 스크립트 유지
- macOS는 `open -a "Google Chrome"`, Windows는 `start chrome`, Linux는 `google-chrome`/`xdg-open`으로 분기 처리
- 포트가 3000이 아닌 다른 포트로 뜨는 경우에도 실제 감지된 URL로 열리며, URL 감지가 안 될 경우 8초 후 `localhost:3000`으로 폴백
- Ctrl+C(SIGINT/SIGTERM) 시 `next dev` 하위 프로세스까지 함께 종료되도록 처리
- 샌드박스 환경(GUI/Chrome 없음)에서 서버 기동 및 URL 감지, Chrome 실행 실패 시 경고 메시지 출력까지 정상 동작 확인. 실제 Chrome 자동 실행은 GUI가 있는 석한님 macOS 환경에서 최종 확인 필요

## 2026-08-24 — Phase 1: 프로젝트 셋업 및 기본 레이아웃

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 프로젝트 스캐폴딩 (`create-next-app`)
- shadcn/ui 수동 설정 (네트워크 제약으로 CLI 대신 수동 구성): `components.json`, `lib/utils.ts`, `Button`, `Select` 컴포넌트
- `next-intl` 기반 i18n 라우팅 구조 구성 (`/en`, `/es`, `/ja`, `/ko`, 기본 언어 English)
  - `src/i18n/routing.ts`, `navigation.ts`, `request.ts`, `src/proxy.ts` (Next.js 16의 `middleware` → `proxy` 명명 규칙 적용)
  - `messages/{en,ko,es,ja}.json` 번역 리소스
- 공통 레이아웃 구현: Header(로고+언어 선택), Ad-Zone Top/Middle/Bottom 플레이스홀더, Footer
- 다크 모드 기본 적용 (`next-themes`, `defaultTheme="dark"`)
- `app/[locale]/page.tsx` 메인 페이지 뼈대: 업로더 섹션, EXIF 표시 섹션, ND 필터 계산기 섹션(더미 값), 장비 추천 섹션
- Google Fonts(Geist) 대신 시스템 폰트 스택으로 전환 — 네트워크 제약 환경에서도 빌드 안정성 확보
- 빌드/린트 검증 완료 (`npm run build`, `npm run lint` 모두 통과), 4개 언어 정적 페이지 생성 확인
- git 저장소 초기화 및 커밋 2건으로 백업 완료

### 다음 단계 (Not started yet)
- Phase 3: ND 필터 계산 로직 실연동 + 카운트다운 타이머 기능
- Phase 4: SEO 메타데이터/구조화 데이터, 실제 애드센스 스크립트, 아마존 제휴 링크 연동
- 실제 도메인 연결 및 Vercel 배포

## 2026-08-24 — Phase 2: EXIF 파서 및 드래그앤드롭 컴포넌트

- `exifreader`, `zustand` 패키지 설치
- `src/lib/exif.ts`: 브라우저에서 이미지 파일을 직접 파싱하는 `parseExifFile()` 및 셔터스피드/조리개/초점거리 포맷팅 유틸 작성 (파일이 서버로 전송되지 않음)
- `src/store/exif-store.ts`: 추출된 EXIF 데이터를 관리하는 Zustand 스토어 (idle/loading/success/error 상태)
- `src/components/exif-uploader.tsx`: 실제 동작하는 드래그앤드롭 + 클릭 업로드 컴포넌트, 지원하지 않는 파일 형식/용량 초과/파싱 실패에 대한 에러 메시지 처리
- `src/components/exif-panel.tsx`, `nd-calculator-card.tsx`: Section 2·3을 Zustand 스토어와 연동해 실제 카메라/렌즈/셔터스피드/조리개/ISO/초점거리 값을 표시하고, ND 계산기의 "기준 셔터스피드"에 추출값을 자동 반영 (요구사항 4번 충족)
- 4개 언어(en/ko/es/ja) 메시지 파일에 업로더 관련 문구(리셋, 에러 3종) 추가
- "타이머 시작" 버튼은 Phase 3에서 실제 로직이 붙기 전까지 비활성화 상태로 유지 (동작하지 않는 기능을 동작하는 것처럼 보이지 않도록)
- 검증: `npm run build`/`npm run lint` 통과, `piexif`로 생성한 샘플 EXIF JPEG(Sony ILCE-7M4, 24-70mm GM, 1/125s, f/8.0, ISO100, 35mm)을 Node에서 직접 파싱해 포맷팅 로직 정확성 확인, Playwright로 실제 프로덕션 빌드에 대해 업로드 → 화면 반영까지 종단 테스트 통과

### 다음 단계 (Not started yet)
- Phase 3: ND 필터 스톱 선택 UI 실동작 + 계산 공식(`T_new = T_base × 2^N`) 연동, 카운트다운 타이머 기능
- Phase 4: SEO 메타데이터/구조화 데이터, 실제 애드센스 스크립트, 아마존 제휴 링크 연동
- 실제 도메인 연결 및 Vercel 배포
