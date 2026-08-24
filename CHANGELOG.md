# 개발 이력 (Development History)

## 2026-08-24 — Phase 1: 프로젝트 셋업 & 기본 레이아웃

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
- Phase 2: `exifreader` 기반 실제 EXIF 파싱 드래그앤드롭 컴포넌트
- Phase 3: ND 필터 계산 로직 실연동 + 카운트다운 타이머 기능
- Phase 4: SEO 메타데이터/구조화 데이터, 실제 애드센스 스크립트, 아마존 제휴 링크 연동
- 실제 도메인 연결 및 Vercel 배포
