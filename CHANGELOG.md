## 2026-09-01 — 모바일 헤더 내비게이션이 줄바꿈되던 문제 수정: 햄버거 메뉴로 전환

- 직전 배치에서 헤더에 소개/가이드/FAQ 링크 3개를 추가한 뒤, 모바일 화면에서 로고+링크 5개+언어 선택이 한 줄에 다 들어가지 못해 "소개"가 두 줄로 쪼개지는 등 레이아웃이 깨지는 문제 발생 (사용자가 실제 모바일 스크린샷으로 제보)
- 해결 방식은 사용자에게 3가지 선택지(햄버거 메뉴 전환 / 모바일에서 소개·가이드·FAQ 숨기기 / 가로 스크롤 허용)를 제시해 "햄버거 메뉴로 전환(권장)"으로 확정
- `src/components/site-header.tsx`: `sm` 이상(데스크톱)에서는 기존과 동일하게 모든 링크를 한 줄에 표시. `sm` 미만(모바일)에서는 텍스트 링크들을 숨기고 언어 선택 옆에 햄버거 아이콘(lucide `Menu`/`X`) 버튼만 노출, 클릭 시 헤더 바로 아래에 소개/가이드/FAQ/프레임 만들기 링크가 세로로 펼쳐지는 패널 표시. 링크 클릭 시 자동으로 메뉴 닫힘
- 4개 언어 메시지 파일에 `Header.openMenu`/`closeMenu`(버튼 aria-label) 키 추가
- 검증: `npm run build`/대상 파일 `eslint` 통과. Playwright로 모바일 뷰포트(412×915)에서 메뉴 닫힘/열림/FAQ 페이지 이동 스크린샷, 데스크톱 뷰포트(1280×800)에서 기존 레이아웃이 그대로 유지되는지 스크린샷으로 최종 확인 (클라우드 세션에서 먼저 검증한 뒤, 지난번과 동일한 이유로 이 맥 로컬 저장소 파일에 다시 직접 적용)

## 2026-09-01 — 헤더에 소개/가이드/FAQ 내비게이션 추가, FAQ를 별도 페이지로 분리

- 사용자 요청: 메인 페이지 최하단까지 스크롤해야 보이던 FAQ를 최상단 "프레임 만들기" 버튼 옆에서 바로 접근할 수 있게 개선. 최종적으로 (1) 기존 푸터 하단에 있던 "소개"·"가이드" 링크를 헤더 최상단으로 이동, (2) "FAQ" 버튼을 헤더에 신규 추가해 클릭 시 자주 묻는 질문만 담은 별도 페이지(`/faq`)로 이동, (3) 메인 페이지 하단의 FAQ 섹션은 삭제하고 `/faq` 페이지로 완전히 이전(중복 없음)하는 것으로 확정
- `src/components/site-header.tsx`: "프레임 만들기" 링크 앞에 소개(`/about`)·가이드(`/guides`)·FAQ(`/faq`) 링크 3개 추가. 기존 링크와 동일한 스타일 재사용
- `src/components/site-footer.tsx`: 헤더로 옮긴 "소개"·"가이드" 링크를 푸터에서 제거
- `src/components/home-faq-section.tsx`를 `home-usage-section.tsx`로 교체: FAQ 부분(및 FAQPage JSON-LD)을 제거하고 "사용법" 섹션만 남김
- `src/app/[locale]/faq/page.tsx` 신규 생성: about/guides 페이지와 동일한 레이아웃 패턴으로 자주 묻는 질문 전용 페이지 작성, 기존 `Home.faq` 번역 데이터 재사용, FAQPage 구조화 데이터도 이 페이지로 이전
- 4개 언어 메시지 파일에 `Header.aboutNav`/`guidesNav`/`faqNav`, `Faq.title`/`subtitle` 키 추가, `src/app/sitemap.ts`에 `/faq` 추가
- **작업 경위**: 이 변경은 클라우드 세션에서 먼저 작업·커밋했으나, 클라우드 저장소 사본과 이 맥(Mac) 로컬 저장소의 git 히스토리가 서로 다른 시점부터 완전히 갈라져 있어(공통 조상 커밋을 찾을 수 없는 상태) 클라우드 쪽 커밋을 그대로 병합/체리픽할 수 없었음. 이후 사용자가 맥에서 직접 `git push`를 진행하면서 클라우드의 변경사항이 반영되지 않은 채(FlyDroneMap 크로스링크 등 맥 전용 커밋만) 배포되는 문제가 발생 — 원인 파악 후, 동일한 코드 변경을 이 맥 로컬 저장소 파일에 다시 직접 적용하여 재작성
- 검증: `npm run build`/`npm run lint` 통과 확인 후 커밋

## 2026-09-01 — FlyDroneMap 크로스링크 추가 (SEO/트래픽 시너지)

- 홈페이지 "장비 추천" 섹션 바로 아래에 자매 사이트 FlyDroneMap(드론 비행 날씨·KP지수 대시보드)으로 연결되는 문맥형 추천 카드 1개 추가
- 두 사이트가 사진/영상 촬영자라는 동일 타겟층을 공유한다는 점에 착안, 야간·일출/일몰 드론 촬영 전 비행 날씨 확인을 안내
- 구글 링크 스킴 정책 대응: 사이트 전역이 아닌 단일 문맥형 링크 1개만 배치, `rel="noopener noreferrer"` 사용(nofollow 없음 — 정당한 자체 추천이므로), 광고 코드는 전혀 건드리지 않음
- ko/en/es/ja 4개 언어 번역 텍스트 추가
- (부수 수정) tsconfig.json에 `_backups`(로컬 전용, git 추적 안 됨) 제외 처리 — 로컬 백업 폴더의 낡은 스냅샷이 `npm run build`의 타입 체크를 방해하던 문제 해결

# 개발 이력 (Development History)

## 2026-09-02 — 가이드 아티클 자동 발행: 화이트밸런스 완벽 가이드

- 예약 작업(scheduled task)이 automation/guide-topics-queue.json의 order 7 주제를 선택해 4개 언어(en/ja/ko/es)로 신규 작성: "화이트밸런스 완벽 가이드: 켈빈 값부터 커스텀 설정까지" (White Balance Explained)
- 켈빈 색온도의 의미, 화이트밸런스 프리셋과 혼합광에서의 한계, 커스텀 화이트밸런스(그레이카드) 설정법, RAW vs JPEG에서 화이트밸런스 되돌리기 가능 여부, 자주 하는 실수(AWB로 노을/일출 색감이 지워지는 문제), 실전 체크리스트로 구성
- 카테고리는 기존 "카메라 기초 & 노출"(Camera Basics & Exposure) 재사용 — 4개 언어 모두 동일 카테고리에 배정
- automation/guide-topics-queue.json: order 7 항목 published: true, publishedDate: "2026-09-02"로 갱신
- 검증: 클라우드 세션에서 `npm run build` 통과 확인 후 발행 패키지 생성

## 2026-09-01 — SEO 개선 1일차: 가이드 페이지 BreadcrumbList 구조화 데이터 추가

- 배경: 구글 서치 콘솔 분석 결과(2026-08-31) 노출은 급증하지만 클릭률이 거의 없는 문제 확인. Gemini가 제안한 안전한 개선안을 하루 하나씩 자동 적용하기로 함(석한님 승인). 1일차 항목 진행.
- 조치:
  - `src/lib/seo.ts`: `breadcrumbJsonLd(items)` 헬퍼 함수 신규 추가 — schema.org `BreadcrumbList` JSON-LD 생성
  - `src/app/[locale]/guides/[slug]/page.tsx`: 기존 `articleJsonLd` 스크립트 옆에 breadcrumb 스크립트 추가. 경로: Home(`ExifLens`) → Guides → 현재 글 제목
  - `src/app/[locale]/guides/page.tsx`(가이드 목록): Home → Guides 2단계 breadcrumb 추가
  - 새 번역 키 추가 없이 기존 `Home.title`, `Guides.title` 재사용
  - 검색결과에 "ExifLens › Guides › 글 제목" 형태의 경로 노출을 기대하는 변경으로, 광고 코드(GA4/AdSense/ads.txt)는 건드리지 않음
- 검증: `npx tsc --noEmit`, `npx eslint src/lib/seo.ts src/app/[locale]/guides/page.tsx src/app/[locale]/guides/[slug]/page.tsx` 정상 통과. `next build` 정상 완료(124개 정적 페이지). `next start` 위에서 가이드 목록/상세 페이지 각각 curl로 렌더링된 HTML을 확인해 `BreadcrumbList` JSON-LD가 올바른 이름·URL·순서로 삽입됨을 확인

## 2026-09-01

### Added
- New guide article published in 4 languages (en/ja/ko/es): "Panning Shot Technique" (패닝샷(동체 흐림 효과) 촬영법) — shutter speed selection, subject tracking, and ND filter usage for panning shots. Category: Camera Basics & Exposure (카메라 기초 & 노출).

## 2026-08-31 — 추출된 EXIF에 GPS 위치 + 지도보기 모달 추가

- 요청: 추출된 EXIF 목록의 초점거리 아래에 GPS 정보도 노출할 수 있는지 석한님 문의. 위경도는 텍스트로, 우측에 "지도보기" 링크를 두어 클릭 시 구글 지도 모달이 뜨도록, GPS 없는 사진은 다른 항목처럼 그대로 표시하도록 확정
- 조치:
  - `src/lib/exif.ts`: 일반 이미지(exifreader, `expanded: true`) 경로에서 `tags.gps`(이미 부호가 적용된 십진수 위경도)를 `ParsedExif.gps`로 매핑
  - `src/lib/raw-exif.ts`: RAW(LibRaw) 경로에서 `gps_data`(도/분/초 튜플 + N/S/E/W 반구 기준)를 십진수로 변환. `gpsparsed` 플래그로 "GPS 정보 없음"과 "위경도 0,0"을 구분
  - `src/components/gps-map-modal.tsx` 신규: 새 npm 의존성 추가 없이 커스텀 모달로 구현(배경 클릭/ESC로 닫힘). 구글 지도 무료 임베드 URL(`output=embed`, API 키 불필요) 사용
  - `src/components/exif-panel.tsx`: 초점거리 바로 아래 GPS 위치 행 추가
  - 4개 언어(en/ja/ko/es) 번역 추가
- 검증: 실제 프로덕션 빌드(`next build && next start`) 위에서 Playwright로 GPS 있는/없는 합성 JPG 각각 테스트해 위경도 표시, "지도보기" 버튼 노출 여부, 모달 오픈 시 좌표가 반영된 구글 지도 URL, ESC로 닫힘까지 확인. `npx tsc --noEmit`, `npx eslint` 정상 통과. 진짜 GPS 태그가 있는 RAW 원본 파일이 없어 RAW 경로의 실제 파일 재현 검증은 못했음 — **사용자 확인 필요**

## 2026-08-31 — 헤더 '프레임 생성기' 버튼 문구를 '프레임 만들기'로 통일

- 요청: 업로드 박스 위에 새로 추가한 "프레임 만들기" 버튼과 최상단 헤더의 기존 "프레임 생성기" 버튼 문구가 달라 통일감이 떨어진다는 석한님 피드백. 모든 언어를 동일한 기준으로 맞춰 달라는 확인
- 조치: `messages/{ko,en,ja,es}.json`의 `Header.frameNav` 값을 각 언어의 `Home.goToFrameButton`과 동일한 문구로 변경
  - ko: 프레임 생성기 → 프레임 만들기
  - en: Frame Generator → Create a Frame
  - ja: フレーム生成 → フレームを作る
  - es: Generador de Marcos → Crear un marco
- 검증: 실제 프로덕션 빌드(`next build && next start`) 위에서 Playwright로 4개 언어 헤더 텍스트를 모두 실측해 의도한 문구로 정상 표시됨을 확인. `npx tsc --noEmit`, `npx eslint`, JSON 유효성 검사 정상 통과

## 2026-08-31 — 홈 업로드 박스 사진 미리보기 크기 확대

- 요청: 방금 추가한 홈 업로드 박스 사진 미리보기가 프레임 생성기보다 작게 보인다는 석한님 피드백. 사진을 박스 크기만큼 크게 채우면 하단 파일명/재업로드 바는 지금 그대로 유지해도 괜찮다는 확인
- 조치: `src/components/exif-uploader.tsx`
  - 미리보기가 있을 때는 컨테이너의 빈 상태용 여백(px-6 py-10)을 제거
  - 사진에 걸려 있던 `max-h-[320px]`/`object-contain` 제한을 제거하고 `h-auto w-full`로 변경해 프레임 생성기 캔버스(`h-auto w-full`)와 동일한 방식으로 박스 폭 전체를 채우도록 수정
  - 하단 파일명/재업로드 오버레이 바는 변경하지 않음(요청 범위 외)
