# SEO 개선 예약 작업 (자동 진행)

이 파일은 매일 자동으로 실행되는 예약 작업(스케줄된 세션)이 읽고 따라야 할 작업 목록입니다.
각 항목은 서로 독립적이며, **하루에 정확히 하나씩만** 진행합니다.

## 실행 규칙 (매일 반드시 지킬 것)

1. 아래 항목 중 `- [ ]`(미완료)로 표시된 것 중 **가장 위에 있는 항목 하나만** 진행한다. 모두 `- [x]`면 아무 작업도 하지 않고 "오늘 진행할 SEO 작업 없음"이라는 짧은 요약만 남기고 종료한다.
2. 작업 시작 전 반드시 디바이스 저장소에서 백업을 먼저 만든다 (`_backups/exiflens_backup_YYYYMMDD_HHMMSS/`로 rsync, node_modules/.next/_backups/_incoming 제외).
3. 코드 변경은 클라우드 워크스페이스에서 먼저 작성 후 `npx tsc --noEmit`, `npx eslint <변경파일>`, 가능하면 `npm run build` + Playwright(헤드리스 크로미움, `/opt/pw-browsers/chromium`)로 실제 렌더링까지 검증한다. 이 저장소는 과거 `libraw-wasm` 관련 Turbopack 번들링 이슈가 있었으므로, 새 npm 의존성을 추가하지 말고 기존 패턴(커스텀 모달, 순수 CSS/Tailwind 등)을 따른다.
4. 검증이 끝난 파일만 tar로 묶어 `SendUserFile` → `device_commit_files`로 디바이스의 `~/Desktop/애드센스 제휴 마케팅/exiflens/_incoming/`에 전달 후, 디바이스에서 압축 해제 → `git diff`로 의도와 일치하는지 확인 → 디바이스에서도 `npx tsc --noEmit` / `npx eslint` 재확인한다. (디바이스는 arm64 SWC 바이너리가 없어 `npm run build`가 실패하는 환경적 제약이 있음 — 정상이니 무시하고 클라우드 빌드 결과로 갈음한다.)
5. 커밋 메시지는 이 파일의 항목 설명을 근거로 작성하고, `CHANGELOG.md` 최상단에 개발 이력을 추가 커밋한다(석한님의 "작업 완료 시 항상 개발/업데이트 이력에 기록" 규칙).
6. 이 파일에서 완료한 항목의 체크박스를 `- [x]`로 바꾸고, 완료 날짜와 커밋 해시를 한 줄로 덧붙인 뒤 커밋한다 (다음 실행이 이어서 진행할 수 있도록).
7. **git push는 절대 시도하지 않는다.** device_bash 환경은 GitHub 인증이 없어 push가 항상 실패한다 — 커밋까지만 하고, 석한님이 편한 시간에 직접 push 하도록 남겨둔다.
8. 광고 코드(GA4/AdSense 관련 스크립트, ads.txt 등)는 어떤 항목에서도 건드리지 않는다. 애드센스 심사가 진행 중이므로 안전을 최우선으로 하고, 조금이라도 애매하거나 위험해 보이면 해당 항목을 건너뛰고 이유를 CHANGELOG와 요약 메시지에 남긴다.
9. 디바이스(데스크톱 앱)가 연결되지 않아 저장소에 접근할 수 없으면, 아무 것도 변경하지 말고 다음 실행에 재시도하도록 이 파일도 그대로 둔다.
10. 항상 존댓말(문서/커밋 메시지 등 사용자向 텍스트 기준)로 작성하고, 이 파일 자체나 CHANGELOG 서술도 기존 톤(석한님 요청 맥락 명시)을 따른다.
11. 작업 종료 시 사용자에게 짧은 요약(무엇을 했는지, push 필요 여부)을 메시지로 남긴다.

배경: 구글 서치 콘솔 데이터 분석(2026-08-31, Gemini 분석 의뢰) 결과 노출은 급증하지만 클릭률이 거의 없고, 평균 게재 순위가 60~70위권. Gemini가 제안한 4가지 개선안을 안전한 것부터 하루 한 항목씩 적용하기로 함(석한님 승인, 2026-08-31).

