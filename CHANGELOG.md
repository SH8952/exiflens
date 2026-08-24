# 개발 이력 (Development History)

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