- 검증: 실제 프로덕션 빌드(`next build && next start`) 위에서 Playwright로 실측 — 사진이 컨테이너 폭(1120px)에 거의 맞닿아(1116px) 원본 비율 그대로 표시됨을 bounding box로 확인. `npx tsc --noEmit`, `npx eslint` 정상 통과

## 2026-08-31 — 홈 업로드 박스 사진 미리보기 + '프레임 만들기' 버튼 추가

- 요청: 석한님이 프레임 생성기처럼 홈 페이지(EXIF 분석) 업로드 박스에도 실제 사진이 보였으면 좋겠다는 요청, 그리고 사용자가 프레임 생성기를 더 적극적으로 이용하도록 유도하는 버튼을 업로드 박스 위 오른쪽에 추가해 달라는 요청
- 조치:
  - `src/hooks/use-photo-preview-url.ts` 신규: 업로드된 사진을 화면에 바로 그릴 수 있는 URL을 계산하는 훅. 일반 이미지(JPG/PNG/WebP 등)는 원본 objectURL을 그대로 사용하고, RAW 파일은 LibRaw로 추출한 내장 JPEG 미리보기(프레임 생성기와 동일한 방식)를 사용. HEIC/HEIF나 미리보기가 없는 RAW는 `null`을 반환해 기존처럼 파일명만 표시하는 방식으로 자연스럽게 폴백
  - `src/components/exif-uploader.tsx`: 업로드 박스 안에 파일명 대신 실제 사진을 표시(하단에 파일명 + 재업로드 버튼을 반투명 오버레이로 배치). 사진이 업로드된 이후에는 박스 바로 위 오른쪽에 "프레임 만들기" 버튼이 나타나며, 클릭하면 방금 업로드한 사진을 그대로 들고 프레임 생성기 페이지로 이동
  - 4개 언어(en/ja/ko/es) 번역 추가
- 검증: 실제 프로덕션 빌드(`next build && next start`) 위에서 Playwright E2E 테스트로 (1) 일반 JPG 업로드 시 실제 사진 미리보기 정상 표시, (2) 미리보기가 없는 RAW 업로드 시 크래시 없이 파일명 폴백 표시, (3) 두 경우 모두 "프레임 만들기" 버튼 정상 노출을 확인. `npx tsc --noEmit`, `npx eslint` 정상 통과

## 2026-08-31 — RAW 파일 렌즈 정보 누락 수정

- 문제: 바로 위 LibRaw 기반 RAW 지원 추가 배포 이후, 석한님이 RAW 파일에서 카메라/셔터스피드/조리개/ISO/초점거리는 정상 추출되지만 렌즈 항목만 계속 비어 있다고 제보. 같은 컷을 RAW+JPG 동시 저장했을 때 JPG에서는 렌즈가 정상 표시되어, LibRaw 자체의 한계가 아니라 코드 쪽 문제로 판단
- 원인: `libraw-wasm`의 `metadata()` 호출 시 `fullOutput` 인자를 `true`로 주지 않으면 응답에서 `imgdata.lens` 블록 자체가 빠지는 라이브러리 동작. `src/lib/raw-exif.ts`에서 `raw.metadata(false)`로 호출하고 있었던 것이 원인
- 조치: `raw.metadata(true)`로 변경
- 검증: `npx tsc --noEmit`, `npx eslint` 정상 통과. 합성 테스트 파일에는애초에 렌즈 데이터가 없어 이 환경에서 직접 재현 검증은 못했고, 라이브러리 타입 정의 주석("present with full metadata")과 문제 증상이 정확히 일치하는 것으로 원인 확정. **사용자 확인 필요**

## 2026-08-31 — RAW 파일 실제 지원 추가 (LibRaw 기반, 근본 원인 수정)

- 문제: 앞선 프레임 생성기 수정(RAW/HEIC 사전 감지, 이 파일의 바로 위 항목) 이후에도 석한님이 데스크탑에서 RAW 파일 업로드 시 "이 사진에서 EXIF 정보를 읽을 수 없습니다" 오류가 계속 발생한다고 제보. 갤럭시24 Expert RAW(DNG)로 촬영한 모바일 사진도 동일하게 실패. 사이트 문구("대부분의 카메라 RAW 파일을 지원합니다")와 실제 동작이 맞지 않는 심각한 문제로 확인됨
- 근본 원인 재확인: 이번 문제는 모바일 프레임 생성기 수정과 무관하게 **처음부터 있던 문제**였음. 사이트가 EXIF 파싱에 사용하는 `exifreader` 라이브러리는 공식 README 지원표에 JPEG/JPEG XL/TIFF/PNG/HEIC/AVIF/WebP/GIF만 명시하고 있고, 카메라 RAW 포맷(ARW/CR2/CR3/NEF/DNG 등)은 애초에 지원 대상이 아니었음. 특히 캐논 CR3는 TIFF가 아닌 ISO-BMFF 컨테이너를 사용하는데, `exifreader`가 인식하는 ISO-BMFF 브랜드는 HEIC/AVIF뿐이라 CR3는 파일 형식 자체를 인식조차 못해 100% 실패. DNG는 TIFF 기반이라 종종 되지만 기종/설정에 따라 실패 가능
- 조치: `libraw-wasm`(LibRaw를 WebAssembly로 빌드한 라이브러리, ISC 라이선스, Canon/Nikon/Sony/Fuji/Panasonic/Olympus/Pentax/Samsung/Hasselblad 등 업계 표준 수준의 광범위한 실제 카메라 지원)을 도입해 RAW 파일 처리를 전면 교체
  - `src/lib/raw-exif.ts` 신규: RAW 파일의 카메라/렌즈/셔터/조리개/ISO/초점거리/촬영일을 LibRaw로 파싱
  - `src/lib/exif.ts`: RAW 확장자 파일은 더 이상 `exifreader`를 시도하지 않고 바로 LibRaw로 라우팅
  - `src/components/exif-frame-generator.tsx`: RAW 파일 대부분이 내장하고 있는 JPEG 미리보기(카메라 LCD가 보여주는 것과 동일한 이미지)를 추출해 프레임 생성기 사진 소스로 사용. 미리보기가 없는 극소수 RAW 파일은 명확한 안내 메시지로 처리(새 메시지 키 `loadErrorRawNoPreview`, 4개 언어 번역)
  - `src/store/exif-store.ts`: 프레임 생성기가 RAW 원본 바이트에 접근할 수 있도록 store에 `fileType` 대신 `file`(원본 File 객체) 보관
  - `public/vendor/libraw-wasm/`: `libraw-wasm` 빌드 결과물을 정적 자산으로 vendor 처리. 일반 npm 의존성으로 import하면 Next.js Turbopack의 `next build`가 해당 패키지의 Worker+wasm 조합을 번들링하려다 무한 대기하는 문제를 실제로 재현 확인(5분 이상 진행 없음) → 정적 파일로 서빙 후 런타임에 절대경로로 동적 import하는 방식으로 우회. `libraw-wasm`은 타입 전용 devDependency로만 유지(런타임 번들 미포함)
- 검증: 합성 DNG 테스트 파일로 실제 프로덕션 빌드(`next build && next start`) 위에서 Playwright 헤드리스 브라우저 E2E 테스트 수행 — 홈 페이지 EXIF 업로드 시 카메라 정보 정상 추출 확인, 프레임 생성기에서 미리보기 없는 RAW에 대해 크래시 없이 안내 메시지 정상 표시 확인. `npx tsc --noEmit`, `npx eslint` 정상 통과. 다만 실제 카메라로 촬영한 CR3/DNG 등 진짜 RAW 파일로는 재현 환경 제약상 직접 테스트하지 못했으므로 **사용자 확인 필요**
- 참고: `push`는 이번에도 device_bash 인증 제약으로 커밋까지만 진행. 사용자가 Terminal에서 직접 push 필요

## 2026-08-31 — 모바일 프레임 생성기 "사진 디코딩 실패" 오류 근본 원인 수정 (RAW/HEIC 사전 감지)

- 문제: 모바일에서 EXIF 프레임 생성기에 사진을 첨부하면 미리보기/다운로드에 사진이 나타나지 않음. 앞선 두 차례 수정(해상도 다운스케일, createImageBitmap 기반 디코딩 + 오류 메시지 표시)을 적용한 뒤에도 재현되었고, 새로 추가한 진단 메시지에 "이미지를 디코딩하지 못했습니다"라는 원인이 표시됨
- 근본 원인 확인: 해상도/메모리 문제가 아니라, 업로드된 파일이 RAW(.arw/.cr2/.cr3/.nef/.raf/.rw2/.orf/.dng/.pef/.srw) 또는 HEIC/HEIF 형식이기 때문이었음. `src/lib/exif.ts`의 `isSupportedImageFile()`은 EXIF 메타데이터 추출(exifreader)을 위해 이 형식들을 계속 허용하고 있어 업로드/파싱 단계는 성공하지만, 어떤 브라우저도 이 형식들을 `<img>`/canvas 소스로 디코딩할 수 없어 프레임 생성기의 이미지 렌더링 단계에서 항상 실패함
- 조치:
  - `src/lib/exif.ts`에 `isCanvasUnsupportedFormat(fileName, mimeType)` 추가 — RAW 확장자 및 HEIC/HEIF MIME 타입을 감지
  - `src/store/exif-store.ts`에 `fileType` 필드 추가 (업로드된 파일의 MIME 타입을 프레임 생성기까지 전달)
  - `src/components/exif-frame-generator.tsx`: 이미지 로드를 시도하기 전에 위 체크를 먼저 수행해, 지원되지 않는 형식이면 디코딩 시도 자체를 건너뛰고 "이 파일 형식(RAW 또는 HEIC/HEIF)은 미리보기가 지원되지 않습니다. JPG 또는 PNG로 변환한 뒤 다시 시도해 주세요" 메시지를 즉시 표시 (기존 일반 디코딩 실패 메시지 `loadError`는 그대로 유지, 새 메시지는 `loadErrorUnsupportedFormat` 키로 4개 언어(en/ja/ko/es) 번역 추가)
  - React Hooks lint 규칙(`react-hooks/set-state-in-effect`) 위반 정리: 불필요한 동기 상태 초기화 제거(컴포넌트가 `key={imageUrl}`로 이미 리마운트되므로 중복), 의도적으로 필요한 두 곳은 근거 주석과 함께 예외 처리
- 검증: `npx tsc --noEmit`, `npx eslint`, `npm run build` 모두 정상 통과 확인 (로컬 재현 환경 기준). 실제 기기(iPhone 등)에서 RAW/HEIC 사진으로 재현 테스트는 사용자 확인 필요
- 참고: 일반 JPG/PNG 사진에서 여전히 디코딩 실패가 발생한다면 이는 별개의 원인이므로 재현 시 알려주시기 바랍니다.

## 2026-08-31 — 가이드 아티클 자동 발행: "야경 도시 사진 카메라 설정"

- New guide article published in all 4 languages (en/ja/ko/es): "Night Cityscape Photography Settings" (야경 도시 야간 사진 설정) — covers aperture choice for starburst effects vs. depth of field, tripod vs. handheld shutter speed ranges (including car light trails), ISO priorities around dynamic range loss rather than just noise, white balance strategy for mixed sodium/fluorescent/LED lighting, exposure bracketing for window highlights vs. shadow detail, and the infinity-focus trap with live-view fine focusing. Filed under the "Photography Genres" category (재사용: 기존 "장르별 촬영 가이드" / "Photography Genres" / "ジャンル別撮影ガイド" / "Guías por género fotográfico" 카테고리를 4개 언어 모두 그대로 재사용).
- `automation/guide-topics-queue.json`의 order 5 항목(night-cityscape-photography-settings)을 published: true, publishedDate: "2026-08-31"로 갱신
- `npm run build` 정상 완료 확인
- 애드센스 검수와는 무관한 콘텐츠 추가 작업

## 2026-08-30 — 파비콘을 create-next-app 기본(Vercel) 로고에서 사이트 아이덴티티로 교체