---

## 1일차 — BreadcrumbList 구조화 데이터 추가

- [ ] 미완료

**내용**: 가이드 상세 페이지와 가이드 목록 페이지에 BreadcrumbList JSON-LD를 추가해 검색결과에 "ExifLens › Guides › 글 제목" 형태의 경로가 노출되도록 한다. 콘텐츠 작성 없이 템플릿만으로 전체 언어/전체 가이드에 일괄 적용 가능.

**구현 가이드**:
- `src/lib/seo.ts`에 `breadcrumbJsonLd(items: {name: string; url: string}[])` 헬퍼 함수 추가. 반환 형태:
  ```ts
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  ```
- `src/app/[locale]/guides/[slug]/page.tsx`: 기존 `articleJsonLd` 스크립트 옆에 breadcrumb 스크립트 추가. 경로: Home(`${SITE_URL}/${locale}`) → Guides(`${SITE_URL}/${locale}/guides`, 이름은 `Guides.title` 번역 키 사용) → 현재 글(`${SITE_URL}/${locale}/guides/${slug}`, 이름은 `meta.title`).
- `src/app/[locale]/guides/page.tsx`(가이드 목록 페이지)에도 Home → Guides 2단계 breadcrumb 추가.
- 새 번역 키 추가 불필요(기존 `Guides.title`, `Home.title` 등 재사용).

---

## 2일차 — WebApplication 스키마 범위를 실제 도구 페이지로 한정

- [ ] 미완료

**내용**: 현재 `webApplicationJsonLd`가 `src/app/[locale]/layout.tsx`의 `<head>`에서 전체 페이지(약관/개인정보처리방침/가이드 글 등 포함)에 동일하게 삽입되고 있음. 실제 도구가 아닌 페이지에도 "이건 웹 애플리케이션이다"라고 표시하는 것은 부정확하므로, 홈(`/`)과 프레임 생성기(`/frame`) 두 페이지에만 적용되도록 정리한다.

**구현 가이드**:
- `src/app/[locale]/layout.tsx`에서 `webApplicationJsonLd` import 및 `<head>` 내 `<script>` 삽입 코드를 제거.
- `src/app/[locale]/page.tsx`(홈)와 `src/app/[locale]/frame/page.tsx`(프레임 생성기) 각각의 반환 JSX 최상단에 `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd(locale)) }} />`를 직접 추가 (홈페이지의 `HomeFaqSection`이 이미 같은 패턴으로 body 내에 JSON-LD를 넣고 있으므로 그 패턴을 그대로 따르면 됨 — schema.org JSON-LD는 `<head>`가 아니어도 유효함).
- 프레임 생성기 페이지용으로 `webApplicationJsonLd`의 `name`/`description`을 그대로 재사용해도 되고, 필요하면 `url`만 `${SITE_URL}/${locale}/frame`로 바꾸는 정도로 충분(과도하게 손대지 말 것).
- 다른 페이지(terms/privacy/about/disclosure/guides)는 이미 각자 Article 등 적절한 스키마가 있거나 없어도 무방하므로 손대지 않는다.

---

## 3일차 — 노출 상위 가이드 2개의 타이틀/메타 디스크립션 개선 (영어)

- [ ] 미완료

**내용**: 서치 콘솔에서 가장 많이 노출된 두 가이드 글의 영어(en) 타이틀/설명을 클릭을 유도하는 문구로 개선한다. 오늘은 영어만 진행(다국어 전체 확대는 별도 항목으로 추후 논의).

**대상 파일**:
- `content/guides/en/wide-angle-vs-telephoto*.mdx` (frontmatter의 `title`, `description`)
- `content/guides/en/` 아래 "understanding-metering-modes"로 시작하는 파일 (frontmatter의 `title`, `description`)

**개선 방향** (Gemini 제안 예시 참고, 실제 글 내용을 먼저 읽고 정확하게 반영할 것):
- 타이틀에 숫자나 명확한 혜택(Benefit)을 포함 (예: "Wide Angle vs Telephoto Focal Length" → "Wide Angle vs Telephoto: Complete Focal Length Guide (+Examples)" 같은 톤).
- 메타 디스크립션은 질문형으로 시작해 클릭을 유도하고, 실제 글에서 다루는 내용을 정확히 반영.
- 과장이나 클릭베이트는 금지 — 실제 글 내용과 반드시 일치해야 함.
- 변경 후 `generateMetadata`가 이 frontmatter를 그대로 읽어 `<title>`/`<meta description>`에 반영되는 구조이므로 별도 코드 수정은 불필요.

---

## 4일차 — 가이드 글 내 메인 도구 CTA 배너 추가

- [ ] 미완료

**내용**: 가이드 글을 읽는 사용자가 메인 EXIF 도구(홈페이지)로 자연스럽게 유도되도록, 가이드 상세 페이지에 CTA 배너 컴포넌트를 추가한다. 콘텐츠가 아닌 템플릿 작업이라 전체 가이드/전체 언어에 한 번에 적용 가능.

**구현 가이드**:
- `src/components/guide-tool-cta.tsx` 신규 컴포넌트 생성: 배너 형태로 "사진의 초점거리·렌즈 정보를 확인해보세요" 류의 문구 + 홈페이지(`/`)로 가는 버튼/링크. `@/i18n/navigation`의 `Link` 사용.
- `messages/{ko,en,ja,es}.json`의 `Guides` 네임스페이스에 새 키 2개 추가: 배너 문구(`ctaBannerText`)와 버튼 라벨(`ctaBannerButton`, 예: "무료로 사진 분석하기" / "Analyze Your Photo Free" 등 톤에 맞게).
- `src/app/[locale]/guides/[slug]/page.tsx`에서 글 본문 상단(제목 바로 아래)과 본문 하단(관련 가이드 섹션 위) 두 군데에 이 컴포넌트를 배치.
- 기존 `ExifUploader`/`Button` 컴포넌트 스타일과 톤을 맞출 것(새 디자인 시스템 만들지 말고 기존 `border-border`, `bg-card`, `Button` variant 재사용).

---

## 5일차 — 홈페이지 H1/H2 타겟 키워드 보강

- [ ] 미완료

**내용**: 현재 홈페이지 H1이 브랜드명("ExifLens")만 있고 타겟 키워드가 부족함. Gemini는 `EXIF viewer`, `Extract EXIF online`, `Photo metadata checker` 같은 롱테일 키워드가 H1/H2/소개 문구에 자연스럽게 포함되도록 보강할 것을 제안함.

**구현 가이드**:
- `messages/{ko,en,ja,es}.json`의 `Home.title`/`Home.subtitle` 문구를 수정. 브랜드명은 유지하되, 부제 형태로 핵심 키워드를 자연스럽게 추가 (예 en: "ExifLens — Free Online EXIF Viewer & Photo Metadata Checker"). 각 언어의 자연스러운 표현으로 번역할 것(직역 금지, 키워드 스터핑 금지).
- `src/app/[locale]/page.tsx`의 H1(`{t("title")}`)/부제(`{t("subtitle")}`) JSX 구조는 그대로 두고 텍스트만 바뀐다. 길어진 문구가 레이아웃을 깨지 않는지 Playwright 스크린샷으로 4개 언어 모두 확인할 것(특히 일본어/한국어는 줄바꿈에 유의).
- 페이지 `<title>`(메타데이터)도 함께 자연스럽게 맞춰 조정할 여지가 있으면 반영(단, 과도한 확장 금지).

---

## 완료 후

5개 항목이 모두 `- [x]`가 되면, 이후 실행은 "오늘 진행할 SEO 작업 없음"만 보고하고 종료한다. 이 예약 작업 자체를 계속 둘지 삭제할지는 사용자가 별도로 판단한다.