- 문제: 크롬 탭에 표시되는 파비콘이 create-next-app이 기본 제공하는 Vercel 삼각형 로고 그대로 남아있어 사이트가 전문적으로 보이지 않음
- 확인: `src/app/favicon.ico`를 직접 렌더링해본 결과 실제로 기본 Vercel 로고(원 안에 삼각형)였음. 사이트에는 별도의 로고 이미지 파일이 없고, 헤더에 조리개(Aperture) 아이콘 + "ExifLens" 글자만 사용 중이었음
- 조치: 헤더에서 쓰이는 조리개(Aperture) 아이콘을 사이트의 브랜드 색상(다크 테마 primary 색상 #e38d3d, 배경 #0a0a0a)으로 새로 그려 파비콘 세트를 제작
  - `src/app/favicon.ico` 교체 (16/32/48/256px 포함 멀티 사이즈, 구형 브라우저 호환용)
  - `src/app/icon.png` 추가 (512px, 최신 브라우저·고해상도 디스플레이용)
  - `src/app/apple-icon.png` 추가 (180px, iOS 홈 화면 아이콘용)
  - Next.js App Router 규칙에 따라 파일만 추가/교체하면 자동으로 `<link rel="icon">` 등 메타 태그에 반영되므로 별도 코드 수정 없음
- 검증: `npm run build` 성공, 빌드된 HTML에서 새 아이콘 경로(콘텐츠 해시 포함)로 `<link rel="icon">`, `<link rel="apple-touch-icon">` 태그가 정상 생성됨을 확인. `git diff --stat`으로 의도한 3개 아이콘 파일만 변경/추가되었음을 확인


## 2026-08-30 — 구글 애널리틱스(GA4) 태그 설치

- FlyDroneMap 프로젝트에서 먼저 검증된 방식(애드센스 검수/속도 영향 없음 확인됨)을 ExifLens에도 동일하게 적용
- `src/app/[locale]/layout.tsx`에 GA4 측정 ID(G-1P4CBYCR1V)로 gtag.js 스크립트 2개를 추가, 기존 애드센스 스크립트와 동일하게 `next/script`의 `strategy="afterInteractive"`로 비동기 로드하여 LCP 등 페이지 속도에 영향 없도록 처리
- `tsc --noEmit` 타입 체크 통과, `npm run build` 정상 완료, 빌드 결과물에서 gtag 스크립트와 config 호출이 정상 삽입된 것을 확인
- `git diff --stat`으로 의도한 파일(layout.tsx) 한 곳만 변경되었음을 확인


## 2026-08-30 — 가이드 본문에 ** 기호가 그대로 노출되던 문제 수정 및 재발방지

- 문제: 일부 가이드 글에서 굵게 표시하려던 부분이 굵게 처리되지 않고 `**광각(14mm~35mm)**`처럼 별표(**)가 그대로 화면에 보임
- 원인: 마크다운 문법상, 닫는 `**` 바로 앞에 괄호 `)`가 오고 바로 뒤에 공백 없이 글자가 이어지면(예: `**단어(설명)**은/는`), 마크다운 렌더러가 이를 굵게 표시 문법으로 인식하지 못하고 별표를 그냥 텍스트로 남기는 특성이 있음을 확인
- 조치 1: 전체 80개 가이드 파일(4개 언어 × 20개 주제)을 실제 렌더링 결과 기준으로 전수 점검하여, 이 문제가 실제로 발생하는 3곳(한국어 "광각 vs 망원" 가이드, 일본어 "광각 vs 망원" 가이드, 일본어 "ND 필터 종류" 가이드)을 찾아 별표 기호를 제거
- 조치 2 (재발방지): 예약 발행 작업(매일 06:00 KST) 지시문에 이 문법 함정을 설명하고, 새 글 작성 시 괄호가 포함된 구절을 굵게 표시할 때 이 패턴을 피하도록(굵게 표시를 괄호 앞에서 닫거나, 닫는 ** 뒤에 공백을 두거나, 위험하면 굵게 표시를 아예 쓰지 않도록) 안내하는 규칙을 추가
- `npm run build` 및 렌더링 결과 재검증 완료, 나머지 77개 파일은 문제 없음을 확인


## 2026-08-30 — 가이드 상세 페이지에 "관련 가이드" 섹션 추가

- FlyDroneMap 프로젝트에 이미 있는 "관련 가이드" 내비게이션 기능을 ExifLens에도 동일하게 적용
- `src/lib/guides.ts`에 `getRelatedGuides()` 추가: 같은 카테고리의 다른 가이드를 우선하고, 부족하면 최신 가이드로 채워 최대 3개 추천
- 가이드 상세 페이지(`src/app/[locale]/guides/[slug]/page.tsx`) 본문 하단에 구분선 + "관련 가이드" 목록 섹션 추가
- 4개 언어(en/ko/ja/es) messages 파일에 `Guides.relatedGuides` 번역 키 추가
- `npm run build` 정상 완료 확인, 실제 빌드 결과물에서 관련 가이드 링크가 정상 렌더링되는 것을 확인
- 애드센스 검수와는 무관한 순수 UI/네비게이션 추가


## 2026-08-30

### Added
- New guide article published in all 4 languages (en/ja/ko/es): "Street Photography Exposure Settings" (스트리트 포토그래피 노출 설정) — covers zone focusing for fast candid shots, minimum shutter speed thresholds for freezing walking pedestrians, auto-ISO with a locked shutter floor, highlight-priority metering for high-contrast sun/shadow scenes, and discreet-shooting settings (electronic shutter, viewfinder use). Filed under the "Photography Genres" category (reused existing category across all locales).

## 2026-08-29 — 예약 발행 글의 발행일 오기재(하루 밀림) 수정 및 재발방지

- 문제: 오늘(2026-08-29 KST 06:03) 자동 발행된 "야생동물 사진 촬영 설정" 가이드의 publishedAt/publishedDate가 하루 전날(2026-08-28)로 잘못 기록됨을 확인
- 원인: 예약 작업이 UTC 21:00(=KST 06:00)에 실행되는데, 지시문이 "오늘 날짜"를 서버 기본 시간대(UTC) 기준 date +%Y-%m-%d로 구하도록 되어 있어, UTC 기준으로는 아직 전날이라 하루 밀린 날짜가 기록됨
- 조치 1: 4개 언어(en/ko/ja/es) mdx 프론트매터의 publishedAt과 automation/guide-topics-queue.json의 publishedDate를 2026-08-29로 소급 수정
- 조치 2: 예약 작업(트리거) 지시문에 "오늘 날짜는 반드시 TZ=Asia/Seoul date +%Y-%m-%d(KST 기준)로 계산" 규칙을 추가하여 재발 방지 (FlyDroneMap 예약 작업에 이미 적용되어 있던 동일한 수정을 ExifLens에도 반영)
- 애드센스 검수와는 무관한 콘텐츠 날짜 메타데이터 수정으로, 검수에 영향 없음


## 2026-08-29

### Added
- New guide article published in all 4 languages (en/ja/ko/es): "Wildlife Photography Camera Settings" (야생동물 사진 촬영 설정) — covers shutter speed selection for animal movement, continuous AF (AF-C) vs single-shot, aperture trade-offs for background separation, ISO strategy in low dawn/dusk light, and telephoto lens/teleconverter choices. Filed under the "Photography Genres" category (reused existing category across all locales).

## 2026-08-29 — 홈페이지 초기 로딩 속도 개선 (exifreader 지연 로딩)

- 계기: 구글 PageSpeed Insights 측정 결과 모바일 성능 69점(FCP 3.5초, LCP 6.2초), "사용하지 않는 자바스크립트 232KiB" 등 지적
- 원인 분석: EXIF 파싱 라이브러리(`exifreader`, 131KB)가 홈페이지 방문 즉시 렌더링되는 `ExifUploader` 컴포넌트 경로에 정적으로 import되어 있어, 사용자가 실제로 사진을 올리기 전에도 모든 방문자가 무조건 다운로드·실행하고 있었음
- 조치: `src/lib/exif.ts`의 `parseExifFile()` 내부에서 `exifreader`를 정적 import → 동적 import(`await import("exifreader")`)로 변경. 사진을 드롭/선택하는 시점에만 별도 청크로 로드되도록 코드 스플리팅 적용
- 검증: `npm run build` 정상 완료, 빌드 산출물에서 exifreader가 별도의 독립 청크(약 130KB)로 분리되어 초기 페이지 번들에 포함되지 않음을 확인
- 애드센스 검수와는 무관한 순수 코드 구조 개선이며, 광고 스크립트(adsbygoogle.js)는 검수 진행 중이라 이번 작업에서 손대지 않음


## 2026-08-28 — 가이드 목록 카테고리별 그룹핑 추가

- 문제: 가이드 게시글이 누적될수록 /guides 페이지 세로 스크롤이 계속 길어지고, 발행일 순 단일 목록이라 원하는 주제를 찾기 어려워지는 문제 확인
- `GuideFrontmatter`에 `category` 필드 추가 (tags처럼 언어별로 자연스럽게 작성하는 자유 텍스트)
- 기존 발행된 18개 가이드(4개 언어, 총 72개 파일)에 카테고리를 소급 배정: 카메라 기초 & 노출 / ND 필터 & 장노출 / 장르별 촬영 가이드 / EXIF 활용 & 공유
- `/guides` 페이지를 카테고리별 섹션(제목 + 2열 카드 그리드)으로 재구성, 폭도 넓힘(max-w-3xl → max-w-5xl) — FlyDroneMap 가이드 페이지 레이아웃 참고
- 카테고리가 없는 옛 글이나 향후 새 카테고리에 속하지 않는 글은 자동으로 "기타 가이드"(언어별 번역) 섹션으로 그룹핑되도록 안전장치 추가
- 예약 발행 작업(매일 06:00 KST)이 앞으로 새 글을 쓸 때, 기존 카테고리에 속하면 재사용하고 그렇지 않으면 새 카테고리를 직접 만들어 배정하도록 지시문 갱신 — 사이트는 새 카테고리가 생기면 자동으로 새 섹션을 노출
- `npm run build` 정상 완료 확인


## 2026-08-28 — 쿠팡 파트너스 1열 브랜드 다양화 + 2열 카테고리 혼합 노출

- 1열(ND필터) 검색어를 필터 종류별(nd4~custom) 키워드에서 브랜드 기반 키워드 6종("에이치앤와이 nd", "겐코 nd", "니시 nd", "벤로 nd", "슈나이더크로이츠나흐 nd", "가변nd")으로 교체 — 특정 브랜드 쏠림 문제 개선
- 6개 키워드 중 매 방문마다 5개만 무작위로 선택해 노출, 각 키워드 내에서도 상위 5개 중 무작위 1개를 노출하여 같은 브랜드 구성이어도 구체적 상품은 방문마다 달라지도록 개선
- 2열(액세서리)은 기존 "3개 카테고리 중 1개만 무작위 노출" 방식에서 "3개 카테고리(가방/삼각대/메모리카드)를 항상 함께 조회해 5개 안에서 무작위로 섞어 노출"하는 방식으로 변경 — 특정 카테고리만 계속 노출되던 문제 개선
- 두 섹션 모두 최종 노출 위치를 무작위로 섞어 특정 브랜드/카테고리가 항상 같은 자리에 나오지 않도록 처리
- 쿠팡 API 호출은 시간당 최대 6(1열)+3(2열)=9회로 한도(10회) 이내 유지
- `npm run build` 정상 완료 확인


## 2026-08-28 — 쿠팡 파트너스 상품 랜덤 노출 + 카메라 액세서리 섹션 추가

- 문제: ND 필터 종류별 검색 키워드가 고정 6개였고, 검색 결과 상위 4개만 가져와 응답에 1시간 캐시(`Cache-Control: max-age=3600`)를 걸어두어 접속 시점/방문자와 무관하게 항상 동일한 상품만 노출되던 문제 확인
- 개선: 키워드별로 상위 10개(쿠팡 API 최대치)를 가져와 서버에서 캐시(`src/lib/coupang.ts`의 fetch revalidate)해두고, 방문할 때마다 그중 5개를 무작위로 뽑아 노출하도록 변경. 응답 자체의 HTTP 캐시(`Cache-Control`)는 제거하여 매 요청마다 재추첨되도록 함 — 쿠팡 API 실제 호출 횟수는 늘어나지 않음(키워드별 캐시는 그대로 유지)
- 추가: 기존 ND 필터 상품 목록 뒤에 카메라 액세서리(카메라 가방 / 삼각대 / 메모리카드 중 매 요청마다 하나를 무작위 선택) 상품 5개를 이어붙여, 소제목 구분 없이 하나의 상품 목록처럼 자연스럽게 노출
- 시간당 쿠팡 API 호출 한도(10회) 고려: ND 필터 6종 + 액세서리 3종 = 최악의 경우 시간당 9회로, 한도 내 여유 확보
- `nd32000` 필터의 검색 키워드를 "ND32000 카메라 필터"에서 "가변 ND 카메라 필터"로 교체 (32000 필터는 통상 가변 ND 제품으로 판매되어 검색 결과 관련성 개선 목적)
- `npm run build` 정상 완료 확인


## 2026-08-28 — 미래 날짜로 발행된 가이드 글 발행일 정정

- 구글 서치 센트럴 공식 가이드("미래 날짜를 지정하지 마세요")에 따라, 8/25~8/29 사이 미래 날짜가 섞여 있던 기존 가이드 18개(4개 언어, 총 72개 파일)의 `publishedAt`을 오늘(8/28) 기준으로 3개씩 8/23~8/28로 재배정
- `automation/guide-topics-queue.json`의 1번(portrait-photography-camera-settings), 2번(macro-photography-basics) 항목 `publishedDate`도 동일하게 갱신
- `npm run build` 정상 통과 확인



## 2026-08-27
- 가이드 아티클 자동 발행: "매크로 사진 촬영 기초" (Macro Photography Basics) — en/ja/ko/es 4개 언어 전체 작성 및 추가 (slug: macro-photography-basics)

## 2026-08-26 — 네이버 서치어드바이저 URL 검사 경고 대응: 페이지 제목/Open Graph 제목 단축

- 네이버 서치어드바이저 "URL 검사"에서 페이지 제목과 Open Graph 제목이 40자 권장 기준을 초과(기존 59자)한다는 경고 확인
- `src/app/[locale]/layout.tsx`의 공통 타이틀을 `"ExifLens — EXIF Viewer & ND Filter Long Exposure Calculator"`(59자)에서 `"ExifLens — EXIF Viewer & ND Calculator"`(38자)로 단축 — 검색 결과 노출 시 잘리지 않도록 개선
- "robots.txt가 존재하지 않습니다" 경고는 실제로는 `https://exifnd.com/robots.txt`가 정상 응답하는 것을 확인, 네이버 측 크롤링 타이밍 문제로 판단되어 코드 수정 없이 재검증만 필요
- `npm run build` 및 컴파일된 HTML의 `<title>` 태그 확인으로 검증 완료

## 2026-08-26 — 맥 로컬 저장소 git 커밋 잠김(lock) 문제 발견 및 해결, 1회성 실행 스크립트 종료 팝업 제거

- 네이버 인증 태그 반영 과정에서 맥(Mac) 로컬 저장소(`~/Desktop/exiflens`)의 `.git/HEAD.lock` 파일이 8/25 22:18경부터 남아있어, 그 이후로 실행된 모든 `git commit`이 "cannot lock ref 'HEAD'" 오류로 조용히 실패하고 있었던 것을 발견 (전날 자동 발행 스크립트가 강제 종료되며 남긴 것으로 추정)
- 이로 인해 8/25 22:18 이후 자동 발행된 가이드 아티클("인물 사진 카메라 설정" 등)이 커밋되지 못한 채 로컬에 쌓여있었음 — lock 파일 제거 후 밀려있던 변경사항을 정상 커밋 완료
- 1회성 실행 스크립트(`.command`)에서 완료 후 터미널 창을 닫을 때 macOS가 "아직 실행 중인 프로세스가 있습니다" 확인 팝업을 띄우던 문제 발견 → 스크립트 자신이 살아있는 상태에서 직접 창을 닫으려 했기 때문. 앞으로 생성하는 모든 `.command` 스크립트는 스크립트 본체가 완전히 종료된 뒤, 별도로 분리(`nohup ... & disown`)된 프로세스가 1초 뒤 창을 닫도록 수정하여 종료 팝업이 뜨지 않도록 개선

## 2026-08-26 — 네이버 서치어드바이저 사이트 소유확인 메타 태그 추가

- 네이버 웹마스터도구(서치어드바이저)에 `https://exifnd.com` 등록을 위해 HTML 태그 방식 소유확인 진행. 루트 레이아웃(`src/app/layout.tsx`)의 정적 `metadata` 객체에 `verification.other["naver-site-verification"]` 필드를 추가해 `<meta name="naver-site-verification" content="...">` 태그가 모든 페이지에 렌더링되도록 처리 (로케일별 `generateMetadata()`가 아닌 루트 레이아웃에 추가한 이유는, 루트 레이아웃 메타데이터가 모든 라우트에 공통 병합되기 때문)
- `npm run build`로 빌드 후 컴파일된 HTML에 태그가 정상 렌더링되는 것을 확인
- 실제 GitHub 커밋/푸시는 클라우드 세션이 아닌, 사용자 맥(Mac) 로컬 저장소에서 1회성 스크립트(`네이버인증 푸시하기.command`)를 통해 수행

## 2026-08-26 — 가이드 아티클 자동 발행 1일차: "인물 사진 카메라 설정"

- 확장 주제 큐(`automation/guide-topics-queue.json`) 1번 항목 "Portrait Photography Camera Settings" 4개 언어(en/ja/ko/es) 작성 완료, `published: true`로 갱신
- 조리개별 배경 분리, 아이(눈) AF 활용, 셔터스피드·ISO 조합, 인물용 렌즈 화각 선택 등 실전 설정 위주로 구성
- `npm run build` 정상 통과 확인
- GitHub push는 이 클라우드 환경에서 직접 불가하여(네트워크 정책상 git proxy 차단), 결과물을 사용자 맥(Mac) 작업 폴더로 전달하고 더블클릭 실행형 커밋·푸시 스크립트를 함께 생성하는 방식으로 반영

## 2026-08-26 — 가이드 아티클 매일 자동 발행 파이프라인 구축

- 애드센스 심사 대기 기간 동안 사이트 활성도를 유지하기 위해, 매일 한국시간 오전 6시에 가이드 아티클 1개(4개 언어: en/ja/ko/es)를 자동 작성하는 파이프라인을 구축
- 확장 주제 30개를 `automation/guide-topics-queue.json`에 순서(order)와 발행 여부(published)를 포함해 등록. 매일 실행 시 미발행 항목 중 순서가 가장 빠른 1개를 처리하고 완료 후 `published: true`, `publishedDate`를 기록해 다음 실행 시 자동으로 이어서 처리되도록 함
- 클라우드 환경에서 GitHub로 직접 push가 차단됨을 확인(`access denied by the git proxy`) → 콘텐츠 생성은 클라우드에서 매일 자동으로 진행하되, 실제 반영은 맥(Mac) 작업 폴더에 결과물과 더블클릭 실행형 커밋·푸시 스크립트(`.command`)를 가져다 놓고 사용자가 클릭 한 번으로 완료하는 방식으로 확정
- 애드센스 승인 완료 후에는 가이드 페이지 주제를 카테고리별로 세분화(현재는 카테고리 구분 없이 단일 목록이라 세로 스크롤이 긺)하는 작업을 별도로 진행 예정

## 2026-08-26 — GitHub/Vercel 배포 및 애드센스 사이트 소유권 확인 실패 수정

- 도메인 `exifnd.com` 구매(Namecheap) 완료. GitHub 저장소(`SH8952/exiflens`) 생성 및 전체 커밋 이력 푸시, Vercel 프로젝트(`Moneypick` 팀) 생성 및 GitHub 연동 배포, 커스텀 도메인 `exifnd.com` 연결(A 레코드 `216.198.79.1`), Google Search Console 도메인 속성 소유권 확인(TXT 레코드) 및 `sitemap.xml` 제출까지 완료
- 애드센스 사이트 추가 시 "사이트를 확인할 수 없습니다" 오류 발생. 원인 분석 결과, `src/app/[locale]/layout.tsx`가 `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`(`pub-0042120343274941`, `ca-` 접두사 없음) 값을 그대로 애드센스 스크립트 태그의 `client=` 쿼리에 사용하고 있어, 실제 배포된 페이지의 스크립트가 `client=pub-0042120343274941`로 렌더링됨 — 애드센스가 요구하는 정확한 형식(`client=ca-pub-0042120343274941`)과 불일치해 크롤러가 소유권을 확인하지 못함
- 수정: `layout.tsx`에 `ca-` 접두사가 없으면 자동으로 붙여주는 정규화 로직(`ADSENSE_CLIENT_ID`)을 추가해 스크립트 태그에만 `ca-pub-...` 형식이 적용되도록 함. `ads.txt`(접두사 없는 `pub-...` 형식이 정상)와 환경변수 원본 값은 변경하지 않아 다른 용도와의 호환성 유지
- 검증: `npm run build` 정상 통과, 프로덕션 서버 기동 후 `curl`로 실제 렌더링된 HTML의 `client=ca-pub-0042120343274941` 값 확인. 배포 후 실제 라이브 사이트(`https://exifnd.com`)에서도 브라우저로 재확인 완료
- 결과: 코드 수정 후에도 애드센스 "애드센스 코드 스니펫" 방식 재확인은 즉시 통과하지 못함(크롤러 캐시 지연 추정). **"Ads.txt 스니펫" 확인 방식으로 전환하니 즉시 소유권 확인 성공** — 사이트 소유권 확인 완료
- **애드센스 "검토 요청" 제출 완료.** 이제 구글의 사이트 심사 대기 상태 (통상 며칠~몇 주 소요). 심사 대기 기간 동안 사이트 구조 변경 없이 가이드 글을 주 1~2개씩 꾸준히 발행하는 것을 권장

## 2026-08-29 — Mac 로컬 개발 환경 빌드 에러 해결 (`Can't resolve '@tailwindcss/typography'`)

- 증상: Mac 로컬 프리뷰(`localhost:3000`)에서 `CssSyntaxError: tailwindcss ... Can't resolve '@tailwindcss/typography'` 빌드 에러 발생. Phase 3에서 추가된 `@tailwindcss/typography` 등 신규 npm 의존성이 Mac 쪽 `node_modules`에 설치되지 않은 상태였음 (원인: Phase 3 진행 당시 Mac 측 세션 샌드박스 디스크 공간 부족으로 `npm install`이 실패했고, 이후 배치들은 콘텐츠 파일만 동기화해 재설치가 이뤄지지 않음)
- 1차 진단 오류 정정: 처음에는 Mac 홈 디렉터리(`/sessions` 파티션, 9.8GB)의 디스크 공간 부족이 원인이라 판단해 사용자 동의 하에 다른 프로젝트(네이버 블로그 자동화, moneypick_source_v3, youtube_news_automation, 숏폼 자동화)의 `node_modules`/`venv` 폴더를 임시 폴더로 이동 시도. 그러나 이 세션에는 실제 파일 삭제 권한을 요청하는 도구가 없어 `rm`이 "Operation not permitted"로 거부됨을 확인, 이동했던 4개 폴더는 즉시 원위치로 복원(사용 중인 프로젝트에 영향 없음)
- 재진단: `df -h`로 다시 확인한 결과, 사용자가 연결한 바탕화면 폴더(`~/Desktop`)는 실제 Mac 디스크(총 927GB, 여유 224GB) 위에 있어 공간이 충분했고, 문제는 이 세션이 명령 실행에 사용하는 별도의 작은 샌드박스 파티션(9.8GB, 100% 사용) 자체였음 — 사용자 파일과 무관한 시스템 내부 영역이라 이 세션의 도구로는 접근·정리가 불가능함을 확인
- 해결: 사용자가 Mac 터미널에서 직접 `cd ~/Desktop/exiflens && npm install` 실행 → `@tailwindcss/typography` 정상 설치 확인. 이후 Next.js 개발 서버가 "(stale)" 캐시 상태를 표시해 여전히 에러가 남아있었으나, `.next` 캐시 폴더 삭제 후 `npm run dev` 재시작 및 브라우저 강력 새로고침으로 완전히 해결. 사용자가 정상 렌더링을 최종 확인함
- 참고: 클라우드 저장소(실제 배포 기준)는 이 문제와 무관하게 매 배치마다 `npm run build`로 정상 검증되어 왔으며, 이번 이슈는 Mac 로컬 프리뷰 환경에만 국한된 문제였음
- 다음 단계: 애드센스 승인 이후 지속 발행을 위한 확장 주제 목록 정리

## 2026-08-29 — 구글 애드센스 심사 대비: 가이드 아티클 3개 추가, 목표(15~20개) 달성 (Phase 4 · 5차 배치)

- 15~20개 아티클 목표를 향한 다섯 번째 배치. 3개 주제 × 4개 언어 = 12개 파일 신규 작성 (누적 16개 아티클, 총 64개 파일) — **목표 범위(15~20개) 달성**
  - "Light Trail Photography: Camera Settings and Technique" — 차량 헤드라이트·테일라이트로 광궤적을 만드는 셔터스피드·조리개·ISO 설정, 구도, 블루아워 타이밍까지 다룸. 앞선 배치의 장노출·흔들림 방지 아티클과 자연스럽게 연결
  - "Wide-Angle vs. Telephoto: How Focal Length Changes Your Photos" — 초점거리가 화각뿐 아니라 원근감·배경 압축에 미치는 영향, 심도 아티클과 연계한 상황별 초점거리 선택 기준을 다룸
  - "GPS Data in Photos: What It Reveals and How to Protect Your Privacy" — EXIF에 내장되는 GPS 좌표가 실제로 무엇을 노출하는지, 확인·제거 방법, 언제 남겨둬도 괜찮은지까지 다룸. 사이트의 개인정보처리방침(Privacy) 페이지와 주제적으로 연결되는 콘텐츠
- 슬러그: `light-trail-photography-camera-settings`, `wide-angle-vs-telephoto-focal-length`, `gps-data-in-photos-privacy` (4개 언어 모두 동일 슬러그, hreflang 자동 매칭)
- 검증: `npm run build`에서 98개 페이지 전체 SSG 유지 확인(기존 86 + 신규 아티클 12페이지). 새 포트(4289)로 프로덕션 서버를 띄워 신규 12개 URL 전체 200 응답 확인, `/ko/guides` 목록에 아티클 16개 전체가 최신순으로 정상 표시되는 것과 `/en/guides/gps-data-in-photos-privacy` 본문 렌더링을 Playwright 스크린샷으로 확인, `sitemap.xml`이 80개 → 92개 URL로 정확히 증가함을 확인, `git status`로 의도한 12개 신규 파일 외에 다른 변경/임시 파일이 없음을 확인
- 참고: 사용자가 Mac 로컬 프리뷰(`localhost:3000`)에서 `Can't resolve '@tailwindcss/typography'` 빌드 에러를 확인함 — Phase 3 때 보고된 Mac 샌드박스 디스크 공간 부족으로 `npm install`이 실패했던 문제가 원인. 이후 배치들은 콘텐츠 파일만 동기화했기 때문에 Mac 쪽에 해당 패키지가 여전히 미설치 상태. 클라우드 저장소는 매 배치 `npm run build`로 정상 확인되어 실제 배포 코드에는 영향 없음. 디스크 공간 확보 및 Mac 쪽 `npm install` 재실행은 다음 단계에서 별도로 다룰 예정
- 다음 단계: 목표 아티클 수 달성. 애드센스 신청 전 사용자 최종 검토 대기. Mac 로컬 개발 환경 디스크 공간 문제 해결 논의, 승인 이후 지속 발행을 위한 확장 주제 목록 정리도 이어서 진행 예정

## 2026-08-28 — 구글 애드센스 심사 대비: 가이드 아티클 3개 추가 (Phase 4 · 4차 배치)

- 15~20개 아티클 목표를 향한 네 번째 배치. 3개 주제 × 4개 언어 = 12개 파일 신규 작성 (누적 13개 아티클, 총 52개 파일)
  - "Beginner's Guide to Manual Mode: When and How to Leave Auto Behind" — 매뉴얼 모드가 오토·반자동 모드와 실제로 무엇이 다른지, 조리개→셔터스피드→ISO 순으로 설정하는 실전 순서, 오토·반자동이 더 나은 상황까지 다룸
  - "Best Camera Settings for Sunrise and Sunset Photography" — 골든아워의 높은 다이내믹 레인지 문제, 스팟 측광, 그라데이션 ND 필터, 화이트밸런스, 블루아워 타이밍까지 다룸. 이전 배치의 ND 필터·풍경 아티클들과 자연스럽게 연결
  - "Understanding Metering Modes: Matrix, Center-Weighted, and Spot" — 노출계의 "평균 = 중간 회색" 기본 원리와 다분할·중앙중점·스팟 측광의 차이, 상황별 선택 기준을 다룸
- 슬러그: `beginners-guide-to-manual-mode`, `sunrise-sunset-photography-camera-settings`, `understanding-metering-modes` (4개 언어 모두 동일 슬러그, hreflang 자동 매칭)
- 검증: `npm run build`에서 86개 페이지 전체 SSG 유지 확인(기존 74 + 신규 아티클 12페이지). 새 포트(4273)로 프로덕션 서버를 띄워 신규 12개 URL 전체 200 응답 확인, `/ja/guides` 목록에 아티클 13개 전체가 최신순으로 정상 표시되는 것과 `/ko/guides/understanding-metering-modes` 본문 렌더링을 Playwright 스크린샷으로 확인, `sitemap.xml`이 68개 → 80개 URL로 정확히 증가함을 확인, `git status`로 의도한 12개 신규 파일 외에 다른 변경/임시 파일이 없음을 확인
- 다음 단계: 남은 2~7개 아티클로 목표(15~20개) 달성 예정 (남은 후보 주제: 광궤적 촬영, 광각 vs 망원 초점거리 비교, 카메라별 EXIF 확인법, GPS 데이터 프라이버시 등 — 지금까지 다룬 13개 주제와 겹치지 않는 것 위주로 선별). 애드센스 승인 이후 지속 발행을 위한 확장 주제 목록 정리는 사용자 요청 시 별도 진행 예정

## 2026-08-27 — 구글 애드센스 심사 대비: 가이드 아티클 3개 추가 (Phase 4 · 3차 배치)

- 15~20개 아티클 목표를 향한 세 번째 배치. 3개 주제 × 4개 언어 = 12개 파일 신규 작성 (누적 10개 아티클, 총 40개 파일)
  - "RAW vs. JPEG: Which Should You Shoot?" — 두 형식이 실제로 무엇을 저장하는지, 각각을 선택해야 하는 상황, 파일 크기·워크플로우 비용, RAW+JPEG 동시 기록이라는 절충안까지 다룸
  - "How to Read a Histogram (and Why It's More Reliable Than Your LCD)" — 히스토그램이 보여주는 것, 하이라이트·섀도우 클리핑 읽는 법, "정답인 모양은 없다"는 점, 현장에서의 실전 활용법을 다룸
  - "Avoiding Camera Shake in Long Exposure Photography" — 삼각대 기본기, 미러/셔터 진동, 리모트 트리거, 바람·지면 진동, 손떨림 보정을 꺼야 하는 이유까지 장노출 흐림의 주요 원인과 대책을 다룸. 앞선 배치의 장노출·풍경 아티클들과 자연스럽게 연결
- 슬러그: `raw-vs-jpeg-which-should-you-shoot`, `how-to-read-a-histogram`, `avoiding-camera-shake-long-exposure` (4개 언어 모두 동일 슬러그, hreflang 자동 매칭)
- 검증: `npm run build`에서 74개 페이지 전체 SSG 유지 확인(기존 62 + 신규 아티클 12페이지). 새 포트(4257)로 프로덕션 서버를 띄워 신규 12개 URL 전체 200 응답 확인, `/en/guides` 목록에 아티클 10개 전체가 최신순으로 정상 표시되는 것과 `/es/guides/avoiding-camera-shake-long-exposure` 본문 렌더링을 Playwright 스크린샷으로 확인, `sitemap.xml`이 56개 → 68개 URL로 정확히 증가함을 확인, `git status`로 의도한 12개 신규 파일 외에 다른 변경/임시 파일이 없음을 확인
- 다음 단계: 남은 5~10개 아티클을 계속 배치로 작성 (남은 후보 주제: 매뉴얼 모드 입문, 일출·일몰 촬영 설정, 광궤적 촬영, 광각 vs 망원 초점거리 비교, 측광 모드 이해, 카메라별 EXIF 확인법 등 — 지금까지 다룬 10개 주제와 겹치지 않는 것 위주로 선별 예정). 사용자 질문(승인 이후 매일 1~2개 발행 시 소재가 충분한지)에 대한 검토도 별도로 이어갈 예정

## 2026-08-26 — 구글 애드센스 심사 대비: 가이드 아티클 3개 추가 (Phase 4 · 2차 배치)

- 15~20개 아티클 목표를 향한 두 번째 배치. 3개 주제 × 4개 언어 = 12개 파일 신규 작성 (누적 7개 아티클, 총 28개 파일)
  - "ND Filter Types Explained: Screw-On vs Square, Solid vs Graduated" — 1차 배치의 필터 강도 가이드를 보완하는 주제. 원형 스크류 필터 vs 사각/슬롯 홀더 시스템, 솔리드 ND vs 그라데이션 ND(소프트/하드/리버스 엣지), 어떤 조합을 먼저 구매할지에 대한 실전 조언. 1차 배치 글로 내부링크 연결
  - "Astrophotography Basics: Camera Settings for the Night Sky" — 기획서 예시 주제. 필요 장비, 조리개·셔터스피드(500 룰)·ISO 설정, 어두운 곳에서 초점 맞추는 법, 별 궤적을 의도적으로 활용하는 법, 광해가 가장 큰 제약 요인이라는 점까지 다룸
  - "Understanding Depth of Field: Aperture, Focal Length, and Distance" — 기획서 예시 주제. 심도를 결정하는 3요소(조리개·초점거리·피사체 거리)와 상호작용, 과초점 거리, 포커스 스태킹까지 다룸
- 슬러그: `nd-filter-types-explained`, `astrophotography-camera-settings-night-sky`, `understanding-depth-of-field` (4개 언어 모두 동일 슬러그, hreflang 자동 매칭)
- 검증: `npm run build`에서 62개 페이지 전체 SSG 유지 확인(기존 50 + 신규 아티클 12페이지). 새 포트(4241)로 프로덕션 서버를 띄워 신규 12개 URL 전체 200 응답 확인, `/ko/guides` 목록에 아티클 7개 전체가 최신순으로 정상 표시되는 것과 `/ja/guides/understanding-depth-of-field` 본문 렌더링을 Playwright 스크린샷으로 확인, `sitemap.xml`이 44개 → 56개 URL로 정확히 증가함을 확인, `git status`로 의도한 12개 신규 파일 외에 다른 변경/임시 파일이 없음을 확인
- 다음 단계: 남은 8~13개 아티클을 계속 배치로 작성 (남은 후보 주제: RAW vs JPEG, 히스토그램 읽는 법, 매뉴얼 모드 입문, 장노출 손떨림 방지, 일출·일몰 촬영 설정, 광궤적 촬영, 광각 vs 망원 초점거리 비교 등 — 심도 아티클과 겹치지 않는 주제 위주로 선별 예정)

## 2026-08-25 — 구글 애드센스 심사 대비: 가이드 아티클 3개 추가 (Phase 4 · 1차 배치)

- 애드센스 기획서 2번 항목의 "15~20개 아티클" 목표를 향한 첫 배치. 3개 주제 × 4개 언어 = 12개 파일 신규 작성 (누적 4개 아티클, 총 16개 파일)
  - "How to Choose the Right ND Filter for Long Exposure Photography" — 기획서 예시 주제 그대로. ND 필터 강도(스탑 수)별 활용법, 필터 겹쳐쓰기·가변 ND의 장단점, 실전 워크플로우
  - "Best Camera Settings for Landscape and Waterfall Photography" — 기획서 예시 주제(Waterflow)를 폭포로 구체화. 조리개·ISO·셔터스피드 설정과 폭포 촬영 시 ND 필터가 필요한 이유
  - "How to Add a Professional EXIF Frame to Your Photos" — 기획서 예시 주제 그대로, ExifLens의 프레임 생성기 기능과 직접 연결되는 주제로 자연스러운 내부 전환 유도
- 슬러그: `choosing-the-right-nd-filter`, `landscape-waterfall-camera-settings`, `how-to-add-exif-frame-to-photos` (4개 언어 모두 동일 슬러그 사용, hreflang 자동 매칭)
- 검증: `npm run build`에서 50개 페이지 전체 SSG 유지 확인(신규 아티클 12개 페이지 포함). 별도 포트로 새 서버를 띄워 12개 URL 전체 200 응답 확인, `/guides` 목록에 4개 아티클이 모두 정상 표시되는 것을 Playwright 스크린샷으로 확인, `sitemap.xml`에 44개 URL(기존 24 + 목록 4 + 아티클 16)이 정확히 반영됨을 확인
- 다음 단계: 남은 11~16개 아티클을 계속 배치로 작성 (남은 주제: ND 필터 개념 입문, 별사진·광궤적 등 장노출 응용, RAW vs JPEG, 히스토그램 읽는 법, 매뉴얼 모드 입문, 심도·초점거리 이해, 손떨림 방지, 일출·일몰 촬영 등)

## 2026-08-25 — 구글 애드센스 심사 대비: 가이드 콘텐츠 아키텍처 + 홈페이지 FAQ (Phase 3)

- 애드센스 기획서 2번 항목("가치 있는 텍스트 콘텐츠 확보") 진행. 사용자와 상의해 가이드(블로그) 저장 방식은 MDX(frontmatter + 마크다운, 코드 하이라이트 지원)로 결정 — JSON 방식과 비교 설명 후 채택
- `@mdx-js/mdx`, `gray-matter`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `@tailwindcss/typography` 신규 설치. Tailwind v4 방식대로 `globals.css`에 `@plugin "@tailwindcss/typography"` 추가
- `content/guides/<locale>/<slug>.mdx` 콘텐츠 디렉터리 신규 구성 — frontmatter(title/description/publishedAt/tags)와 마크다운 본문 분리, 언어별로 같은 slug 사용
- `src/lib/guides.ts` 신규: 슬러그 목록 조회, frontmatter만 빠르게 읽는 목록용 함수, MDX 본문을 실제 React 컴포넌트로 컴파일하는 함수(RSC에서 `@mdx-js/mdx`의 `evaluate` 사용), 단어 수 기반 예상 읽기 시간 계산을 제공
- `src/app/[locale]/guides/page.tsx`(목록), `src/app/[locale]/guides/[slug]/page.tsx`(본문) 신규 라우트 추가. 본문 페이지에는 Schema.org `Article` JSON-LD도 함께 추가(2단계에서 콘텐츠가 없어 보류했던 항목)
- 첫 번째 가이드 아티클 발행(4개 언어 전체): "Understanding EXIF Data: ISO, Shutter Speed, and Aperture Explained" — 애드센스 기획서가 예시로 제시한 주제 중 하나를 골라 실제로 작성. ISO·셔터스피드·조리개의 의미, 노출 삼각형, EXIF 확인 방법, FAQ까지 다룸 (영어 기준 약 900단어)
- 메인 페이지 하단에 `HomeFaqSection` 신규 추가 — 애드센스 기획서 2번 항목의 "메인 페이지 하단 설명 텍스트: 사용법, FAQ" 요건. "ExifLens 사용법" 4단계 설명과 자주 묻는 질문 6개를 `<details>/<summary>` 아코디언으로 구현(별도 JS 라이브러리 없이 시맨틱 HTML만 사용), Schema.org `FAQPage` JSON-LD도 함께 추가해 리치 스니펫 노출 가능성 확보
- `messages/{en,es,ja,ko}.json`에 `Guides`(목록/읽기시간/뒤로가기) 및 `Home.usageTitle`/`usageSteps`/`faqTitle`/`faq` 네임스페이스 신규 추가, 4개 언어 전체 작성
- `sitemap.ts`를 갱신해 `/guides` 목록 페이지와 신규 아티클 URL을 hreflang alternate와 함께 포함하도록 변경(총 32개 URL)
- 검증: `npm run build`에서 38개 페이지 모두 SSG 유지 확인(가이드 목록·본문 각 4개 언어 신규 포함). 별도 포트로 새 프로덕션 서버를 띄워 `/guides`, `/guides/[slug]` 4개 언어 전체 200 응답과 렌더링을 Playwright 스크린샷으로 확인, Article/FAQPage JSON-LD가 실제 응답에 포함됨을 `curl`로 확인, `sitemap.xml`에 신규 32개 URL이 정확히 반영됨을 확인, `eslint` 통과 확인
- 다음 단계: 4단계 — 나머지 가이드 아티클 14~19개를 4개 언어로 배치 작성 (한 번에 전부가 아니라 3~4개씩 나눠 진행)

## 2026-08-25 — 구글 애드센스 심사 대비: sitemap.xml / robots.txt 추가 (Phase 2)

- 애드센스 기획서 3번 항목("Google Search Console 인덱싱: sitemap.xml 및 robots.txt 제출") 진행
- `src/app/sitemap.ts` 신규: 현재 존재하는 모든 정적 라우트(홈, 프레임, privacy, terms, about, disclosure)를 4개 언어 × 6개 경로 = 24개 URL로 나열, 각 URL마다 `alternates.languages`로 hreflang 4개 언어 + x-default까지 포함. `/guides`와 그 하위 아티클은 아직 라우트가 없으므로 이번엔 제외 — 3·4단계에서 실제 페이지가 생기는 시점에 추가 예정(존재하지 않는 페이지를 sitemap에 올리는 것은 검색엔진에 더 나쁜 신호이므로)
- `src/app/robots.ts` 신규: 전체 허용 + `/api/`만 차단, `sitemap: https://exiflens.com/sitemap.xml` 명시
- 기존 canonical/hreflang 메타 태그는 `src/lib/seo.ts`의 `languageAlternates()`를 모든 페이지(`layout.tsx`, `frame`, 그리고 이번에 만든 4개 정책 페이지)가 이미 공통으로 쓰고 있어 별도 작업 없이 요건 충족 확인
- Schema.org Article/HowTo 스키마는 아직 추가하지 않음 — 현재는 홈/프레임 페이지뿐이라 Article·HowTo로 표시할 실제 콘텐츠가 없고, `WebApplication` 스키마는 이미 적용되어 있음. 가이드 아티클(4단계)과 FAQ 아코디언(3단계)이 만들어지면 그 콘텐츠에 맞춰 Article/HowTo/FAQPage 스키마를 함께 추가할 예정
- 검증: `npm run build` 정상 완료(30개 페이지 + `/robots.txt`, `/sitemap.xml` 정적 생성). 별도 포트로 프로덕션 서버를 새로 띄워 `curl`로 `/robots.txt`가 올바른 텍스트를, `/sitemap.xml`이 24개 `<loc>` 전체와 hreflang alternate 태그를 정확히 반환함을 확인
- 다음 단계: 3단계(가이드 콘텐츠 아키텍처 + 홈페이지 FAQ) → 4단계(가이드 아티클 15~20개 × 4개 언어 작성, 배치로 진행)

## 2026-08-25 — 구글 애드센스 심사 대비: 정책 페이지 4종 신규 추가 (Phase 1)

- 석한님이 제미나이와 정리한 "구글 애드센스 승인 심사 통과율 극대화 전략" 기획 문서(AdSense_SEO_Optimization_Guide.md)를 첨부하며 순서대로 진행 요청. 기획서 검토 결과 4가지 확인: (1) 가이드 아티클 15~20개는 제가 초안 작성, (2) en/es/ja/ko 4개 언어 동시 작성, (3) 연락처는 skysmoga@gmail.com, (4) 제휴 마케팅 고지에 쿠팡 파트너스 + 아마존 어소시에이트 모두 포함
- 점검 결과 기존 `site-footer.tsx`가 `/privacy`, `/terms`, `/guides`로 이미 링크를 걸고 있었지만 실제 라우트 페이지가 하나도 없어 전부 404였음 — 애드센스 심사에서 즉시 거절 사유가 되는 항목이라 1순위로 진행
- `src/app/[locale]/{privacy,terms,about,disclosure}/page.tsx` 4개 라우트 신규 생성. 기존 `frame/page.tsx`의 `generateMetadata` 패턴(canonical, hreflang, OpenGraph)을 그대로 따름
- `src/components/legal-page.tsx` 신규: 제목 + 최종 수정일(선택) + 섹션(제목·본문 단락) 목록을 렌더링하는 공용 컴포넌트. 4개 정책 페이지가 이를 공유
- `messages/{en,es,ja,ko}.json`에 `Privacy`/`Terms`/`About`/`Disclosure` 네임스페이스 신규 추가 — 각 언어로 직접 작성한 개인정보처리방침(쿠키·구글 애드센스 데이터 활용·제휴 링크 고지 포함), 이용약관(서비스 설명·콘텐츠 소유권·면책조항), 사이트 소개, 제휴 마케팅 고지문(쿠팡 파트너스 + 아마존 어소시에이트) 전문. `Footer`에 `about`/`disclosure` 키 추가
- `site-footer.tsx`: 푸터 네비게이션에 소개(About)·제휴 마케팅 고지(Disclosure) 링크 추가 (기존 가이드·개인정보처리방침·이용약관과 함께 5개 링크로 구성)
- 검증: `npm run build`에서 신규 16개 페이지(4개 라우트 × 4개 언어) 모두 SSG로 정상 생성 확인(총 28페이지). 로컬 프로덕션 서버에서 `/{locale}/{privacy,terms,about,disclosure}` 16개 URL 전부 200 응답 확인, Playwright로 4개 페이지 스크린샷 렌더링 확인, 푸터 링크의 실제 href가 각 페이지로 정확히 연결됨을 확인. `/guides`는 이번 라운드 범위가 아니므로 여전히 404 — 3단계(가이드 콘텐츠 아키텍처) 진행 시 해결 예정
- 다음 단계: 2단계(sitemap.ts/robots.ts, Schema.org Article/HowTo 보강) → 3단계(가이드 콘텐츠 아키텍처 + 홈페이지 FAQ) → 4단계(가이드 아티클 15~20개 × 4개 언어 작성, 배치로 진행)

## 2026-08-25 — 라이트룸 테마 여백 비대칭화 + 캡션 가운데 정렬 수정

- 석한님이 타 사이트의 라이트룸 테마 원본 사진을 첨부하며 "현재 적용된 라이트 룸과 상,하, 좌,우 여백의 차이가 있어. 원본은 상,좌,우 여백은 얇게 되어있고, 하단의 여백이 좀더 넓게 되어있어. 원본 테마처럼 여백 수정과 텍스트가 중앙정렬 되어있는 부분도 동일하게 수정해줘"라고 요청
- 첨부 사진(4096×2865)을 픽셀 단위로 분석한 결과: 상/좌/우 테두리는 이미지 폭의 약 1.22%(50px)로 얇고, 하단 테두리만 약 3.66%(150px)로 약 3배 두꺼움을 확인. 카메라+렌즈 캡션은 화면 전체 폭 기준 가운데 정렬(중심이 이미지 중심과 거의 일치), 촬영일은 기존처럼 우측 정렬 유지
- `src/lib/theme-renderer.ts`의 `drawLightroomMatLayout`: 기존에는 4면 동일한 `padding` 값 하나로 테두리를 그렸으나, 이제 `sideBorder`(상/좌/우, 폭의 1.22% + 여백 슬라이더 값)와 `bottomBorder`(하단, 폭의 3.66% + 여백 슬라이더 값)를 분리해 비대칭 테두리로 변경. 카메라+렌즈 캡션은 `textAlign: "left"`에서 `"center"`로 바꿔 캔버스 전체 폭 기준 가운데에 그리도록 수정, 촬영일은 우측 정렬 그대로 유지. 캡션이 길어질 때 가운데 텍스트와 우측 날짜가 겹치지 않도록 폭 계산식도 함께 조정(날짜 폭의 2배를 여유분으로 확보). 기존의 "말줄임 금지, 폰트 크기만 축소" 원칙은 그대로 유지
- `THEME_PRESETS`의 `lightroom` 프리셋: 테두리 비율이 레이아웃 함수에 내장됐으므로 기본 `paddingPercent`를 2 → 0으로 변경(모니터·포토 카드 등 다른 테마와 동일한 규칙)
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright(헤드리스 크로미움)에서 실제 레이아웃 계산식을 그대로 재현해 렌더링한 결과 테두리 두께(50px/150px)가 참고 사진과 정확히 일치함을 확인, 카메라·렌즈 이름을 극단적으로 길게 넣은 스트레스 테스트에서도 겹침·잘림 없이 폰트만 축소되는 것을 확인

## 2026-08-25 — 촬영일(takenAt)에 시:분:초까지 표시

- 석한님 요청: "현재 날짜 기록이 년,월,일 까지 기록되고있는데 시,분,초 까지 기록 되었으면 좋겠어" — 프레임 생성기의 '촬영일' 필드가 사진 EXIF의 촬영 시각(DateTimeOriginal)에서 연-월-일만 추출하던 것을, 시:분:초까지 포함하도록 변경
- `src/lib/exif.ts`: `formatTakenDate`가 "YYYY:MM:DD HH:MM:SS" 형식의 EXIF 원본 값에서 이제 시각까지 파싱해 "YYYY-MM-DD HH:MM:SS"로 반환 (예: "2025-08-28 12:28:16"). 사진에 시각 정보가 없으면 기존처럼 날짜만 표시
- 이 값은 홈 화면 EXIF 패널에는 노출되지 않고, 프레임 생성기의 '촬영일' 입력란과 스트랩/라이트룸/필름/빈티지 앰버/다크 그라디언트 등 날짜를 표시하는 모든 테마 캡션에 공통 반영됨 — 각 테마에 이미 적용된 "넘치면 폰트 자동 축소, 말줄임 금지" 규칙 덕분에 길어진 문자열도 잘리지 않고 자동으로 작아짐
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. 실제 EXIF 시각 정보(2025:08:28 12:28:16)가 있는 사진으로 Playwright 검증 — '촬영일' 필드와 클래식 다크·스트랩 테마 캡션 모두 "2025-08-28 12:28:16"으로 정상 표시되고 겹침·잘림 없음을 확인

## 2026-08-25 — 테마 시스템 Phase 3 (3차): 샷 온·포토 카드·팁·포스터 4개 테마 추가 + 전체 테마 커스터마이징 패널

- 석한님이 타 사이트에서 남은 4가지 테마가 적용된 원본 사진 4장을 첨부하며 "확인 후 똑같이 만들어줘. 그리고 전체 테마 커스터마이징 패널 함께 진행해줘"라고 요청. 픽셀 단위 분석 후 애매한 지점 4가지를 AskUserQuestion으로 먼저 확인:
  - 두 신규 캡션 테마에서 브랜드명이 두 번 반복돼 보이는 문제("Canon Canon ...")는 카메라 필드에 브랜드가 이미 포함돼 생긴 우연한 중복으로 판단 → **자연스럽게 제거**하기로 확정 (브랜드를 별도로 앞에 붙이지 않고 카메라 필드를 그대로 사용)
  - 팁/포스터 테마의 제목·본문·장소명 등은 카메라 EXIF와 무관한 범용 텍스트 → **EXIF와 별개의 새 자유 입력 필드**로 추가하기로 확정
  - '모든 테마 커스터마이징' 기능에서 테마를 전환하면 이전에 수정한 값은 **새 테마의 기본값으로 초기화**되는 것으로 확정
  - 두 캡션 테마의 정확한 이름은 석한님도 모르셔서 직접 이름을 붙임: "샷 온"(하단 흰 바, 굵은 장비명), "포토 카드"(흰 여백 테두리 + 가운데 정렬 캡션)
- `src/lib/theme-renderer.ts`: `drawShotOnLayout`, `drawPhotoCardLayout`, `drawTipOverlayLayout`, `drawPosterOverlayLayout` 4개 레이아웃 함수 신규 추가, `THEME_PRESETS`에 `shot-on` / `photo-card` / `tip` / `poster` 4개 프리셋 추가. 장비명(카메라/렌즈)이 들어가는 두 캡션 테마는 기존 원칙대로 말줄임 없이 폰트 크기만 축소하며, 팁/포스터의 범용 텍스트 필드에도 동일한 축소 규칙을 적용
- `src/lib/frame-canvas.ts`: `FrameMetadata`에 `tipLabel`/`tipHeading`/`tipBody1`/`tipBody2`, `posterDate`/`posterTitle1`/`posterTitle2`/`posterLocationName`/`posterLocationAddress` 9개 필드 추가 (참고 사이트의 기본 placeholder 문구를 그대로 기본값으로 사용)
- `src/components/exif-frame-generator.tsx`:
  - 배경색/텍스트색/폰트/브랜드 로고 표시/여백 커스터마이징 패널을 `테마==="custom"`일 때만 보이던 것에서 **어떤 테마를 선택하든 항상 보이도록** 변경 — 테마 전환 시 그 테마 고유의 기본값으로 커스터마이징 값이 리셋됨
  - "팁"/"포스터" 테마 선택 시, 기존 카메라 EXIF 입력 필드 대신 각 테마 전용 입력 필드(라벨/제목/본문 1·2, 날짜/제목 1·2줄/장소명/주소)가 표시되도록 조건부 렌더링 추가
- `messages/{ko,en,es,ja}.json`: 신규 테마 이름 4개, 신규 필드 라벨 9개를 4개 언어 전체에 추가
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 4개 신규 테마 모두 석한님이 보내주신 참고 사진과 대조해 레이아웃이 정확히 일치함을 확인, 커스터마이징 패널이 임의의 프리셋 테마에도 정상 적용/리셋됨을 캔버스 픽셀 색상으로 직접 검증, 매우 긴 가상 카메라명으로 스트레스 테스트해 말줄임 없이 축소되는 것을 확인, 커스텀 테마를 포함한 전체 23개 테마를 순회하며 콘솔 에러 없이 정상 렌더링되는 것도 함께 확인

## 2026-08-25 — 모니터 테마를 검은 띠만 있는 텍스트 없는 디자인으로 수정

- 지난 라운드에서 보류했던 모니터 테마 처리 방향을 석한님께 확인 — "모니터 테마는 하단에 검은색 띠만 있는게 정상이야"라고 확답을 받아, 텍스트 없이 하단 검은 띠만 있는 디자인이 의도된 것으로 확정
- `src/lib/theme-renderer.ts`: `drawMonitorLayout` 전면 재작성 — 기존의 4면 균일 베젤 + 카메라/렌즈/노출정보 텍스트 렌더링을 모두 제거하고, 사진을 위/좌/우 여백 없이 그대로 채운 뒤 하단에만 사진 너비의 약 3.5% 두께의 순수 검정 띠를 추가하는 구조로 단순화(텍스트 없음). `여백` 슬라이더는 그 검정 띠 위에 얹히는 추가 균일 마진으로 남겨둠(기본값 0%)
- `monitor` 프리셋: `paddingPercent` 3→0, `backgroundColor`를 참고 사진에서 확인된 순수 검정(`#000000`)으로 변경
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 실제 사진을 올려 모니터 테마를 선택하고 캔버스 픽셀을 직접 읽어 하단 띠가 완전한 순수 검정(RGB 0,0,0)이고 상단은 여전히 사진 내용임을 확인, 18개 전체 테마를 순회하며 콘솔 에러 없이 정상 렌더링되는 것도 함께 확인

## 2026-08-25 — 라이트룸·필름 테마를 참고 원본 사진과 동일하게 수정

- 석한님이 다른 사이트에서 방금 적용한 라이트룸/필름/모니터 3개 테마의 원본 사진을 첨부하며 동일하게 만들어달라고 요청. 픽셀 단위로 분석해 확인한 내용:
  - **라이트룸**: 두꺼운 매트(8%)가 아니라 사방 약 1.2~1.4%의 얇은 균일 테두리, 캡션은 별도 바가 아니라 그 얇은 테두리 안에 좌측(카메라+렌즈, 노출정보 없음)/우측(촬영일)으로 배치
  - **필름**: 노출정보 없이 촬영일/카메라/렌즈 3줄만 전부 대문자로 스택 배치(기존엔 카메라+렌즈+노출정보를 한 줄로 합쳐서 표시하고 있었음)
  - **모니터**: 원본 사진을 픽셀 단위로 확인한 결과 하단에 아주 얇은 검은 띠만 있고 텍스트가 전혀 없어(순수 검정, RGB 0) — 의도된 디자인인지 석한님께 별도로 확인 필요해 이번 라운드에서는 보류
- `src/lib/theme-renderer.ts`: `drawLightroomMatLayout`, `drawFilmLcdLayout` 재작성 — 위 분석 내용 그대로 반영. 두 테마 모두 장비명(카메라/렌즈)은 기존 원칙대로 말줄임 없이 폰트 크기만 축소
- `lightroom` 프리셋 기본 여백 8%→2%로 변경
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 석한님이 보내주신 실제 값(Canon EOS R5m2 / RF15-35mm F2.8 L IS USM / 2025/08/28 12:28:16)으로 재현해 참고 이미지와 동일한 레이아웃 확인, 의도적으로 매우 긴 가상 모델·렌즈명으로 스트레스 테스트해 겹침·말줄임 없음을 확인

## 2026-08-25 — 테마 시스템 Phase 3 (2차): 라이트룸·필름·모니터 3개 테마 추가

- exif-frame.yuru.cam 참고 리뉴얼 2차 라운드 — 1차(스트랩 교체/풀 보더 정리/텍스트 없는 테마 3종)에 이어 진행
- `src/lib/theme-renderer.ts`에 3개 신규 레이아웃 함수 추가:
  - **라이트룸(lightroom-mat)**: 넉넉하고 균일한 어두운 매트(라이트룸 내보내기 미리보기 느낌) + 하단 우측 구석에 작고 눈에 띄지 않는 캡션 1줄(카메라·렌즈·촬영정보). 핫셀블라드(중앙 정렬·자간 강조)와 달리 구석에 조용히 배치되는 것으로 차별화
  - **필름(film-lcd)**: 옛날 필름 카메라의 "데이터백" 인화 느낌 — 사진 좌측 하단 구석에 앰버색 LCD 스타일 텍스트를 겹쳐서 표시(위: 촬영일, 아래: 카메라·렌즈·촬영정보), 은은한 앰버 글로우 효과. 기존 빈티지 앰버(크림색 매트+우측 하단 날짜만) 및 필름 스트립(스프로킷홀+하단 캡션바)과는 다른 위치·구성으로 차별화(석한님 피드백: "폰트 위치가 다름")
  - **모니터(monitor)**: 얇은 검정 베젤 + 베젤 안 좌우 구석에 아주 작은 모노스페이스 텍스트(좌: 카메라·렌즈, 우: 촬영정보·날짜) — 스트랩의 큼직한 정보 바와 대비되는 조용하고 컴팩트한 스타일
  - 세 테마 모두 카메라/렌즈 등 장비 식별 텍스트는 이전 라운드들과 동일한 원칙(말줄임 금지, 폰트 크기만 바닥 없이 축소)을 적용
- `messages/{ko,en,es,ja}.json`에 `lightroom`·`film`·`monitor` 번역 키 3개씩 추가
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 3개 테마 모두 정상 렌더링(콘솔 에러 없음) 확인, 의도적으로 매우 긴 가상 카메라/렌즈명으로 스트레스 테스트해 세 테마 모두 겹침·말줄임 없이 축소되어 표시됨을 확인

## 2026-08-25 — 스트랩 테마 재설계: 참고 스크린샷과 동일한 레이아웃으로 교체

- 1차 작업에서 만든 스트랩 테마(2행 다크 바)가 석한님이 실제로 원하신 디자인과 다름 — 첨부해주신 실제 원본 사진(스트랩 테마 적용 예시) 기준으로 다시 설명받고 재작업
- 최종 확정된 레이아웃: 사진 하단에 흰 정보 바 1줄, 좌측에 촬영일시, 우측에 브랜드 워드마크(이탤릭 세리프 + 브랜드 시그니처 색상, 캡슐 배지 아님) + 얇은 세로 구분선 + 카메라 모델명(볼드)/렌즈명(회색) 2줄 블록을 우측 정렬로 배치. 노출 정보(초점거리·조리개·셔터·ISO) 줄은 참고 이미지에 없어 제외. 사진 위 워터마크 문구는 라이트룸에서 이미 추가하신 것이라 프레임 생성기에서 별도로 다루지 않기로 확인
- 브랜드 로고 폰트: 실제 Canon 등의 로고타입은 상표권상 그대로 재현할 수 없어, "비슷한 느낌의 이탤릭 세리프 폰트 + 브랜드 시그니처 색상"으로 진행하기로 석한님과 재확인
- `src/lib/theme-renderer.ts`: 캡슐 배지 렌더링 함수(`drawBrandBadge`/`measureBadgeWidth`)를 제거하고, 배경 없이 이탤릭 세리프로 브랜드명만 그리는 `drawBrandWordmark`/`measureWordmarkWidth`로 교체. `drawStrapLayout`을 참고 레이아웃에 맞게 전면 재작성 — 날짜/모델명/렌즈명/워드마크 4개 텍스트 요소가 공유 배율(scale)로 함께 축소되도록 구현해 카메라 모델명·렌즈명이 말줄임 없이 항상 전체 표시되도록 함(그리드 스펙시트 테마의 "말줄임 금지" 원칙 적용). 스트랩 테마 기본 여백을 참고 이미지처럼 사진이 정보 바에 바로 맞닿도록 0%로 변경
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 (1) 석한님이 보내주신 실제 값(Canon EOS R5m2 / RF15-35mm F2.8 L IS USM / 2025/08/28 12:28:31)으로 재현해 참고 이미지와 동일한 레이아웃 확인, (2) 의도적으로 매우 긴 가상 모델·렌즈명으로 스트레스 테스트해 겹침·말줄임 없이 전체 표시됨을 확인, (3) 촬영일 없음 / 미인식 브랜드(로고 없음) 등 예외 케이스도 정상 폴백 확인, (4) 다른 테마(클래식 다크·핫셀블라드·커스텀)도 회귀 없음을 스크린샷으로 재확인

## 2026-08-25 — 테마 시스템 Phase 3 (1차): exif-frame.yuru.cam 참고 리뉴얼 — 샷 온 브랜드→스트랩 교체, 풀 보더 정리, 텍스트 없는 테마 3종 추가

- 석한님이 경쟁 서비스 exif-frame.yuru.cam의 스크린샷 16장을 첨부하며 "최대한 흡사하게 만들어달라"고 요청. 기존 14개 테마와 참고 사이트 16개 테마를 비교 분석해 보고 후, 다음 방침으로 진행 확정:
  1. "샷 온 브랜드" 테마를 삭제하고 참고 사이트의 "스트랩(Strap)" 디자인으로 교체
  2. "풀 보더" 테마 삭제 — "핫셀블라드"와 여백 값 말고는 차이가 없다고 판단해 핫셀블라드로 흡수, 기본 여백을 9%→2%로 축소
  3. 브랜드 로고는 실제 브랜드 폰트 파일을 구할 수 없어(상표권 이슈) 지금처럼 "시그니처 색상 + 볼드 시스템 폰트" 방식 유지하기로 확인받음
  4. 참고 사이트에만 있던 텍스트 없는 개념의 테마(No frame / Just frame / Cinema Scope)를 1차로 우선 추가하고, Lightroom·Film·Monitor는 2차, Poster·Tip·Custom 계열 + 전 테마 커스터마이징 확장은 3차로 나눠 진행하기로 합의
- `src/lib/theme-renderer.ts`:
  - **스트랩(strap)**: 기존 단일 행 "샷 온 브랜드"를 2행 구조로 재설계 — 1행은 브랜드 배지 + 카메라 모델명(볼드), 2행은 렌즈명(좌) / 노출 정보(우). 사진 좌측 상단에는 촬영일을 자간 넓힌 흰색 대문자로 직접 오버레이(필름 시대 스트랩/백에 날짜가 인화되던 느낌)
  - 카메라 모델명(1행)과 렌즈명(2행)은 장비를 식별하는 정보이므로 그리드 스펙시트 테마에 적용했던 "말줄임 금지, 대신 폰트 크기를 바닥 없이 축소" 원칙을 여기에도 동일하게 적용 — 매우 긴 가상의 모델명/렌즈명으로도 잘리지 않고 전체가 표시되는 것을 확인
  - **핫셀블라드**: 기본 여백 9%→2%로 축소 (풀 보더 흡수)
  - **노 프레임(no-frame)**: 테두리·텍스트·여백 전혀 없이 크롭된 사진 그대로 내보내는 순수 패스스루 레이아웃 신규 추가
  - **저스트 프레임(just-frame)**: 텍스트 없이 균일한 여백(테두리)만 적용하는 레이아웃 신규 추가
  - **시네마 스코프(cinema-scope)**: 사진 위에 검은 레터박스 바를 씌워 약 2.35:1 화면비로 보이게 하는 텍스트 없는 레이아웃 신규 추가
  - "풀 보더" 테마 및 전용 레이아웃 함수(`drawSquareBorderLayout`) 제거
- `src/components/exif-frame-generator.tsx`: 커스텀 테마 기본 레이아웃을 `shot-on-brand`→`strap`으로 변경
- `messages/{ko,en,es,ja}.json`: `shot-on-brand`·`full-border-square` 번역 키 제거, `strap`·`no-frame`·`just-frame`·`cinema-scope` 4개 키 추가
- 검증: `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 16개 테마 전체를 순회 렌더링해 콘솔 에러 없음을 확인하고, 스트랩 테마는 실제 EXIF 사진(소니)과 의도적으로 매우 긴 가상 카메라/렌즈명 두 가지로 스트레스 테스트해 겹침·말줄임 없이 표시됨을 확인. 핫셀블라드·노 프레임·저스트 프레임·시네마 스코프·그리드 스펙시트(회귀 확인)도 스크린샷으로 개별 검증

## 2026-08-25 — 그리드 스펙시트 테마: 폰트 크기 확대, 칸 안쪽 여백 축소

- 석한님 피드백: 폰트가 너무 작고 라벨 사이 간격(칸 안쪽 여백)이 너무 넓음 — 간격을 줄이더라도 폰트를 키워달라는 요청
- `drawGridSpecLayout`의 크기 관련 상수 조정: 그리드 영역 높이 `sw*0.15`→`sw*0.17`, 기본 라벨 크기 비율 `gridHeight*0.16`→`0.2`, 기본 값 크기 비율 `gridHeight*0.24`→`0.34`로 확대. 칸 안쪽 여백(`cellPadding`)은 `sw*0.012`(최소 6px)에서 `sw*0.006`(최소 3px)로 절반가량 축소 — 여백이 줄어든 만큼 텍스트가 쓸 수 있는 폭이 넓어져 공유 폰트 크기 계산 로직(직전 수정에서 도입) 자체가 자동으로 더 큰 크기를 선택하게 됨
- 검증: `npm run lint` 통과, `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 (1) 이전에 문제였던 값("Canon EOS R5m2" / "RF15-35mm F2.8 L IS USM")에서 글자가 이전보다 확실히 커지고 겹침·말줄임 없이 표시됨을 확인, (2) 짧은 값("Sony A7IV" 등)에서도 커진 기본 크기로 표시됨을 확인, (3) 의도적으로 매우 긴 가상 이름으로도 여전히 잘리지 않고 전부 표시됨을 재확인

## 2026-08-25 — 그리드 스펙시트 테마: 말줄임(…) 제거, 값 전체가 함께 축소되도록 변경

- 직전 수정(칸 겹침 방지)에서 적용한 "칸에 안 맞으면 말줄임(…) 처리" 방식에 대해 석한님 피드백: 프레임을 만드는 목적 자체가 어떤 장비로 촬영했는지 기록하기 위함인데, 카메라/렌즈명을 말줄임 처리해버리면 정보가 가려져 프레임의 존재 의미가 없어짐 — 말줄임을 완전히 제거하고, 대신 값 텍스트 전체가 한 칸에 다 들어갈 때까지 모든 칸의 글자 크기를 함께(동일한 크기로) 줄이는 방식으로 변경 요청
- `drawGridSpecLayout` 재작성: 칸별로 각자 다른 크기로 줄이던 기존 방식 대신, 6개 칸 전체가 공유하는 단일 폰트 크기를 계산 — 가장 좁게 맞아야 하는 칸(주로 카메라/렌즈)의 실측 텍스트 폭 기준으로 정확히 필요한 크기를 역산(`measureText` 폭 비율로 직접 계산, 1px씩 줄여보는 반복문 방식이 아님)해 모든 값 칸에 동일하게 적용 → 어떤 경우에도 텍스트가 잘리지 않음
- 라벨(CAMERA/LENS 등)과 값의 크기 밸런스: 값이 많이 줄어든 경우(15% 이상) 라벨도 같은 비율로 함께 축소해, 라벨은 큰데 값 글자만 작아 보이는 불균형을 방지. 값이 별로 줄지 않는 일반적인 경우엔 라벨 크기 그대로 유지
- 검증: `npm run lint` 통과, `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 (1) 석한님이 재현하신 값("Canon EOS R5m2" / "RF15-35mm F2.8 L IS USM")에서 말줄임 없이 전체 텍스트가 축소되어 표시됨을 확인, (2) 의도적으로 훨씬 더 긴 가상 카메라/렌즈명으로도 글자가 매우 작아지긴 하지만 끝까지 잘리지 않고 전부 표시됨을 확인, (3) 짧은 일반적인 값("Sony A7IV" 등)에서는 축소 없이 기본 크기 그대로 유지되는 것도 함께 확인

## 2026-08-25 — 버그 수정: 그리드 스펙시트 테마 텍스트 겹침

- 석한님 제보(스크린샷 첨부): 그리드 스펙시트 테마에서 카메라("Canon EOS R5m2")·렌즈("RF24-70mm F2.8 L IS USM") 값이 6칸 균등 분할 폭보다 길어 다음 칸까지 흘러넘쳐 텍스트가 서로 붙어버리는 문제
- 수정 전 방향을 요약해 석한님께 재확인받은 뒤 진행:
  1. 카메라/렌즈 칸에는 초점거리/조리개/셔터스피드/ISO보다 넓은 가중치(weight)를 부여해 칸 폭을 차등 분배
  2. 그래도 값이 칸 폭을 넘으면 값의 글자 크기를 `measureText` 기준으로 자동 축소하고, 축소 후에도 안 맞으면 말줄임(…) 처리 — Phase 1의 "샷 온 브랜드", Phase 2의 "라이카" 테마에 이미 적용한 것과 동일한 패턴
- `src/lib/theme-renderer.ts`의 `drawGridSpecLayout`을 셀별 폭 계산 + 라벨/값 각각의 자체 셀 폭 기준 말줄임으로 재작성
- 검증: `npm run lint` 통과, `npm run build`에서 8개 페이지 모두 SSG 유지. Playwright로 (1) 석한님이 제보하신 것과 동일한 값("Canon EOS R5m2" / "RF24-70mm F2.8 L IS USM")으로 재현 후 정상 렌더링 확인, (2) 의도적으로 훨씬 더 긴 가상 카메라/렌즈명으로도 겹침 없이 말줄임 처리되는지 재확인

## 2026-08-25 — EXIF 프레임 생성기 테마 확장 Phase 2 (나머지 7개 프리셋 + 커스텀 테마)

- Phase 1(6개)에 이어 원래 15개 테마 요청 중 남은 항목을 이번 라운드에서 진행: 라이카, 핫셀블라드, 필름 스트립, 블러 배경, 빈티지 앰버, 그리드 스펙시트, 다크 그라디언트 (프리셋 7개) + 사용자 커스텀 테마 1개, 총 14개 테마로 확장. 진행 전 "한 번에 전부 진행" / "커스텀 테마도 이번 배치에 포함"으로 석한님께 확인받고 진행
- `src/lib/theme-renderer.ts`에 7개 신규 레이아웃 함수 추가:
  - **라이카**: 밝은 배경 + 브랜드 배지 대신 작은 빨간 사각형 포인트(라이카의 레드닷을 연상시키되 그대로 재현하지 않음) + 카메라/렌즈명, 우측 촬영정보
  - **핫셀블라드**: 사방 넉넉한 여백 + 하단에 자간을 넓힌 대문자 카메라명 중앙 정렬 캡션(미니멀리즘 강조)
  - **필름 스트립**: 사진 위아래에 필름 스프로킷 홀(구멍) 패턴을 그린 검은 띠 + 하단 캡션 스트립
  - **블러 배경**: 사진 자체를 확대·블러 처리해 배경으로 깔고(Canvas 2D `filter: blur()`), 그 위에 선명한 사진을 패딩과 함께 배치, 하단에 캡션
  - **빈티지 앰버**: 크림색 보더 + 은은한 비네트 + 옛 필름카메라 타임스탬프 느낌의 앰버색 모노스페이스 날짜 각인(글로우 효과 포함)
  - **그리드 스펙시트**: 사진 하단에 카메라/렌즈/초점거리/조리개/셔터스피드/ISO를 각각 셀로 나눠 라벨+값 형태의 격자로 표시(구분선 포함)
  - **다크 그라디언트**: 테두리 없이 사진에 꽉 차게, 기존 미니멀 오버레이보다 더 크고 진한 하단 그라디언트 + 큰 글씨 + 우측 상단 촬영일 워터마크
  - **커스텀**: 배경색·글자색(컬러 피커), 폰트(고딕/명조/모노스페이스), 브랜드 로고 표시 여부(토글 스위치)를 사용자가 직접 설정 가능한 테마 — 기본 여백 슬라이더도 함께 적용됨. 레이아웃은 "샷 온 브랜드" 구조를 재사용
- `ThemeDefinition`에 `showBrandBadge` 옵션 추가(라이카·샷 온 브랜드·커스텀 테마의 로고/배지 표시 여부 제어), `ThemeRenderOptions`에 `customTheme` 필드 추가해 프리셋 배열에 없는 "커스텀" 테마를 런타임에 주입
- `src/components/exif-frame-generator.tsx`: 테마 드롭다운에 신규 7개 + "커스텀" 항목 추가, 커스텀 테마 선택 시에만 나타나는 설정 패널(배경/텍스트 컬러 피커, 폰트 선택, 브랜드 로고 토글) 구현, 여백 슬라이더 값을 커스텀 테마 상태와 동기화
- 4개 언어 메시지에 신규 테마 8종(7개 프리셋 + 커스텀) 이름과 커스텀 패널 라벨(배경 색상/텍스트 색상/폰트/브랜드 로고 표시) 번역 추가
- 구현 중 발견 후 수정한 버그 2건:
  1. **필름 스트립 무한 루프 위험**: 스프로킷 홀을 그리는 반복문에서 사진 크기가 매우 작을 경우 홀 간격(`holeGap`)이 0으로 반올림되어 무한 루프에 빠지는 잠재적 버그 발견(실제 Playwright 테스트 중 탭이 응답 없음 상태로 재현) → 홀 크기·간격에 최소값(각각 2px, 4px)을 보장하는 방어 코드 추가
  2. **라이카 테마 텍스트 겹침**: 카메라+렌즈 제목과 우측 촬영정보가 긴 이름에서 겹치는 문제 발견(Phase 1의 "샷 온 브랜드"와 동일한 종류의 버그) → 동일하게 `measureText` 기반 폰트 크기 축소 + 말줄임(…) 처리 로직 적용
- 검증: `npm run lint` 통과, `npm run build`에서 8개 페이지(en/es/ja/ko × 홈/프레임) 모두 `● SSG` 정적 생성 유지 확인. Playwright로 실제 프로덕션 빌드에 대해 (1) 테마 드롭다운에 14개 항목 전체 노출 확인, (2) 신규 7개 프리셋 전체를 실제 사진에 순회 적용해 캔버스 렌더링을 스크린샷으로 육안 검증, (3) 커스텀 테마 설정 패널(컬러 피커/폰트/로고 토글) 노출 및 미리보기 반영 확인, (4) 라이카 테마를 일반 카메라명과 의도적으로 아주 긴 가상의 카메라명 두 경우로 재검증해 겹침 없음 확인, (5) 필름 스트립 테마가 정상 크기 사진에서 더 이상 멈추지 않고 렌더링됨을 확인

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
