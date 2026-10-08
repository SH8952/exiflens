## 2026-10-09 — 가이드 목록 "더보기": 접힌 카드도 처음부터 HTML에 포함(검색 로봇 링크 확보)

- 배경: Search Console 분석에서 9/17 이후 노출이 급감(9/18부터 하루 1~2회). 같은 시기 도입한 "더보기"가 접힌 카드(5번째 이후)를 HTML에 넣지 않아 목록 페이지의 가이드 링크가 72편 중 27편으로 줄었던 것이 한 가지 가능성.
- 수정: `src/components/guides/guide-category-section.tsx` — 모든 카드를 렌더링하고 접힌 상태에서는 initialVisibleCount 이후 카드에만 `hidden` 클래스를 적용. 화면 동작(접기/펼치기, 세션 기억)은 동일. 숨긴 카드의 이미지는 lazy라 접힌 동안 내려받지 않음.
- 변경하지 않은 것: 카드 디자인, 더보기 버튼, 메시지, 다른 페이지.
- 검증: tsc·eslint 오류 없음, build 성공, ko/en/ja/es 가이드 목록에서 링크 72/72(이전 27), 숨김 카드 45개.
- 백업: `_backups/guides-showmore-dom_*/`.

## 2026-10-08 — 가이드 박스 디자인(5번, 한국어 우선) + About 레이아웃 다듬기(6번)

- 요청: 5번 혼합(A 렌더링 방식 먼저) 중 한국어만 진행(주간 한도 사정, 나머지 언어는 다음 주기에), 6번은 레이아웃만.
- 5번: `src/lib/guides.ts` — 한국어 가이드에서 H2 제목에 "자주 묻는 질문/체크리스트/실수/정리하기"가 포함된 구역을 `<section class="guide-box guide-box-*">`로 감싸는 rehype 플러그인(`wrapGuideBoxes`) 추가. 글 파일(288개)은 수정하지 않음. H2 id·순서·목차는 그대로(수집 플러그인 뒤, 앵커 플러그인 앞에 배치). `src/app/globals.css` — 체크리스트(초록 체크), 실수(주황 느낌표), FAQ(Q. 접두), 정리(파란 강조) 박스 스타일, 모바일 여백 보정.
- 6번: `src/app/[locale]/about/page.tsx` — 섹션 제목 왼쪽 강조선, 이야기·문의 카드화, 장비 표 둥근 테두리·행 호버, 갤러리 사진 둥근 모서리·호버 확대. 문구·메시지·구조 변경 없음.
- 변경하지 않은 것: 글 본문, 영어·일본어·스페인어 가이드 렌더링, About 문구.
- 검증: tsc·eslint 오류 없음, next build --webpack 성공, ko 가이드 72편 모두 200, 박스 구역 확인(체크리스트·실수·FAQ·정리), en/ja/es 가이드에는 박스 없음, 4개 언어 About 200.
- 후속: 다음 주 한도 초기화 후 en/ja/es 소제목 매칭 추가(guides.ts의 boxKind만 확장).
- 백업: `_backups/guide-boxes-about-layout_*/`.

## 2026-10-08 — 홈 화면 4-3·4-4: 최신 블로그 영역 + "전체 보기" 버튼 통일, 모바일 배지·사용법 줄바꿈 보정

- 요청: 4-3(최신 블로그 영역)·4-4(영역 제목·"더 보기" 정돈) 진행(두 단계씩 나눠 진행하려던 계획의 2번째 묶음). 모바일 확인 결과 반영 — 신뢰 배지가 두 줄로 나뉘는 문제, 사용법 문장이 문장 중간에서 줄바꿈되는 문제(문장이 "~다."에서 끝나는 곳에서 줄이 바뀌게).
- 4-3: `src/components/home-blog-highlights.tsx`(신규) — 도구 영역 아래에 최신 블로그 글 최대 3개를 썸네일 카드(3:2)로 노출. 블로그가 한국어 전용이라 한국어 홈에서만 보이고 en/ja/es 홈에는 아무것도 그리지 않음. 예약 발행 글은 `getAllBlogMeta()`가 자동 제외. `messages`에 `Home.blogHighlightsTitle/Subtitle/Cta`(4개 언어) 추가.
- 4-4: `src/components/home-section-cta.tsx`(신규) — 영역마다 제각각이던 밑줄 텍스트 링크를 같은 윤곽선 버튼으로 통일. 가이드·도구·FAQ·블로그 영역에 적용(`home-guide-highlights`·`home-tools-highlights`·`home-faq-highlights`·`home-blog-highlights`).
- 모바일 배지: `src/components/home-trust-badges.tsx` — sm(640px) 미만에서는 마지막 배지("4개 언어 지원")를 숨겨 3개가 한 줄에 들어가게 함(더 좁은 폰에서는 자연스럽게 줄바꿈).
- 사용법 줄바꿈: `src/components/home-usage-section.tsx` — messages 원문에 문장 중간 줄바꿈(\n)이 있어 좁은 화면에서 어색하게 끊겼음. 줄바꿈은 무시하고 문장 끝(". ! ? 。")에서만 줄이 바뀌도록 문장 단위로 나눠 표시(문구 자체는 변경 없음, 일본어는 이어 붙일 때 공백 없음). 카드당 문장 7단계 합계 16문장.
- 한국어 단어 중간 줄바꿈 방지: `src/app/[locale]/page.tsx` — ko 홈 전체에 `word-break: keep-all`(+ overflow-wrap) 적용(예: 제목 "EXIF 뷰/어"처럼 끊기던 문제). en/ja/es는 변화 없음.
- 변경하지 않은 것: 광고 위치, 푸터 방문자 수, 사용법·배지 문구, 다른 홈 영역 구성.
- 검증: `tsc`·`eslint` 오류 없음(미사용 import 1건 정리), `next build --webpack` 성공, `next start`에서 ko/en/ja/es 홈 200, 블로그 썸네일·링크는 ko 홈에만(2개, en/ja/es 0개) 확인, 영역 버튼 4개 문구 존재, 사용법 문장 span 16개, keep-all은 ko에만 적용, 블로그·가이드·도구 200·없는 주소 404 유지. 실제 화면은 로컬/모바일 확인 필요.
- 백업: `_backups/home-blog-cta-polish_*/`.

## 2026-10-08 — 홈 화면 개선: 사용법 카드화 + 소개 문구 아래 신뢰 배지 줄 (4개 언어)

- 배경: 사이트를 더 풍부하고 프로페셔널하게 다듬는 4단계(홈 화면 구성 보강) 중 4-1·4-2. 4-3(최신 블로그 영역)·4-4(영역 제목 정돈)은 요청 시 진행. 푸터 방문자 수는 사용자 결정으로 그대로 유지.
- 4-1 변경: `src/components/home-usage-section.tsx` — 사용법 7단계를 번호+텍스트 세로 나열에서 아이콘 카드 격자(모바일 1열, sm 2열, lg 3열)로 변경. 아이콘은 설치된 `lucide-react`(Upload·ScanSearch·MapPin·Timer·Frame·ShieldCheck·Compass, 장식용 aria-hidden), 단계가 홀수이고 3으로 나눠 1개가 남으면(현재 7개) 마지막 카드를 가로 전체로 펼침. 문구(messages `Home.usageSteps`)는 변경 없음, `ol/li/h3/p` 구조와 하단 링크(도구·가이드·FAQ) 유지.
- 4-2 변경: `src/components/home-trust-badges.tsx`(신규) — 소개 문구 바로 아래 알약형 배지 줄(체크 아이콘). `src/app/[locale]/page.tsx`에서 소개 문구 뒤에 배치. `messages/{ko,en,ja,es}.json`에 `Home.trustBadges`(4개 문자열: 무료 / 가입 불필요 / 사진 서버 전송 없음 / 4개 언어 지원) 추가. 기존 개인정보 안내 한 줄은 그대로 둠.
- 변경하지 않은 것: 광고 위치, 다른 홈 영역(가이드·도구·FAQ·연결·장비), 푸터, 사용법 문구, 비공개 도구 이름 비노출 원칙.
- 검증: `tsc`·`eslint` 오류 없음, `next build --webpack` 성공, `next start`에서 ko/en/ja/es 홈 200, 배지 4개 문구·사용법 7단계 제목 모두 HTML에 존재, 마지막 카드 전체 폭 처리 확인, 도구·가이드·블로그 200·없는 주소 404 유지. 실제 화면 모양은 로컬 확인 필요.
- 백업: `_backups/home-usage-cards-badges_*/`.

## 2026-10-08 — 가이드 상세 읽기 경험 개선: 읽기 진행 표시 + 본문 타이포 정리 (4개 언어)

- 배경: 사이트를 더 프로페셔널하게 다듬는 3단계. 글 내용은 건드리지 않고 화면 표현만 개선.
- 변경(진행 표시): `src/components/guides/reading-progress.tsx`(신규) — 화면 맨 위 3px 막대가 본문을 읽은 만큼 채워짐(본문 위가 화면 위에 닿을 때 0%, 본문 끝이 화면 아래에 닿을 때 100%). 스크롤 때 React 재렌더링 없이 `scaleX`만 변경(requestAnimationFrame), 스크린리더에서는 숨김.
- 변경(타이포): `src/app/[locale]/guides/[slug]/page.tsx` — 본문 문단 줄 간격 확대(leading-8, 목록 leading-7), H2 위 여백·아래 구분선, H3 위 여백, 인용문 강조선(primary), 본문 이미지 모서리 둥글게. 한국어(ko)에서는 제목과 본문에 어절 단위 줄바꿈(`word-break: keep-all`, 긴 영문·주소는 필요할 때만 끊김)을 적용해 단어 중간 줄바꿈 방지(일본어는 띄어쓰기가 없어 적용 제외).
- 변경하지 않은 것: 가이드 글 내용(mdx), 목차(정적·리모컨), 메타데이터·구조화 데이터, 블로그 글 화면(별도 요청 시).
- 검증: `tsc`·`eslint` 오류 없음, `next build --webpack` 성공, `next start`에서 ko/en/ja/es 가이드 72개씩 총 288페이지 모두 200 + 본문 id 확인, 한국어에만 keep-all 적용(영어 미적용) 확인, 빌드된 CSS에 새 스타일 규칙 포함 확인. 실제 화면은 로컬 확인 필요.
- 참고: 가이드 수는 언어별 72개(총 288 파일)로 확인됨 — 앞서 "18개"로 말한 것은 오류였음(로드맵 5번 작업 범위 산정에 영향).
- 백업: `_backups/guide-reading-experience_*/`.

## 2026-10-08 — 사이트 전용 404 화면 + 오류 화면 + 글 본문 표 가로 스크롤 보호 (4개 언어)

- 배경: 사이트를 더 프로페셔널하게 다듬는 2단계(세부 완성도 점검). 점검 결과 전용 404/오류 화면이 없어 잘못된 주소에서 Next.js 기본 영어 문구("404: This page could not be found.")가 나왔고, 본문(MDX) 표는 넓어지면 모바일에서 화면 밖으로 밀릴 수 있었음. 로딩 화면은 대부분 정적 페이지라 효과가 작아 제외(사용자 결정).
- 변경(404): `src/app/[locale]/not-found.tsx`(신규) — 사이트 헤더·푸터 안에 "페이지를 찾을 수 없습니다" 안내 + 홈·도구·가이드·블로그 버튼. `src/app/[locale]/[...rest]/page.tsx`(신규) — 정의되지 않은 주소(/ko/없는페이지 등)를 `notFound()`로 보내 위 화면 사용(상태 코드 404 그대로). 가이드·블로그의 없는/예약 글 주소(`notFound()`)도 같은 화면.
- 변경(오류): `src/app/[locale]/error.tsx`(신규) — 예상치 못한 오류 시 "문제가 발생했습니다" + "다시 시도"·홈 버튼(헤더·푸터 유지).
- 변경(표): `src/components/mdx-table.tsx`(신규) — 표를 `overflow-x-auto` 영역으로 감쌈. `blog/[slug]/page.tsx`·`guides/[slug]/page.tsx`에서 MDX `table`로 연결, `src/lib/guides.ts`의 `Content` 타입에 `components` 허용. 현재의 좁은 표는 모양 변화 없음.
- 문구: `messages/{ko,en,ja,es}.json`에 `NotFound`, `ErrorPage` 추가.
- 검증: `tsc`·`eslint` 오류 없음, `next build --webpack` 성공(`/[locale]/[...rest]` 동적 라우트 추가). `next start`에서 ko/en/ja/es 없는 주소·가이드/블로그/도구 없는 글 주소 모두 404 + noindex, 기존 정상 페이지(홈·도구·가이드·블로그·소개·FAQ·글 상세·sitemap·rss·robots) 모두 200, 블로그 표가 스크롤 영역으로 감싸짐 확인. 응답 데이터(RSC)에 새 404 화면 문구가 들어간 것은 확인.
- 알아둘 점: 이 사이트는 루트 레이아웃이 html을 그리지 않는 구조라 404 응답이 "브라우저에서 그리는 방식"으로 내려감(기존 가이드·블로그의 없는 글 주소도 동일). 실제 브라우저에서의 모양은 로컬에서 `/ko/없는페이지`로 확인 필요(웹 환경에 브라우저 없음).
- 백업: `_backups/not-found-error-table_*/`.

## 2026-10-08 — 도구 목록(/tools)·홈 "사진 도구" 카드에 이미지 썸네일 추가 (4개 언어 공통)

- 배경: 사이트를 더 풍부하고 전문적으로 보이게 개선하는 방향(글 늘리기·색인 작업 중단)의 첫 단계. 가이드 목록 카드와 같은 방식으로 도구 카드에도 이미지를 넣음.
- 변경: `src/components/tools/tool-card-image.tsx`(새 파일) — 카드 상단 16:9 썸네일(모바일 2:1), `next/image`, 호버 시 살짝 확대, 장식용 alt="". `src/lib/tool-images.ts` — `getToolCardImage(slug)` 추가(도구 페이지 예시 이미지의 왼쪽 → 오른쪽 순으로 첫 이미지, 새 이미지 파일 없음). `src/app/[locale]/tools/page.tsx` — 도구 카드를 이미지+글 구조로 재구성, 첫 섹션 첫 3장만 우선 로딩. `src/components/home-tools-highlights.tsx` — 홈 도구 카드에도 같은 썸네일(전부 지연 로딩).
- 이미지가 없는 도구(shutter-count-checker, image-compressor)는 이미지 영역 없이 기존 텍스트 카드 그대로. 도구 상세 페이지·메타데이터·카드 링크 동작은 변경 없음.
- 검증: `tsc`·`eslint` 오류 없음, `next build --webpack` 성공, `next start`로 ko/en/ja/es의 /tools·홈 200, 도구 상세(예시 3개) 200. /tools HTML에 도구 이미지 15장(우선 로딩 3·지연 12), 홈은 15장 모두 지연 로딩 확인. 실제 화면 모양은 로컬 확인 필요.
- 백업: `_backups/tool-card-images_*/`.

## 2026-10-08 — 가이드 목록 카드에 대표 이미지 썸네일 추가 (4개 언어 공통)

- 요청: 가이드 목록(`/guides`)이 텍스트 카드뿐이라 밋밋해 보이므로 블로그 목록처럼 카드 상단에 썸네일을 넣는다. 카드 배치는 위쪽 16:9 이미지 + 아래 제목·설명(세로형)으로 결정. ExifLens 가이드에만 적용(다른 사이트는 사용자가 필요할 때 따로 요청).
- 변경: `src/components/guides/guide-category-section.tsx` — 카드를 이미지 영역 + 글 영역으로 재구성(`next/image`, `fill`, 16:9, 모바일은 2:1로 낮춤, 호버 시 살짝 확대). 항목에 `image`·`imageAlt` 추가, `prioritizeImages` 옵션 추가(첫 화면 섹션의 첫 2장만 우선 로딩, 나머지는 지연 로딩). 대표 이미지가 없는 글은 이미지 영역 없이 기존 텍스트 카드 그대로. `src/app/[locale]/guides/page.tsx` — 각 글의 `meta.image`와 `getGuideImageAlt`(언어별 alt)를 카드에 전달, 첫 번째 카테고리 섹션에 `prioritizeImages` 지정.
- 변경하지 않은 것: 글 상세 페이지, 메타데이터·구조화 데이터, "더보기/접기" 동작(펼침 상태 기억 포함), 대표 이미지 파일.
- 검증: `tsc`·`eslint` 오류 없음, 실제 `next build --webpack` 성공, `next start`로 ko/en/ja/es 목록 200 OK·글 상세 200 OK. 목록 HTML에서 카드마다 `img`(alt 포함)가 들어가고 우선 로딩 2장, 나머지는 `loading="lazy"` 확인. 실제 화면 모양은 로컬(`npm run dev`)에서 확인 필요(웹 환경에 브라우저 없음).
- 참고: 이미지는 `next/image`가 카드 크기에 맞게 줄여서 제공(원본 90~410KB를 그대로 싣지 않음). 격리 복사본에서 Turbopack 빌드는 node_modules 심볼릭 링크 문제로 실패하므로 `--webpack`으로 검증(복사본 환경 한정 문제, 실제 코드와 무관).
- 백업: `_backups/guide-list-thumbnail_*/`.

## 2026-10-08 — 홈 EXIF 패널에 "파일 용량" 항목 + 5MB 이상일 때 "용량 줄이기" 바로가기(사진 자동 전달)

- 요청: "촬영 날짜·시간" 바로 아래에 파일 용량 항목을 추가하고, 용량 수치 옆에 이미지 용량 줄이기 도구 바로가기를 둔다. 노출 기준은 SNS 업로드 한도 기준(조사 후 5MB로 결정: X 5MB가 주요 SNS 중 가장 낮음, Instagram·Facebook·Threads 8MB, LinkedIn·Pinterest 10MB), 이동 시 사진도 함께 넘어가게.
- 변경: `src/components/exif-panel.tsx` — "파일 용량" 행 추가(`formatBytes`, 사진 없으면 "—"). 용량 ≥ 5MB(5×1024×1024바이트)이고 압축기가 받는 형식(JPG·PNG·WebP)이며 60MB 이하일 때만 "용량 줄이기" 링크 노출(HEIC·RAW·60MB 초과·압축기가 비공개면 숨김). `src/app/[locale]/page.tsx` — `isToolAccessible("image-compressor")`를 패널에 전달. `src/store/exif-store.ts` — `handoffFile`·`setHandoffFile`·`takeHandoffFile` 추가(압축기로 넘길 사진 한 칸, 꺼내면 비워짐). `src/components/image-tools/batch-workbench.tsx` — `acceptHandoff` 옵션(압축기만 true): 열릴 때 한 번 넘어온 사진을 꺼내 목록에 자동 추가. `src/components/image-tools/image-compressor-card.tsx` — `acceptHandoff` 전달. `messages/{ko,en,ja,es}.json` — `fileSize`, `compressLink`, `compressLinkTitle`.
- 동작: 링크를 누르면 `exif-store`(브라우저 메모리)에 사진을 담고 `/tools/image-compressor`로 이동 → 압축기가 열리며 사진이 목록에 자동 추가. 서버로 전송되지 않음. 새로고침·주소 직접 입력으로 압축기에 들어오면 전달된 사진 없음(기존처럼 직접 업로드). 나머지 이미지 도구 5개는 `acceptHandoff`가 꺼져 있어 변화 없음.
- 검증: `tsc`·`eslint` 오류 없음, 실제 `next build` 성공. 4개 언어 홈 화면에서 "파일 용량" 라벨 확인. 컴포넌트 시험(렌더링): 사진 없음 "—"/링크 없음, 3MB·4.99MB 링크 없음, 5MB·PNG 12MB·WebP 8MB 링크 표시(`/tools/image-compressor`), 61MB·HEIC·CR3·압축기 비공개 시 링크 없음. 압축기 시험(가상 DOM): 넘어온 6MB JPG 자동 추가·저장 칸 비워짐, 다시 열어도 중복 없음, 옵션이 꺼진 도구는 소비하지 않음, HEIC·61MB는 건너뛰고 안내 표시. 실제 브라우저에서의 클릭·페이지 이동(웹 환경에 브라우저 없음)은 로컬 확인 필요.
- 참고: 용량 표시는 소수 둘째 자리 MB(예: 4.99MB는 "5.00MB"로 보이지만 5MB 미만이라 링크는 없음).
- 백업: `_backups/exif-filesize-compress-link_20261008_070311/`.

## 2026-10-07 — 블로그 예약 발행 (발행일이 미래인 글은 그 날짜(한국 시간 0시)가 되면 자동 공개)

- 배경: 주 2편 발행 계획에 맞춰 글을 미리 작성해 푸시해 두고 날짜에 맞춰 공개할 수 있게 함. 기존에는 `content/blog/ko`에 파일이 올라가면 `publishedAt`과 관계없이 바로 공개됐음.
- 사용법: 글 머리 정보(frontmatter)의 `publishedAt`을 공개하고 싶은 날짜(예: "2026-10-14")로 적어 푸시하면 됨. 한국 시간 기준 그날 0시부터 공개. 로컬 `npm run dev`에서는 예약 글도 미리보기로 보임.
- 변경: `src/lib/blog.ts` — `isBlogPublished()` 추가(한국 시간 날짜 비교, 날짜 형식이 이상하면 안전하게 공개). `getBlogMeta`·`compileBlogPost`가 미공개 글에 null을 돌려주므로 목록·글 상세(직접 주소는 404)·관련 글·RSS·사이트맵에서 한꺼번에 제외. `src/app/[locale]/blog/page/[page]/page.tsx` — 목록 2페이지 이후를 빌드 때 미리 만들지 않고 요청 때마다 만들도록 변경(`force-dynamic`, 글이 12개를 넘는 시점이 배포 없이 날짜만으로 올 수 있어서).
- 공개 시점: 블로그 목록·글 상세·목록 2페이지 이후·RSS는 원래 요청 때마다 만들어지는 방식(빌드 결과 ƒ)이라 날짜가 되면 바로 공개됨(재배포 불필요). 사이트맵은 배포할 때 만들어지는 정적 파일이라 예약 글은 공개일 이후의 첫 배포부터 사이트맵에 들어감(검색엔진은 목록 페이지·RSS로도 발견 가능, 공개 당일 Search Console 색인 요청 권장).
- 시행착오: 처음에는 페이지에 1시간 주기 재생성(`revalidate`)을 넣었으나 원래 동적 페이지라 불필요했고 목록 2페이지가 500 오류(DYNAMIC_SERVER_USAGE)를 내서 제거함. 사이트맵은 서버 실행 중에 content 파일을 읽을 수 있게 포함되지 않아(빌드 추적 결과 확인) 동적으로 바꾸지 않음.
- 검증: 격리 복사본에서 실제 `next build`(성공, 빌드 결과 표가 변경 전과 같고 목록 2페이지만 ●→ƒ) 후 `next start`로 미래 날짜(2099) 가짜 글 확인 — 목록·사이트맵·RSS·관련 글에 없음, 글 주소 404, 기존 두 글 200, `/page/2`·`/page/abc` 404(500 아님), `tsc` 오류 없음. `next dev`에서는 가짜 글이 보임(미리보기). 날짜 비교 로직은 한국 시간 경계(23:50 전/0:30 후)로 단위 확인. 실제 사이트에는 반영하지 않음.
- 알아둘 점: `public/blog/images`의 사진 파일은 글이 숨겨져 있어도 정확한 파일 주소를 입력하면 열림(추측이 어려워 위험 낮음). 사이트맵을 공개일에 맞추려면 Vercel 재배포 훅 + 예약 실행을 추가하는 선택지가 있음(필요 시 별도 작업).
- 백업: `_backups/blog-scheduled-publish_20261007_171817/`.

## 2026-10-07 — 블로그 글 구조화 데이터(BlogPosting)에 대표 이미지(image) 추가

- 배경: 디스커버 노출 점검에서 `BlogPosting` JSON-LD에 `image`가 없는 점을 확인. 대표 이미지를 구조화 데이터에도 명시해 구글이 글의 대표 이미지를 확실히 인식하도록 보강.
- 변경: `src/app/[locale]/blog/[slug]/page.tsx` — `articleJsonLd`에 `image: [썸네일 절대 주소]` 추가(썸네일이 없으면 `image` 필드, 둘 다 없으면 생략). og:image와 같은 1200×800 썸네일을 사용.
- 의도적으로 변경하지 않음: 작성자 `Photographer SH`(사이트 관리자 닉네임·필명)와 저작권 안내의 `Chronicle of Moments_SH`(사진 워터마크)는 용도가 달라 통일하지 않기로 결정(사용자 결정). publisher 로고 추가도 하지 않음.
- 검증: 격리 로컬 서버에서 두 글 모두 JSON-LD `image`에 각 썸네일 주소가 들어가고 기존 필드(작성자·날짜)는 그대로, `tsc` 오류 없음(로컬 주소가 localhost:3010으로 보이는 것은 로컬 SITE_URL 설정 때문이며 실제 사이트에서는 exifnd.com 주소로 나옴). 실제 사이트에는 반영하지 않음.
- 백업: `_backups/blog-jsonld-image_20261007_165036/`.

## 2026-10-07 — 홈이 아닌 모든 페이지에 "상위 페이지로" 뒤로가기 버튼 추가 (4개 언어)

- 배경: 홈에서 블로그 등으로 들어가면 되돌아갈 버튼이 없고(가이드 글의 "← 가이드 목록으로"만 존재) 브라우저 뒤로가기만 가능했음.
- 구현: 공용 컴포넌트 `src/components/back-link.tsx`(`<BackLink to="home|tools" />`) 신설. 가이드 글의 기존 버튼과 같은 위치·모양(본문 컬럼 왼쪽 위, 제목 위, `text-sm text-muted-foreground hover:text-foreground`)이며, 브라우저 기록이 아니라 고정된 상위 페이지로 이동. 문구는 `messages/{ko,en,ja,es}.json`의 새 `BackNav` 네임스페이스(toHome / toTools).
- 적용: "← 홈으로" — 블로그 목록(`blog-list-view.tsx`, 2페이지 이후 포함), 도구 허브, 가이드 목록, FAQ, 프레임, 소개·문의·개인정보·이용약관·공시(공용 `legal-page.tsx`). "← 도구 목록으로" — 계산기 도구 상세 16개 + 이미지 도구 6개(총 22개)(공용 `image-tool-page.tsx`). 변경 없음 — 홈(버튼 없음), 가이드 글(기존 "← 가이드 목록으로" 유지), 블로그 글(기존 "← 블로그 목록으로" 유지).
- 간격: 컨테이너 gap(6/8/10)에 맞춰 버튼과 제목 사이 간격이 가이드 글과 같도록 음수 하단 여백을 보정.
- 검증: 격리 로컬 서버에서 4개 언어 × 주요 경로 확인 — 위 페이지 모두 200과 올바른 문구, 홈은 버튼 0개, 가이드 글·블로그 글은 중복 없음, `tsc --noEmit` 오류 없음. 실제 사이트에는 반영하지 않음. 참고: 블로그는 한국어 전용이라 en/ja/es의 /blog는 기존대로 ko로 리다이렉트.
- 백업: `_backups/exiflens_backup_20261007_121636/`.

## 2026-10-07 — 블로그 두 번째 글 "실내 사진 촬영, 조리개 밝은 렌즈가 필요한 이유" + 블로그 글 저작권 안내 문단

- 새 글: `content/blog/ko/indoor-photography-fast-aperture-lens.mdx`(한국어 전용, 분류 "실내 촬영", 발행일 2026-10-07). 구성은 첫 글과 같은 흐름(도입 → 먼저 결론 → 원리·표 → 렌즈별 밝기 → f4 이상 렌즈 설정 → 흔들림 주의 → FAQ → 프레임 생성기 안내 → 정리). 실제 촬영 EXIF(R5 Mark II 5장, R7 1장)로 등가 노출표를 계산해 넣음: F1.4 1/200 ISO 50 = f2 1/100 = f2.8 1/50 = f4 1/25 = f5.6 약 1/12(f4에서는 ISO 400 1/200), F1.4 ISO 100 1/10 = f4 약 0.8초(또는 ISO 800 1/10).
- 사실 확인 범위: 촬영지(House of Benedict Pattaya, 2025-09-04)·모든 사진 손으로 들고 촬영은 사용자 제공 정보. 솔방울 사진은 실내가 아닌 야간 카페 테라스(2024-10-18, R7)라고 본문에 명시. 문의 연락처는 skysmoga@gmail.com.
- 이미지: `public/blog/images/indoor-lens-1~6.webp`(본문, 가로 1600px, 클래식 다크 프레임 여백 2%, 사이트 프레임 렌더러로 생성, 워터마크 유지, EXIF 미포함), `indoor-lens-1~6-full.webp`(클릭용 프레임 없는 사진, 원본 해상도 1718×2576 그대로 — 확대 없음), `indoor-lens-thumb.webp`(목록 카드·og:image, 둥근 의자 사진 3:2 크롭 1200×800). 사진 배치: 전경 → 발코니 → 솔방울 → 둥근 창 → 의자 → 조개 순으로 글 중간에 분산.
- 저작권 안내: 새 글과 10월 1일 글(`night-photography-light-starburst-settings.mdx`) 맨 아래 "저작권 안내" 문단 추가(직접 촬영한 사진임, 한국 저작권법 근거 조문 제4조 제1항 제9호·제10조·제12조·제13조·제16조·제18조·제22조·제28조·제30조·제123조·제125조·제136조·제140조 안내, 무단 이용 금지, 문의 연락처, © 표기). 법령 원문 사이트에 접속하지 못해 한국법제연구원 영문 법령 사이트와 해설 자료로 조문 번호를 확인했으므로 발행 전 국가법령정보센터 확인 권장. 법적 효력이 아닌 경고·안내 용도. 10월 1일 글의 발행일 표시는 변경하지 않음.
- 검증: 소스 코드 변경 없음(콘텐츠·이미지만). 격리된 로컬 서버에서 `/ko/blog` 200(두 글 카드·썸네일), 새 글 상세 200(본문 사진 6장·alt 6개·표 2개·h2 11개·취소선 없음·BlogPosting JSON-LD·og:image=썸네일), 10월 1일 글 200(저작권 안내 포함), 사이트맵에 새 글 주소와 이미지 6장 포함, RSS에 새 글 포함. 실제 사이트에는 반영하지 않음.
- 백업: `_backups/indoor-blog-copyright_20261007_113809/`(content/blog/ko, public/blog, CHANGELOG.md).
- 참고: 세로 사진이라 본문에서 가로 폭에 맞춰 크게 표시됨(약 736px 폭 → 높이 약 1,170px). 사진 크기를 줄이고 싶으면 `BlogPhoto`에 폭 제한 옵션을 추가하는 방법이 있음.

## 2026-10-07 — IndexNow 기준 주소를 www 없는 주소로 통일·보강

- 배경: 세 사이트 모두 www 없는 주소(apex)로 통일됨. firelic의 `automation/indexnow-submit.py` 기준 주소(`SITE_BASE`)와 `.env.example`이 이전 www 주소로 남아 있어 보정.
- 보강(3개 사이트 공통): 사이트맵에서 읽은 주소의 호스트가 기준 주소와 다르면(예: www 여부 차이) 호스트를 기준 주소로 맞춰서 전송. 경로·쿼리는 그대로 유지하며, 달라진 경우 로그에 한 번 안내. IndexNow는 키 파일과 같은 호스트의 주소만 받으므로, 배포 환경의 `NEXT_PUBLIC_SITE_URL` 값과 무관하게 항상 `https://exifnd.com` 기준으로 전송됨.
- 시험: 가짜 서버(사이트맵 주소 호스트 127.0.0.1 ↔ 기준 주소 localhost)로 3개 사이트 모두 전송 호스트·keyLocation·주소 목록이 기준 주소로 정규화되는 것을 확인. `py_compile` 통과. 실제 사이트·api.indexnow.org에는 전송하지 않음.
- 백업: `_backups/indexnow-host_20261007_100049/`.
- 영향: 발행 스크립트·키 파일·사이트 코드는 변경 없음. 10월 발행 일시중지 상태이므로 첫 실제 전송은 발행 재개 후.

## 2026-10-07 — IndexNow 적용 (Bing·Naver·Yandex 등에 새 글 즉시 알림)

- 배경: Bing 웹마스터도구에 3개 사이트와 사이트맵을 등록해 노출이 시작됨. IndexNow(https://www.indexnow.org)는 글이 추가·수정될 때 Bing·Naver·Yandex·Seznam·Yep·Amazon 등 참여 검색엔진에 주소를 직접 알려 주는 방식이며, 한 번 알리면 참여 엔진 전체에 공유됨(Google은 미참여 — 기존 사이트맵·서치 콘솔 경로는 그대로 유지).
- 키 파일: `public/7045aab749a7441cb4290cd16ba99435.txt` 추가(내용은 키 한 줄, 사이트 루트 `https://exifnd.com/7045aab749a7441cb4290cd16ba99435.txt`로 서비스). 키는 공개 값이며 사이트마다 다름. 언어 경로 처리(`proxy.ts`/`middleware.ts`)는 점(.)이 있는 경로를 처리 대상에서 제외하므로 영향 없음.
- 제출 스크립트: `automation/indexnow-submit.py` 신규(파이썬 표준 라이브러리만 사용). `--slugs <슬러그...>`로 새 가이드(전 언어) + 언어별 가이드 목록 페이지를 알리거나 `--urls <경로...>`로 임의 주소를 알림. 배포가 끝나 새 글이 사이트맵에 나타날 때까지 최대 20분 기다리고, 키 파일과 각 글 주소가 실제로 열리는지(200) 확인한 주소만 `https://api.indexnow.org/indexnow`로 전송. `--dry-run`(전송 없이 확인), `--detach`(백그라운드 분리) 지원. 기록: `~/Library/Logs/exiflens-indexnow.log`. 어떤 오류가 나도 발행 자체에는 영향 없음.
- 발행 연동: `automation/publish-guide.command`의 `git push` 성공 직후 `indexnow-submit.py --detach --slugs …`를 호출(guide-*-en.mdx 여러 건 반복 처리 구조 (하루 2건 대응)). push가 실패하면 호출하지 않음. 백그라운드로 완전히 분리되어 터미널 창은 기존처럼 자동으로 닫힘. 스크립트 자신은 삭제하지 않고 `git add -A`도 사용하지 않음(기존 동작 그대로).
- 검증: 가짜 서버(사이트맵·키 파일·접수 주소)로 시험 — 배포 대기 후 전송, `--dry-run` 비전송, 존재하지 않는 글은 전송 안 함·종료코드 1, 404 주소 제외, `--detach` 즉시 반환(19ms) 모두 통과. `bash -n`·`py_compile` 통과. 실서버 전송은 push·배포 후 첫 발행 때 처음 일어남.
- 운영 메모: IndexNow 공식 권고에 따라 "IndexNow 사용 시작 이후에 추가·수정·삭제된 주소"만 알림. 같은 주소를 하루에 여러 번 반복 전송하지 말 것(다시 보낼 때는 5분 이상 간격). 10월은 자동 발행 일시중지 상태라 첫 전송은 발행 재개 후.
- 되돌리려면: `public/7045aab749a7441cb4290cd16ba99435.txt`, `automation/indexnow-submit.py` 삭제 + `publish-guide.command`의 "IndexNow 알림" 블록 제거. 작업 전 백업: `_backups/indexnow_20261007_*/`.

## 2026-10-07 — 공유 미리보기(OG) 기본 이미지 추가 + /frame 설명 글·FAQ 보강

- 배경: 외부 SEO 점검 결과 참고 — (1) 가이드·블로그 외 페이지에 `og:image`가 없어 링크 공유 시 이미지 없이 글자만 보임, (2) 핵심 도구 페이지 /frame(EXIF 프레임 생성기)의 서버 렌더 본문이 약 260자로 설명 글이 없음. (llms.txt·본문 대 코드 비율은 효과가 확인되지 않아 제외.)
- OG 이미지: `public/og-default.png`(1200×630, 로고+ExifLens+한 줄 소개) 신규. `src/lib/seo.ts`에 `DEFAULT_OG_IMAGE(S)`/`DEFAULT_TWITTER_IMAGES` 추가. 페이지가 `openGraph`를 직접 지정하면 상위 레이아웃의 이미지가 상속되지 않는 것을 로컬에서 확인해, 레이아웃·about·faq·contact·disclosure·privacy·terms·frame·guides 목록·blog 목록(2종)·tools 허브·도구 페이지 17종·이미지 도구 공통 컴포넌트의 openGraph(있는 곳은 twitter도)에 `images`를 명시. 글 자체 이미지가 있는 가이드·블로그 글은 기존 이미지 유지, 대표 이미지 없는 가이드(crop-factor)만 기본 이미지로 대체.
- /frame: `Frame` 메시지(ko/en/ja/es)에 aboutTitle·aboutBody·sections(사용 방법/표시 정보와 테마/저장 전 확인)·related(가이드 3개)·faqTitle·faq(5개) 추가. `frame/page.tsx`에 기존 도구 페이지와 같은 구성(article + ToolSections + FAQ details + FAQPage JSON-LD) 추가. 본문 약 260자 → 2,100자 이상(ko). 설명은 실제 기능(테마·화면비 7종·PNG/JPG·브라우저 내 처리·HEIC/RAW 안내)만 기준으로 작성.
- 로컬 확인: tsc·eslint 통과, 18개 페이지 렌더에서 og:image/twitter:image 확인(가이드·블로그 글은 자기 이미지 유지), /frame 4개 언어 렌더·FAQPage 포함, `/og-default.png` 200.
- 되돌리려면: 변경된 page.tsx들·seo.ts·messages 4개의 이번 추가분과 `public/og-default.png` 제거.

## 2026-10-06 — 가이드 대표 이미지 설명(alt) 개선

- 신규 `content/guides/image-alt.json`: 가이드 대표 이미지 71장(고유 파일 70장 + six-frames 글의 6번 사진)에 대해 사진에 실제로 보이는 장면을 ko/en/ja/es로 작성(이미지 경로 → 언어별 설명). 이미지는 모두 직접 보고 작성.
- `src/lib/guides.ts`: `getGuideImageAlt(locale, image, fallback)` 추가. 설명이 있으면 사용, 없으면(새로 발행되는 글 등) 기존처럼 글 제목을 사용 → 자동 발행 파이프라인·글(mdx) 파일 변경 없음.
- 적용 위치: 가이드 상세 대표 이미지(`guides/[slug]/page.tsx`), 홈의 가이드 카드(`home-guide-highlights.tsx`).
- 로컬 확인: tsc·eslint 통과, 4개 언어 가이드 페이지와 홈에서 alt 반영 확인, frontmatter 이미지 전부 항목 존재(누락 0). 되돌리려면 위 세 파일 변경 원복(JSON은 두어도 무해).
- 자동 발행 확장: `automation/attach-guide-image.py`에 `update_image_alt` 추가 — 새 글의 Unsplash 사진을 받을 때 영어 설명(alt_description)을 `image-alt.json`에 `en`으로 저장(같은 경로의 이전 항목은 먼저 삭제, 실패해도 발행은 계속). ko/ja/es는 번역이 필요해 비워 두며 비면 글 제목을 대신 사용. `automation/publish-guide.command`가 이 JSON도 함께 `git add`(명시 경로, `-A` 아님).
- 개발자 도구: `src/lib/dev/guide-image-tool.ts`에서 대표 이미지를 교체/업로드하면 해당 슬러그의 이전 사진 설명 항목을 자동 삭제(같은 파일 경로에 새 사진이 들어가도 틀린 설명이 남지 않도록).
- 후속(미진행): 새 글의 ko/ja/es 설명은 Claude가 사진을 보고 채워야 함(자동 발행 재개 후 필요 시).

## 2026-10-06 — 사이트맵에 이미지 주소 추가(이미지 검색 색인 보조)

- `src/app/sitemap.ts`: 가이드·블로그 글 항목마다 화면에 실제로 나오는 이미지의 원본 파일 주소(`<image:loc>`)를 추가. 대표 이미지(frontmatter `image`) + 본문 마크다운 이미지 + 블로그 `<BlogPhoto src>`가 대상이며, /public에 파일이 실제로 있는 것만 포함. 최적화 주소(/_next/image)는 쓰지 않음.
- 로컬 확인: `sitemap.xml` 200 응답, 이미지 주소 총 309개(가이드 대표 이미지 70장×4개 언어, six-frames 글 사진 6장×4개 언어, 블로그 5장), 이미지가 없는 글(crop-factor 가이드 등)은 항목 없음. 페이지 화면에는 영향 없음.
- 되돌리려면 sitemap.ts 한 파일만 원복. 후속(미진행): 가이드 대표 이미지 alt 개선(이미지별 설명 JSON 방식).

## 2026-10-06 — 가이드 "리모컨 목차"(스크롤 고정 목차) 추가

- 신규 `src/components/guides/guide-floating-toc.tsx`: 넓은 화면(1280px~)에서는 본문 오른쪽 여백에 고정 패널, 좁은 화면에서는 오른쪽 아래 "☰ 목차" 버튼으로 펼침. 현재 읽는 소제목 강조, 480px 이상 스크롤 시 표시.
- `guides/[slug]/page.tsx`에 컴포넌트 1줄 추가. 기존 상단 펼침 목차와 본문(MDX)은 변경 없음, 288개 가이드 자동 적용.
- 리모컨 목차 항목 앞에 번호(1. 2. 3. …) 추가(상단 정적 목차의 번호와 일치).
- 두 줄로 넘어가는 항목의 둘째 줄이 첫 줄 글자 시작선과 맞도록 번호 칸 너비 고정(내어쓰기 정렬).
- 번역 키는 기존 `Guides.toc` 재사용(메시지 파일 변경 없음). 되돌리려면 위 두 파일 변경만 원복.

## 2026-10-06 — 가이드 페이지 상단에 소제목 목차 자동 생성(구글 섹션 바로가기 노출 대비)

- 배경: 구글 검색결과에서 글 아래에 뜨는 섹션 바로가기 버튼("점프 링크")을 ExifLens 가이드에도 띄우고 싶다는 요청. 조사 결과 가이드 소제목에는 이미 `id`가 있었으나 눈에 보이는 목차가 없었고(소제목 옆 앵커 링크는 아이콘뿐), 접이식·스크롤 변경 스크립트는 없었음. 구글은 이 링크를 운영자가 직접 켤 수 없고 자동으로 판단하므로 **노출은 보장되지 않음**(서치콘솔에 관련 지표 없음, 검색결과를 직접 보며 몇 주 지켜봐야 함).
- `src/lib/guides.ts`: 본문 H2 소제목을 수집하는 rehype 플러그인(`collectH2Headings`) 추가. rehype-slug 뒤·autolink 앞에 두어 id가 붙은 상태의 소제목 글자만 모으며, 본문 HTML은 바꾸지 않음. `compileGuide`가 `headings`를 함께 반환. H3(FAQ 질문 등)는 목차가 길어지므로 제외.
- `src/components/guides/guide-toc.tsx`(신규): 목차 컴포넌트. 접지 않고 항상 펼쳐 두며(구글 안내: 숨은 콘텐츠는 불리), 소제목이 2개 미만이면 표시하지 않음. 같은 페이지 `#앵커` 링크라 자바스크립트 불필요. 데스크톱 2열·모바일 1열.
- `src/app/[locale]/guides/[slug]/page.tsx`: 본문(`article`) 바로 위에 목차 삽입, 소제목에 `scroll-mt-6` 여백 추가.
- `messages/{ko,en,ja,es}.json`: `Guides.toc`("목차" / "Table of contents" / "目次" / "Índice") 추가. 일본어·스페인어는 번역 초안.
- 적용 범위: ExifLens만(FlyDroneMap·firelic은 결과를 본 뒤 "프로젝트 공통 작업" 대화방에서 결정). 가이드 288개(언어당 72개) 전체에 자동 적용되며 글 파일은 수정하지 않음 — 앞으로 자동 발행되는 가이드에도 저절로 적용.
- 검증: JSON 라운드트립 동일 확인 후 키 1개씩 추가, tsc·eslint 통과, 격리 복사본에서 `next build` 통과, 개발 서버로 가이드 288개 전수 검사(목차 링크 순서·id가 본문 H2와 일치, 소제목 2개 미만 글은 목차 없음) 288/288 통과, 4개 언어 화면 확인, 데스크톱·모바일 레이아웃 이미지 확인. 백업: `_backups/guide-toc_20261006_121850`.
- 후속 구상(미진행): 스크롤해도 따라다니는 리모컨형 고정 목차(같은 소제목 목록을 재사용 가능). 단, 구글이 읽는 상단 목차는 접지 않고 유지할 것.

## 2026-10-05 — 홈 검색 제목을 언어별로 분리 + 사이트맵에 빠져 있던 도구 7종 추가

- 배경: 네이버 웹마스터도구 점검에서 한국어 홈의 검색 결과용 제목이 영어("ExifLens — EXIF Viewer & ND Calculator")로 모든 언어에 고정되어 있어, "nd 필터 계산기" 같은 한국어 검색어가 제목에 보이지 않아 홈 노출 대비 클릭이 0인 것으로 판단. 구글 노출이 아직 거의 없는 시점이라 지금 바꾸는 것이 영향이 가장 적음.
- `messages/{ko,en,ja,es}.json`: `Home.metaTitle` 추가. ko "ExifLens — EXIF 뷰어 & ND 필터 계산기" / en 기존 제목 그대로 / ja "ExifLens — EXIFビューア & NDフィルター計算機" / es "ExifLens — Visor EXIF y calculadora de filtros ND". ja·es는 번역 초안(원어민 검수 전).
- `src/app/[locale]/layout.tsx`: 고정 영어 제목을 `t("metaTitle")`로 교체(title·og:title·twitter:title에 모두 반영). 다른 페이지의 `%s · ExifLens` 제목 형식은 변경 없음.
- `src/app/sitemap.ts`: 사이트맵에서 빠져 있던 공개 도구 7종(dof-hyperfocal-table, sunny-16-calculator, golden-hour-calculator, advanced-dof-diffraction-calculator, camera-fov-calculator, flash-guide-number-calculator, shutter-count-checker)을 `STATIC_PATHS`에 추가(언어 4개 × 7 = 28개 URL 추가, hreflang 포함). 숨김 이미지 도구는 계속 제외.
- 검증: JSON 라운드트립 동일 확인 후 병합, tsc·eslint·next build 통과, 운영 빌드에서 4개 언어 제목·og:title 확인, 사이트맵에 7종 × 4개 언어 포함·숨김 도구 0개·중복 URL 0개 확인. 백업: `_backups/title-sitemap_20261005_*`.
- 참고: 향후 새 도구를 공개할 때 `STATIC_PATHS`에 직접 추가해야 사이트맵에 들어감(이미지 도구만 자동 포함). 같은 누락이 재발하지 않도록 공개 시 함께 확인할 것.

## 2026-10-04 — 홈 사용법 설명 문구에 지정 위치 줄바꿈 적용

- 요청: 사용법 7단계 설명에서 사용자가 화면에 표시한 위치(지원하며, / 표시됩니다. / 있습니다. / 장노출 / 붙여 등)에서 줄을 바꿔 가독성 개선.
- `messages/{ko,en,ja,es}.json`: `Home.usageSteps[].body`에 줄바꿈 문자(`\n`)를 단계당 1곳씩 삽입(한국어는 지정 위치 그대로, 영·일·스페인어는 같은 의미 위치). 일본어·스페인어는 번역 초안 상태 유지.
- `src/components/home-usage-section.tsx`: 설명 문단에 `whitespace-pre-line` 적용(줄바꿈 문자만 줄바꿈으로 표시, 그 외 자동 줄바꿈은 그대로). 좁은 화면에서는 줄 수가 더 늘어날 수 있음.
- 검증: JSON 라운드트립 동일 확인 후 치환(각 치환 대상이 정확히 1회 일치하는지 확인), tsc·eslint 통과, 개발 서버에서 4개 언어 모두 줄바꿈 7곳과 스타일 적용 확인. 백업: `_backups/usage-linebreak_20261004_114252`.

## 2026-10-04 — 홈 화면 "ExifLens 사용법"을 4단계 → 7단계(제목+설명)로 보강

- 배경: 사용법 문구가 초기(업로드·EXIF·ND 계산기·프레임)에 작성된 그대로여서 이후 추가된 기능이 반영되지 않았고, 텍스트 분량도 적었음.
- `messages/{ko,en,ja,es}.json`: `Home.usageSteps`를 문자열 4개 → `{title, body}` 7개로 변경. 1 사진 올리기 / 2 EXIF 확인(촬영 날짜·시간 포함) / 3 촬영 위치 지도 보기 / 4 ND 필터 장노출 계산(기준값 자동 감지·스탑 직접 입력·타이머·장비 추천) / 5 촬영정보 프레임 / 6 공유 전 개인정보 보호(EXIF 제거 도구) / 7 더 많은 도구·가이드 활용. 일본어·스페인어는 번역 초안(원어민 검수 전).
- `src/components/home-usage-section.tsx`: 단계 출력을 제목(h3)+설명 구조로 변경하고, 목록 아래에 도구·가이드·FAQ 내부 링크 줄 추가(라벨은 `Header.toolsNav/guidesNav/faqNav` 재사용, 신규 키 없음). `usageSteps`는 이 컴포넌트에서만 사용되어 다른 화면 영향 없음.
- 숨김(hidden) 이미지 도구 5종의 이름은 사용법 문구에 넣지 않음(운영에서 숨김 도구 메시지가 제거되므로 언급 시 비공개 기능이 노출됨). 공개 상태인 이미지 압축만 "이미지 압축 도구"로 언급.
- 검증: 4개 언어 JSON 라운드트립 동일 확인 후 병합, tsc·eslint 통과, 개발 서버에서 ko/en/ja/es 모두 7단계 출력과 도구·가이드·FAQ 링크 확인. 백업: `_backups/usage-steps_20261004_112220`.

## 2026-10-03 — 홈 화면 "추출된 EXIF" 목록에 촬영 날짜·시간 행 추가

- `src/components/exif-panel.tsx`: "GPS 위치" 바로 아래에 촬영 날짜·시간 행 추가. 값은 기존 추출 결과(`ParsedExif.takenAt`, 형식 `2026-10-01 21:30:45`, JPG/PNG 등과 RAW 모두)를 그대로 사용하며 추출 로직은 변경 없음. 날짜 정보가 없거나 사진 업로드 전에는 다른 항목처럼 "—".
- `messages/{ko,en,ja,es}.json`: `Home.takenAtDateTime`("촬영 날짜·시간" / "Date & Time Taken" / "撮影日時" / "Fecha y hora de captura") 추가, `Home.exifEmpty` 안내 문구에 촬영 날짜·시간 추가.
- 검증: tsc·eslint·next build 통과. 백업: `_backups/exiflens_backup_*_exif_takenat_row`. 로컬 화면 확인 후 푸시(이미지 도구 6종 변경과 함께).

## 2026-10-03 — 이미지 자르기·회전 도구: 업로드 영역을 다른 도구와 같은 디자인으로 통일

- `src/components/image-tools/image-crop-rotate-card.tsx`: 일반 파일 선택 칸을 점선 사각형 박스 + "여기에 이미지를 끌어다 놓으세요" 문구 + "이미지 선택" 버튼으로 교체(모자이크·압축 등과 동일). 카드 전체가 드롭을 받고 드래그 중 테두리 강조. 여러 장을 놓으면 첫 번째 JPG/PNG/WebP만 사용, 이미지가 아니면 안내 문구, 편집 중 다른 사진을 놓으면 교체(자르기 영역 초기화). 사진 처리 로직은 변경 없음.
- `messages/{ko,en,ja,es}.json`: `ImageCropRotate`에 `dropLabel`·`dropHint`·`selectButton`·`errNotImage` 추가.
- 검증: tsc·eslint·next build 통과. 백업: `_backups/exiflens_backup_*_crop_dropzone`. 로컬 화면 확인 필요.

## 2026-10-03 — 이미지 모자이크 도구: 사진 끌어다 놓기(드래그 앤 드롭) 지원

- 증상: 모자이크 화면에 사진을 끌어다 놓으면 새 탭으로 사진이 열림. 원인: 사진 선택 부분이 일반 파일 선택 칸뿐이라 칸 밖·편집 화면 위에 놓으면 브라우저가 파일을 직접 열었음.
- `src/components/image-tools/image-mosaic-card.tsx`: 카드 전체가 드롭을 받도록 변경(드래그 중 테두리 강조). 점선 박스 + "이미지 선택" 버튼으로 다른 도구와 같은 모양으로 통일. 여러 장을 놓으면 첫 번째 JPG/PNG/WebP만 사용, 이미지가 아니면 안내 문구. 편집 중 다른 사진을 놓으면 새 사진으로 교체(그린 영역 초기화).
- `messages/{ko,en,ja,es}.json`: `ImageMosaic`에 `dropLabel`·`dropHint`·`selectButton`·`errNotImage` 추가. 사진 처리 로직은 변경 없음. 자르기·회전은 변경하지 않음.
- 검증: tsc·eslint·next build 통과. 백업: `_backups/exiflens_backup_*_mosaic_dropzone`. 로컬 화면 확인 필요.

## 2026-10-03 — 이미지 도구 6종에 개발자 전용 "이미지 관리" 패널·예시 사진 영역 추가

- `src/components/image-tools/image-tool-page.tsx`: 기존 계산기 도구와 같은 `ToolExampleImages`(설명 위 예시 사진 좌·우)와 개발 모드(`NODE_ENV=development`) 전용 `ToolImageDevPanel`("이미지 관리") 연결. 도구별 기본 검색어(`DEV_PANEL_QUERIES`) 지정. 사진이 없으면 아무것도 렌더링하지 않아 화면 변화 없음.
- `messages/{ko,en,ja,es}.json`: 6개 도구 네임스페이스에 `exampleLeftAlt`·`exampleRightAlt` 추가.
- 숨김(hidden) 도구도 개발 화면에서는 패널이 보여 공개 전에 사진을 미리 고를 수 있음. 사진은 `src/data/tool-images.json`·`public/tools/images`에 저장(푸시 시 해당 파일 포함 필요).
- 검증: tsc·eslint·next build 통과, 운영 빌드에서 압축 도구 200·숨김 도구 404, 패널·저장 API 관련 코드가 운영 페이지에 포함되지 않음. 백업: `_backups/exiflens_backup_*_image_tools_dev_panel`.

## 2026-10-03 — 이미지 편집·변환 도구 6종 추가 (1번만 공개, 나머지 숨김) + 도구 허브 "이미지 편집 · 변환 도구" 섹션

**배경**: 사진 전문 영역이 아닌 일반 사용자(직장인·학생)가 보고서·블로그용 이미지를 빠르게 손보는 기능을 추가해 (1) 타 사이트에서 제공하는 기본 기능 공백을 메우고 (2) 도구별 설명 텍스트를 늘리고 (3) 검색 진입점을 넓힘. 모든 처리는 브라우저(Canvas) 안에서 이루어지며 이미지는 서버로 전송되지 않음.

**도구 6종** (`/tools/<slug>`, 4개 언어): `image-compressor`(이미지 용량 줄이기 — 품질/목표 KB 이분 탐색, EXIF 제거·GPS만 제거·유지), `image-resizer`(크기 조절 — 최대 크기/비율/정확한 크기, 프리셋 8종), `image-converter`(형식 변환 — HEIC/WebP/PNG/GIF/BMP/AVIF → JPG/PNG/WebP, heic2any 동적 로드), `image-crop-rotate`(자르기·회전 — 비율 고정, 90도 회전, 좌우·상하 뒤집기), `image-watermark`(워터마크 — 글자/로고, 9방향+타일, 일괄 적용), `image-mosaic`(모자이크 — 모자이크/흐림/검은 가림, 수동 영역 지정).

**공개 상태**: `src/lib/tools-roster.ts`에 `IMAGE_TOOLS` 그룹과 `hidden` 상태를 추가. 현재 `image-compressor`만 `live`, 나머지 5종은 `hidden`. `hidden`은 허브·홈·FAQ·홈 FAQ·사이트맵에서 제외되고, 운영 환경에서는 주소로 직접 접속해도 404이며, 번역 메시지도 페이지 소스에 실리지 않음(`src/i18n/request.ts`가 운영 환경에서 hidden 도구의 네임스페이스·허브 항목을 제거). **공개 방법: `tools-roster.ts`에서 해당 도구의 `status`를 `"live"`로 한 줄 바꾸고 푸시** (사이트맵은 live 이미지 도구를 자동 포함).

**변경 파일**
- 신규: `src/lib/image-ops.ts`(디코딩·리사이즈·인코딩·목표 용량 탐색·JPEG EXIF 이식), `src/lib/watermark-render.ts`, `src/lib/mosaic-render.ts`, `src/components/image-tools/*`(batch-workbench, fields, 도구별 카드 6개, image-tool-page), `src/app/[locale]/tools/image-*/page.tsx` 6개.
- 수정: `src/lib/tools-roster.ts`, `src/app/[locale]/tools/page.tsx`(세 번째 섹션, 빈 섹션 미표시, 개발 환경에서만 hidden 카드에 "DEV ONLY" 표시), `src/app/[locale]/faq/page.tsx`, `src/components/home-faq-highlights.tsx`, `src/app/sitemap.ts`, `src/i18n/request.ts`, `messages/{ko,en,ja,es}.json`(`ImageTools` 공통 + 도구 6개 네임스페이스, `ToolsHub.imageSectionTitle`·도구 6개 이름/설명), `package.json`·`package-lock.json`(heic2any 0.0.4, MIT).
- 문구 변경(4개 언어): `ToolsHub.subtitle`, `Home.toolsHighlightsSubtitle` — "사진 업로드도 필요 없는 계산기" → "사진이 서버로 업로드되지 않고 브라우저에서 처리되는 무료 도구"로 정정(새 도구는 사진을 선택해 처리하므로 기존 문구가 부정확해짐).

**동작 메모**: EXIF 유지는 JPG→JPG만 가능(Orientation 1로 재설정, 내장 썸네일 제거, 픽셀 크기 태그 갱신). 기본값은 EXIF·GPS 모두 제거. 형식 변환·PNG·WebP는 항상 제거. 색은 sRGB로 저장. 한 번에 최대 20장·파일당 60MB. RAW는 미지원(FAQ에 명시).

**검증**: `tsc --noEmit`·eslint 통과, `next build` 성공. 빌드 후 `next start`: ko/en/ja `/tools/image-compressor` 200, hidden 5종 404, 사이트맵에 image-compressor만 포함, 허브·홈·FAQ·압축 페이지 소스에 hidden 도구 문구 0건. 이미지 처리 코드는 Chromium에서 별도 검증(EXIF 방향 적용, 150KB 목표 도달, GPS 제거/유지, 방향 1 재설정, 워터마크 위치·타일, 모자이크 영역 한정). 백업: `_backups/exiflens_backup_20261003_043610_image_tools_foundation`. 로컬(localhost) 화면 확인 후 푸시 예정.

## 2026-10-03 — 블로그 첫 글 추가: "야간 사진 촬영 빛 갈라짐 최적의 세팅 방법"

- `content/blog/ko/night-photography-light-starburst-settings.mdx` 신규 (한국어 전용, 운영자 경험 + EXIF 5건 + 등가 노출표 + 회절 설명 + FAQ).
- `public/blog/images/night-starburst-1~5.webp` 신규 (가로 1600px, 워터마크 유지, EXIF/GPS 미포함).
- 블로그 글이 생겨 /ko/blog 목록의 noindex가 해제되고 sitemap·RSS에 글이 포함됨. 로컬(localhost) 검증 완료 — 푸시 전.
- 2026-10-03 수정: 발행일 2026-10-01로 변경, EXIF 표 삭제 후 사진별 하단 캡션으로 전환, 사진 5장을 본문 중간(도입부·원리·노출표·팁 3번 뒤·팁 4번 뒤)에 분산 배치.
- 2026-10-03 추가 수정: 사진 5장에 프레임 생성기 "클래식 다크" 테마(여백 2%, 사이트와 동일 렌더러) 적용. 본문용 1600px(`night-starburst-N.webp`) + 클릭 시 열리는 큰 이미지 3328px(`night-starburst-N-full.webp`), EXIF·GPS 미포함(재인코딩). 사진 1~3은 촬영 일시 표시, 4~5는 EXIF 날짜 없어 미표시. 사진 클릭 시 새 탭 원본 보기 + 캡션 안내문, 글 끝에 프레임 생성기(/ko/frame) 안내 섹션 추가.
- 2026-10-03 목록·캡션 개선: (1) 사진 설명 5개를 EXIF 줄 + 안내 줄의 2줄 가운데 정렬로 변경. (2) 블로그 목록을 카드 4열 그리드(모바일 1 → sm 2 → lg 3 → xl 4, 컨테이너 max-w-7xl)로 변경하고 카드 상단에 썸네일 표시. (3) 프런트매터 `thumbnail` 필드 신설(목록 카드·og:image 전용, 글 상세 본문 상단에는 미표시), 첫 글 썸네일 = 정자 사진(프레임 없음, 1200×800 webp). (4) 12개 초과 시 하단 1, 2, 3 페이지 번호(`/ko/blog/page/N`, 1페이지는 `/ko/blog`; 글 12개 이하일 땐 번호·2페이지 주소 없음). 신규: `src/components/blog-list-view.tsx`, `src/app/[locale]/blog/page/[page]/page.tsx`, 번역키 `Blog.pageLabel/pagination`(4개 언어). 더미 글 13개로 페이지 나누기 검증 후 제거.
- 2026-10-03 캡션 간격 수정: MDX가 여러 줄 JSX 안의 줄을 각각 문단(<p>)으로 감싸 두 줄 사이가 크게 벌어지던 문제 → 한 줄 JSX(`<p className="text-center italic">{...}<br />{...}</p>`)로 바꿔 일반 본문과 같은 줄 간격으로 표시.
- 2026-10-03 사진 클릭 동작 변경: 클릭 시 프레임 없는 큰 사진(긴 변 3200px, 워터마크 유지, EXIF·GPS 미포함; 기존 `-full.webp` 파일 교체)을 사진 크기에 맞춘 팝업 창으로 열고, 팝업 안 사진을 다시 클릭(또는 Esc)하면 창이 닫힘. 팝업이 막히면 새 탭으로 폴백, 수정키/가운데 클릭은 브라우저 기본 동작. 신규: `src/components/blog-photo.tsx`(클라이언트 컴포넌트, MDX `<BlogPhoto …/>`), `public/blog/viewer.html`(noindex, `/blog/images/…` 경로만 허용). `blog.ts`의 Content 타입과 글 상세 페이지에 `components={{ BlogPhoto }}` 연결.

## 2026-10-02 — 블로그 영역(/ko/blog) 신설 + 상단 메뉴에 "블로그" 추가

**배경**: 롱테일·에버그린 주제를 다룰 공간이 없었음(가이드는 정보 전달 전용). 글은 운영자가 네이버 블로그 자동화 프로그램에서 얻은 주제와 실제 경험 메모(2~3줄)를 주면, 그 경험을 중심으로 보강해 작성하는 방식으로 운영. 한국어 전용으로 시작(대량 발행 회피 + 색인 대기열 부담 방지).

**변경 사항**
- `src/lib/blog.ts`(신규): `content/blog/ko/<slug>.mdx` 로더(메타/목록/관련 글/MDX 컴파일). 가이드와 동일하게 `singleTilde: false` 적용. `BLOG_LOCALES = ["ko"]` — 다른 언어를 추가하려면 여기와 해당 폴더만 늘리면 됨.
- `src/app/[locale]/blog/page.tsx`, `[slug]/page.tsx`(신규): 목록·상세. `/en|ja|es/blog…` 직접 접근은 `/ko/blog…`로 307 리디렉션(중복 URL·빈 목록 방지). hreflang 대체 주소 없음, canonical은 `/ko/...`. 글이 0개인 동안 목록 페이지는 `noindex`. 글 상세는 `BlogPosting` JSON-LD(작성자 Photographer SH), 공유 버튼, 관련 글, 가이드 링크, 도구 CTA 포함.
- `src/components/site-header.tsx`: 메뉴 순서 "소개 - 가이드 - FAQ - 블로그 - 도구 - 프레임 만들기 - 언어"(데스크톱·모바일). 모든 언어 화면에서 `/ko/blog`로 연결(라벨: 블로그 / Blog (KO) / ブログ(KO) / Blog (KO)). 메뉴가 늘어 sm~lg 구간에서 줄바꿈·넘침이 생겨 태그라인 표시를 `sm`→`lg`로 올리고 메뉴 간격을 `gap-3 lg:gap-4`로 조정.
- `src/components/language-switcher.tsx`: 블로그 화면에서 언어를 바꾸면 해당 언어 홈(`/`)으로 이동(그대로 두면 `/ko/blog`로 되돌아가 언어를 못 바꾸는 것처럼 보임).
- `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`: 블로그 글(한국어)을 포함. 글이 0개일 때는 사이트맵에 목록 페이지도 넣지 않음.
- `messages/{ko,en,ja,es}.json`: `Header.blogNav`, `Blog` 네임스페이스 추가.

**검증**: `tsc --noEmit`·eslint 통과, `next build` 성공(임시 distDir, 이후 원복). 로컬에서 임시 글로 확인 후 삭제: 목록·상세 200, 존재하지 않는 글 404, en/ja 직접 접근 307→/ko, canonical·BlogPosting 확인, hreflang 없음, `f/11~f/16` 취소선 변환 없음, 사이트맵·RSS 반영, 글 0개일 때 noindex·사이트맵 제외. 헤더는 640~1280px에서 4개 언어 모두 가로 넘침 없음 확인. 백업: `_backups/exiflens_backup_*_blog`.

**운영 메모**: 글은 `content/blog/ko/<slug>.mdx`(frontmatter: title, description, publishedAt, 선택 updatedAt·category·tags·image)로 추가. 첫 글을 올리면 목록 페이지 noindex와 사이트맵 제외가 자동 해제됨.

## 2026-10-02 — 홈 화면 "관련 도구"(FlyDroneMap 크로스링크) 하단 임시 이동

**변경 사항**
- `src/app/[locale]/page.tsx`: `CrossLinkFlyDroneMap`을 ND 계산기 섹션 직후에서 FAQ 하이라이트와 장비 추천 사이로 이동. 컴포넌트 내부는 변경 없음.
- **임시 조치**: 애드센스 승인 전까지의 조치이며, 승인 후 장비 추천과 함께 원래 위치(ND 계산기 섹션 직후, 장비 추천 → 크로스링크 순서, 광고 영역 앞)로 복구 예정. 복구 방법은 코드 주석에 기록.

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 홈 200, h2 순서(…FAQ → 장비 추천)와 flydronemap 링크가 FAQ와 장비 추천 사이에 위치함을 확인. 백업: `_backups/exiflens_backup_*_crosslink`.

## 2026-10-02 — 일본어·한국어 가이드 읽는 시간 계산 수정

**변경 사항**
- `src/lib/guides.ts` `estimateReadingMinutes(body, locale)`: 공백이 없는 일본어는 공백 기준 단어 수가 극단적으로 적게 잡혀 가이드 72편이 모두 "1분"으로 표시되던 문제 수정. ja·ko는 공백 제외 글자 수 ÷ 500(분당), en·es는 기존대로 단어 수 ÷ 200 유지.
- 결과 분포(가이드 72편): ja 1분 72편 → 3~8분, ko 2~5분 → 3~7분. en·es는 값 변화 없음.

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 가이드 상세·목록 200, ja 히스토그램 가이드 6분·초점 거리 가이드 5분 등 표시 확인, 홈 하이라이트의 ja/ko 표시도 정상. 백업: `_backups/exiflens_backup_*_reading_time`.

## 2026-10-02 — 가이드 작성자 표기(Photographer SH) + 보강한 가이드 12편 수정일 표시

**변경 사항**
- `src/app/[locale]/guides/[slug]/page.tsx`: 글머리에 "작성 Photographer SH(About 링크, `rel="author"`) · 게시일 · (수정일이 게시일과 다르면) 업데이트 날짜 · 읽는 시간" 표시. JSON-LD `Article.author`를 조직(ExifLens)에서 개인(`Person`: Photographer SH, About URL)으로 변경, `publisher`는 조직 유지.
- `messages/{ko,en,ja,es}.json` `Guides`에 `writtenBy`, `updatedOn`, `authorName` 추가(작성/Written by/執筆/Escrito por).
- 보강한 가이드 12편 × 4개 언어(48개 mdx)의 frontmatter에 `updatedAt: "2026-10-02"` 추가. 신규 글과 보강하지 않은 글은 수정일 없음.
- 참고: `sitemap.ts`, `rss.xml`이 `updatedAt`을 사용하므로 해당 12편의 lastmod/RSS 날짜도 2026-10-02로 반영됨.

**검증**: `tsc --noEmit` 통과. 로컬에서 보강 글(4개 언어)은 작성자+수정일 표시, 미보강 글은 수정일 없이 작성자만 표시, JSON-LD Person 확인, `<article>` 1개 유지. 백업: `_backups/exiflens_backup_*_byline`.

## 2026-10-02 — 홈 화면 제휴 상품(Gear Recommendations) 섹션을 최하단으로 임시 이동

**변경 사항**
- `src/app/[locale]/page.tsx`: `GearRecommendationSection`(쿠팡·알리 제휴)을 ND 계산기 다음 위치에서 페이지 맨 끝(FAQ 하이라이트 다음)으로 이동. 컴포넌트 내부는 변경 없음.
- **임시 조치**: 애드센스 승인 전까지의 조치이며, 승인 후 원래 위치(ND 계산기 섹션 직후, `CrossLinkFlyDroneMap` 앞)로 복구 예정. 복구 방법은 코드 주석에 기록.
- 도구 페이지의 제휴 섹션은 변경하지 않음.

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 홈 200, 영어 홈 h2 순서에서 Gear Recommendations가 마지막임을 확인. 백업: `_backups/exiflens_backup_*_gear_to_bottom`.

## 2026-10-02 — 도구 페이지 16종 설명 보강 + `<article>` 태그 적용

**변경 사항**
- 신규 서버 컴포넌트 `src/components/tools/tool-sections.tsx`(`ToolSections`): 도구 설명 아래에 섹션(h3)과 "함께 읽으면 좋은 가이드" 링크를 렌더링.
- 도구 16종 전체(DofCalculator, ExposureCalculator, TimelapseCalculator, AstroCalculator, BracketCalculator, DofHyperfocalTable, Sunny16Calculator, GoldenHourCalculator, AdvancedDofDiffractionCalculator, CameraFovCalculator, FlashGuideNumberCalculator, PrintResolutionCalculator, StorageCalculator, ExifRemover, CropFactorCalculator, ShutterCountChecker)에 `messages/{ko,en,ja,es}.json`의 `sections`(계산 원리 / 숫자 예시 / 사용 시점 / 유의점) 4개와 `related`(관련 가이드 3개 이하)를 추가. 도구당 4개 언어 모두 완성.
- 숫자 예시는 각 계산기의 실제 공식(`src/lib/*`)으로 Python·Node에서 재계산해 확인(골든아워는 `suncalc`로 인천·싱가포르·트롬쇠 시각 계산).
- 각 도구 페이지의 설명+FAQ 영역을 `<article>`로 감쌈. `LegalPage`(About/Contact/Privacy/Terms/Disclosure)는 제목+본문을 `<article>`로 감쌈(Contact의 하위 children은 article 밖). 홈/도구 목록/가이드 목록은 적용하지 않음(가이드 상세는 기존 `<article>` 유지).

**검증**: `tsc --noEmit` 통과. 로컬 dev에서 16개 도구×4개 언어 모두 200, `<article>` 1개, 섹션 h3 확인, 관련 가이드 링크 전부 200. 법적 페이지 5종×4개 언어 `<article>` 1개·h1 1개 확인, 홈·도구 목록·가이드 목록은 `<article>` 0개.
**백업**: `_backups/exiflens_backup_20261002_140243_tool_articles`. 푸시 전(라이브 사이트 미검증).

## 2026-10-02 — About 장비 표: Nikon ARCREST II 규격 확정, Canon BR-E1 추가

**변경 사항**
- Nikon ARCREST II 필터 행에 규격을 모델명 아래 보조 줄로 표기: 82mm 2개(2024년 9월 주문), 77mm 1개(2024년 10월 주문). 4개 언어.
- Canon BR-E1 블루투스 무선 리모컨(2024년 9월) 행 추가(스트랩·가방·거치 그룹). 장비 88행 → 89행.
- 컴온탑 렌즈 주문에 서비스로 증정된 82mm·77mm 필터는 장비 표에 넣지 않음(사용자 확인).

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 200, 장비 89행·보조 줄 반영 확인. 백업: `_backups/exiflens_backup_*_nikon_br`.

## 2026-10-02 — About 장비 표 다듬기(R7 렌즈킷 이동, 이전 장비 괄호 삭제, Sigma 30mm 시기 확정)

**변경 사항**
- Canon EOS R7의 렌즈킷 정보를 비고 칸 괄호에서 모델명 아래 보조 줄(`sub`)로 이동(4개 언어). `src/app/[locale]/about/page.tsx`에 선택 필드 `sub` 렌더링 추가.
- "거쳐 간 장비"의 괄호 내용 "(2024년 4월 판매)", "(친구에게 선물)" 삭제(4개 언어).
- Sigma 30mm F1.4 DC HSM | Art 구입 시기 2024년 → 2024년 3월(사용자 확인).

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 200, 표 12개·장비 88행, 보조 줄 1개, 삭제 대상 괄호 문구 0건. 백업: `_backups/exiflens_backup_*_gear_polish`.

## 2026-10-02 — About 스토리 구매 시기 보정 + 제목 문구 순화

**변경 사항**
- 스토리 제목(ko): "내가 사진을 시작하게 된 스토리" → "내가 사진을 시작하게 된 이야기"(en/ja/es 제목은 이미 자연스러워 유지).
- 구매 시기를 장비 목록 기준으로 보정(4개 언어): 2024년 4월 단계에서 제습함·heipi 삼각대·HOYA 82mm 킷을 제외하고, 단계명을 "2024년 5월~9월"로 변경해 5월(제습함·삼각대), 6월(RF24-70·HOYA 킷), 7월(Osmo Action 4), 9월(RF15-35, 두 번째 태국 여행 후 월말 RF70-200) 순으로 서술. 4월 단계는 R7·마운트 어댑터(컨트롤 링 어댑터 정식명)만 남김.
- 장비 표: Sigma 18-35mm F1.8 DC HSM | Art 구입 시기 2024년 → 2024년 3월(사용자 확인).

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 200, 표 12개·장비 88행, 스토리 기본 접힘 유지. 백업: `_backups/exiflens_backup_*_story_dates`.

## 2026-10-02 — About 스토리 접기/펼치기 + 장비 목록 보정(알리익스프레스 상세·G마켓·옥션)

**변경 사항**
- About "내가 사진을 시작하게 된 스토리"를 네이티브 `<details>`로 변경(기본 접힘, 펼치기/접기 라벨 4개 언어, JS 없음). 파일: `src/app/[locale]/about/page.tsx`, `messages/*.json`(story.expandLabel/collapseLabel).
- 장비 보정(78행 → 88행): Freewell 3종 확정(Air 3S 13팩 FW-A3S-PRO, Osmo Pocket 3 메가 14팩, Osmo Action 5 Pro/4/3 FW-OA5-MEGA; 2025년 3월), Ulanzi PK-08/PK-11 아리 로케이팅 베이스 미니 삼각대 키트 정식명 반영, Ulanzi 콜드슈 마운트 어댑터(CA22), DJI RC 목걸이 스트랩 2종, Canon LP-E6P(2025년 7월), Canon EW-60F 후드(2024년 4월), Schneider B+W 필터 2종(2025년 7월), SanDisk Extreme PRO SD 128GB(2025년 7월), Canon 컨트롤 링 마운트 어댑터 EF-EOS R 정식명, RF70-200mm 구입 시기 2024년 9월 확정.

**검증**: `tsc --noEmit` 통과, 로컬 4개 언어 200, 표 12개·장비 88행·details 1개(기본 접힘) 확인.

## 2026-10-02 — About 장비 표에 쿠팡 추가 구매 내역(2024년 3~6월) 반영

**변경 사항**
- 쿠팡 추가 구매 내역을 `messages/{en,ko,ja,es}.json` About.gear 표에 반영(가격 비공개). 장비 72행 → 78행.
- 신규 행: HOYA DIGITAL FILTER KIT 72mm·62mm(2024년 3월), Kenko AIR MC UV 72mm(2024년 3월)·55mm(2024년 4월), SIGMA USB DOCK for Canon(2024년 3월), SanDisk Extreme PRO SDXC UHS-I SDXXD 256GB(2024년 3월).
- 기존 행 보정: HOYA 82mm 킷 → 정식 제품명·2024년 6월, heipi 삼각대 → "heipi 3-in-1 Travel Tripod W28"·2024년 5월.

**검증**: `tsc --noEmit` 통과, 로컬 서버 4개 언어 모두 200, 표 12개·장비 78행 확인. 백업: `_backups/exiflens_backup_*_gear_additions3`.

## 2026-10-02 — About 장비 표에 알리익스프레스·쿠팡 구매 내역 추가

**변경 사항**
- 사용자가 전달한 알리익스프레스·쿠팡 구매 내역(2024년 7월~2025년 7월)을 `messages/{en,ko,ja,es}.json` About.gear 표에 추가(가격 비공개, 모델명·용도·구입 시기(월)만 표기). 장비 41행 → 72행, 표 10개 → 12개.
- 신규 그룹: 드론 액세서리(Sunnylife 6종, LiPo 안전 파우치), Osmo Pocket 3·액션캠 액세서리(12종). 기존 그룹에 추가: 필터→"필터·렌즈 액세서리"(Freewell 필터 세트, 렌즈 반사 방지 후드), 스트랩·가방·거치(Falcam F38 2종, PGYTECH 파우치), 편집·저장(Lexar/SanDisk/Novachips 카드 5종, SanDisk E81 SSD, Lexar USB-C 리더기).
- 기존 행 보정: Osmo Action 4 어드벤처 콤보 구입 시기 2024년 → 2024년 7월, DJI Air 3S "플라이 모어 콤보 + RC 2", Osmo Pocket 3 "크리에이터 콤보" 표기.

**제외·확인 필요**
- Freewell 2025년 3월 17일 주문(필터 세트 3종 이미지, 제품명 미표시), 번호키 자물쇠(카메라 장비 아님)는 제외. Ulanzi 2024년 10월 19일 주문, PGYTECH 2025년 3월 26일 주문은 제품명이 화면에 일부만 보여 보수적으로 표기. 브랜드 표기(벤토사, Novachips 등)는 화면 기준 추정.

**검증**
- `npx tsc --noEmit` 통과, 로컬(localhost:3115)에서 4개 언어 `/about` 200·표 12개·행 84개(헤더 12 + 장비 72) 확인. 라이브 사이트 미사용.
- 작업 전 백업: `_backups/exiflens_backup_20261002_045951_gear_additions2`

## 2026-10-02 — About 장비 표에 네이버 구매 내역 추가 (액세서리·조명·저장장치 등)

**변경 사항**
- 사용자가 전달한 네이버 구매 내역(2024년 3월~2025년 12월)을 `messages/{en,ko,ja,es}.json` About.gear 표에 추가. 가격은 공개하지 않고 모델명·용도·구입 시기(월)만 표기.
- 그룹 재구성: 기존 "액세서리"를 해체해 어댑터는 "어댑터로 쓰는 렌즈", HOYA 필터킷은 "필터", heipi 삼각대는 "스트랩·가방·거치", 제습함은 "배터리·관리"(모델 PLD-108L, 2024년 5월 확정)로 이동. 신규 그룹: 조명, 필터, 스트랩·가방·거치, 배터리·관리, 편집·저장, 보호 필름. 총 장비 17행 → 41행.
- 장비 사진은 사용하지 않고(타임라인 배치 불필요라는 사용자 방침) 표 텍스트만 추가.

**제외·확인 필요**
- 에브리데이 카르마카멧(방향제) 구매는 카메라 장비가 아니어서 제외.
- Nikon ARCREST II 필터(2024년 9월·10월 2건)의 구경·종류, 코엠스킨/Glint/Clever/PhotoClam 등 국산 브랜드의 영문 표기, Peak Design 2025년 7월 6개 구성의 내역은 구매 화면만으로 확정할 수 없어 보수적으로 표기.

**검증**
- `npx tsc --noEmit` 통과, 로컬(localhost:3114)에서 4개 언어 `/about` 200·표 10개·행 51개(헤더 10 + 장비 41) 확인. 라이브 사이트 미사용.
- 작업 전 백업: `_backups/exiflens_backup_20261002_045008_gear_additions`

## 2026-10-02 — About 사용 장비를 그룹별 표로 개선 (+구입 시기 열)

**변경 사항**
- `src/app/[locale]/about/page.tsx`: 사용 장비를 그룹(바디·RF 렌즈·어댑터 렌즈·영상/드론·액세서리)별 표(장비/용도/구입 시기)로 렌더링. 좁은 화면에서는 표 영역만 가로 스크롤, 행 헤더는 `th scope="row"`로 접근성 확보.
- `messages/{en,ko,ja,es}.json` About.gear: 항목별 `date`(구입 시기), `columns`(열 제목) 추가, 액세서리에 Canon Mount Adapter EF-EOS R 행 추가(2024년 4월). 월을 모르는 항목은 연도만 표기.
- 운영 방침: 사진 타임라인 배치는 하지 않음. 사용자가 구매 내역·제품 사진을 전달하면 모델명·구입 시기를 참고해 장비 표에 항목만 추가.

**검증**
- `npx tsc --noEmit` 통과, 로컬(localhost:3113)에서 4개 언어 `/about` 200·표 5개·행 22개(헤더 5 + 장비 17) 확인. 라이브 사이트 미사용.
- 작업 전 백업: `_backups/exiflens_backup_20261002_044345_gear_table`

## 2026-10-02 — About 페이지: "사진을 시작하게 된 스토리" + 사용 장비 섹션 추가

**배경**
- 운영자 신뢰도(E-E-A-T) 보강 2차. 사용자가 전달한 장비 변천사(2018 EOS 800D → 2025 EOS R5 Mark II)와 보유 장비를 About에 반영. 여행 정보는 사용자 요청에 따라 일자 없이 월까지만 표기.

**변경 사항**
- `messages/{en,ko,ja,es}.json` About: `story`(9단계 타임라인), `gear`(바디·RF 렌즈·어댑터 렌즈·영상/드론·액세서리·거쳐 간 장비) 추가. 장비명은 공식 표기로 정리, Sigma 18-35mm는 새 제품/30mm는 중고, R7(달·매크로·1.6배 크롭)과 R5 Mark II(풍경·인물·도심) 용도 구분 명시, 태국 한 달 살기 3회 반영.
- `src/app/[locale]/about/page.tsx`: 스토리 타임라인, 장비 목록, 크롭팩터 계산기 링크 렌더링. 문의 섹션은 맨 아래로 이동(갤러리 뒤).

**검증**
- `npx tsc --noEmit` 통과, 로컬(localhost:3112)에서 4개 언어 `/about` 200·장비/스토리/갤러리/링크 렌더링 확인. 라이브 사이트 미사용.
- 작업 전 백업: `_backups/exiflens_backup_20261002_043048_about_story_gear`
- 추후: 장비·여행 사진과 액세서리 추가 예정(사용자가 사진·구입 시기를 전달하면 반영).

## 2026-10-02 — 사진 1(바다 장노출) 설명 오류 수정: 해 질 녘 → 일출

**배경**
- 사용자 확인: About 갤러리 첫 사진과 사진 가이드의 첫 번째 사진은 해 질 녘이 아니라 일출 사진.

**변경 사항**
- `messages/{en,ko,ja,es}.json` About.gallery 첫 항목의 캡션·alt를 일출 기준으로 수정.
- `content/guides/{en,ko,ja,es}/six-frames-light-timing-and-composition.mdx`: description, 섹션 1 제목, 이미지 alt, 본문의 "dusk/해 질 녘/夕暮れ/anochecer"를 일출(sunrise/amanecer/日の出)로 수정하고 "해 주변 하늘이 아직 어두운 전경보다 훨씬 밝다"는 설명으로 맞춤.

**검증**
- 4개 언어 JSON 유효, 두 파일군에서 dusk/해 질 녘 계열 표현 잔여 0건, 물결표 0건.
- 작업 전 백업: `_backups/exiflens_backup_20261002_022415_sunrise_fix`

## 2026-10-02 — 애드센스 재거절 대응 3단계: About 페이지 운영자 소개 + 사진 갤러리

**배경**
- 재거절 원인 중 운영자 정보 부족(About 157단어, 운영자 신원/직접 제작 근거 없음)에 대한 조치. 사용자가 전달한 직접 촬영 사진 6장을 About의 운영자 소개용으로 사용(앞서 사진 가이드 글로 쓴 것은 용도 오해였으며, 해당 글은 사용자 확인 후 그대로 유지).

**변경 사항**
- `messages/{en,ko,ja,es}.json` About: 새 섹션 "ExifLens를 만드는 사진가"(Chronicle of Moments_SH, 현장 문제에서 도구가 출발했다는 설명) 추가, `About.gallery`(제목·소개·캡션·alt·가이드 링크 문구) 추가.
- `src/components/legal-page.tsx`: 선택적 `children` 렌더링 추가(기존 Privacy/Terms/Disclosure 동작 영향 없음).
- `src/app/[locale]/about/page.tsx`: 사진 6장 갤러리(반응형 1~2열, next/image)와 사진 가이드 링크 표시. 사진 파일은 기존 `public/guides/photos/` 재사용(추가 파일 없음).

**검증**
- `npx tsc --noEmit` 통과, 로컬(localhost:3111) 개발 서버에서 4개 언어 `/about` 모두 200, 사진 6장/이미지 최적화 엔드포인트 200/가이드 링크 확인. 라이브 사이트 미사용.
- 작업 전 백업: `_backups/exiflens_backup_20261002_021714_about_page`
- 알려진 사항: 운영자 소개 문구는 사용자가 확인한 사실(사진가, 워터마크 이름, 도구 제작 동기)만 사용. 이름·경력·SNS 등 추가 신원 정보는 미포함(필요 시 사용자 제공 후 추가).

## 2026-10-02 — 애드센스 재거절 대응 2단계: 얕은 가이드 12편 보강 + 직접 촬영 사진 가이드 신규

**배경**
- 재거절 원인 중 (2) 얕은 분량 글 다수, (3) 운영자 고유 콘텐츠(E-E-A-T) 부족에 대한 조치. 발행량은 유지하고 기존 글을 보강하는 방향(사용자 결정).

**변경 사항**
- 얕은 가이드 12편을 en/ko/ja/es 4개 언어 모두 보강(영문 기준 약 340~600단어 → 1,000~1,300단어): flash-guide-number-calculator-guide, free-nd-filter-calculator-alternative-to-shootcalc, camera-field-of-view-calculator-guide, golden-hour-calculator-guide, free-alternative-to-photopills-exposure-calculators, advanced-dof-diffraction-calculator-guide, portrait-photography-camera-settings, understanding-metering-modes, shutter-count-checker-guide, how-to-read-a-histogram, sunrise-sunset-photography-camera-settings, exif-remover-social-media-privacy. 각 글에 계산 예시·흔한 실수·한계·시나리오·체크리스트·FAQ 추가, frontmatter 변경 없음.
- 신규 가이드 `six-frames-light-timing-and-composition`(4개 언어): 운영자가 직접 촬영한 사진 6장(워터마크 Chronicle of Moments_SH)의 촬영 발상·기법 해설. 사진은 `public/guides/photos/`(webp 1600px)에 추가. 촬영 정보(EXIF)가 남아 있지 않아 설정값은 단정하지 않고 출발점 형태로 서술.

**검증**
- 변경 48개 + 신규 4개 MDX 모두 `@mdx-js/mdx` 컴파일 통과(singleTilde:false), 물결표(~) 잔여 0건(ja/ko 각 1곳 범위표기로 교체), frontmatter 원본과 동일, 내부 링크는 실제 존재하는 도구/가이드만 사용, `npx tsc --noEmit` 통과.
- 작업 전 백업: `_backups/exiflens_backup_20261002_013243_guide_enrich`
- 알려진 사항: 신규 가이드는 수동 추가분이라 발행 큐(guide-topics-queue.json)에는 없음.

## 2026-10-02 — 애드센스 재거절 대응 1단계: 도메인 표기 통일 (exiflens.com → exifnd.com)

**배경**
- 2026-10-02 09:21(KST) exifnd.com이 애드센스에서 "가치가 별로 없는 콘텐츠"로 두 번째 거절됨(첫 거절 9/3). 원인 점검 결과 (1) 실제 사용자 관심 부족(GSC 28일 클릭 4/노출 644, 9/18경부터 노출 급감), (2) 단기간 대량 발행(71편/약 40일)과 얕은 분량 글 다수(영문 700단어 미만 33편), (3) 운영자 정보 부족, (4) 개인정보처리방침 본문과 코드 기본값에 옛 도메인 `exiflens.com` 표기가 남아 실제 도메인과 불일치.

**변경 사항**
- `messages/{en,ko,ja,es}.json` Privacy 본문의 `exiflens.com` → `exifnd.com`
- `src/lib/seo.ts` `SITE_URL` 기본값(환경변수 미설정 시)의 `exiflens.com` → `exifnd.com`. 운영에서는 `NEXT_PUBLIC_SITE_URL`이 이미 exifnd.com으로 설정돼 사이트맵·canonical에는 영향 없음(사이트맵 직접 확인).

**검증**
- `npx tsc --noEmit` 통과, 4개 언어 JSON 유효성 확인, `exiflens.com` 잔여 0건.
- 작업 전 백업: `_backups/exiflens_backup_20261002_012346_adsense_fix`

**이후 작업(별도 진행)**: 얕은 가이드 보강, 사용자 직접 촬영 사진 기반 신규 글, 비영어권 언어 확장 검토.

## 2026-10-02 — 가이드 글 취소선 오표시 버그 수정 (물결표 `~` 범위 표기)

**배경**
- 사용자가 exifnd.com 가이드(`/ko/guides/night-cityscape-photography-settings`) 스크린샷에서 문장 중간이 취소선으로 표시되고 숫자가 붙어 보이는 것(예: "f/11f/16", "ISO 1003200")을 발견. 3개 사이트 전체 점검 요청.
- 원인: `src/lib/guides.ts`가 `remark-gfm`을 옵션 없이 사용 → 기본값 `singleTilde: true`라서 `~` 하나만 있어도 취소선 기호로 해석. 본문에서 범위를 "f/11~f/16", "15~20초"처럼 `~`로 쓰면 같은 문단의 `~` 두 개가 짝이 되어 그 사이가 통째로 취소선이 되고 `~` 문자도 화면에서 사라짐. 원문 단어는 삭제된 적 없음.
- 점검(실제 remark-gfm으로 전체 가이드 MDX 파싱): exiflens 33개 글(ko 24, ja 9) 63곳, firelic 18개 글(ko 17, ja 1) 25곳, flydronemap 14개 글 19곳(flydronemap은 9/28에 이미 같은 수정 적용). `~~` 취소선을 의도적으로 쓴 글은 0건. 상세는 프로젝트 문서 `claude/guide-strikethrough-tilde-bug-audit-2026-10-02.md`.

**변경 사항**
- `src/lib/guides.ts`: `remarkPlugins: [remarkGfm]` → `[[remarkGfm, { singleTilde: false }]]`. 이제 `~~`(더블 틸드)만 취소선으로 인식. 콘텐츠 파일은 수정하지 않음. 새로 발행되는 글(자동 발행 포함)에서도 재발하지 않음.

**검증**
- `npx tsc --noEmit`, `npx eslint src/lib/guides.ts` 통과.
- 실제 MDX→HTML 렌더링(@mdx-js/mdx, 프로젝트 의존성 그대로)으로 전체 284개 가이드 파일을 확인: `<del>` 0건, 화면에 보이는 `~` 개수가 원문과 모두 일치(영향 글에서 "f/11~f/16"처럼 정상 표시), 렌더 오류 0건.
- 이 환경에서는 브라우저 화면 확인은 못 함 → **배포 후 exifnd.com/ko/guides/night-cityscape-photography-settings 에서 취소선이 사라졌는지 확인 필요.**

## 2026-10-02 — 방문자 카운터 봇 판별 목록에 누락된 봇 추가

**배경**
- 3개 사이트에 봇 카운터를 공통 적용(flydronemap·firelic 이식)하면서 접속 정보(User-Agent) 시험을 해 보니, 접속 정보에 `bot` 문구가 없는 일부 크롤러·도구가 사람으로 집계될 수 있음을 확인함.

**변경 사항**
- `src/app/api/visitor-count/route.ts`: `BOT_UA_PATTERN`에 `Mediapartners-Google`(애드센스 크롤러), `Google-InspectionTool`(서치콘솔 URL 검사), `HeadlessChrome`, `Lighthouse`(PageSpeed), 다음 검색 로봇 `Daumoa`(및 `daum/숫자` 형식)를 추가. 나머지 로직·응답 형식은 변경 없음.
- 다음 앱 안에서 열린 페이지의 접속 정보에는 `DaumApps/<버전>`이 들어 있어 실제 사용자이므로, `daum` 단독 패턴은 넣지 않음(시험으로 DaumApps는 사람, Daumoa는 봇으로 분류됨을 확인).

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과. 사람 8종·봇 9종 접속 정보 단위 시험 전부 통과. 이전 집계 값은 소급해서 분리되지 않음.

## 2026-09-30 — 푸터 공유 메뉴를 위로 열기 + 가이드 "더보기" 펼침 상태 뒤로가기 유지

**배경**
- 실제 화면 확인 중 두 가지 문제가 발견됨: (1) 푸터의 공유하기 메뉴가 버튼 아래로 열려 페이지 하단이 늘어남, (2) 가이드 목록에서 "더보기"로 펼친 뒤 글을 보고 뒤로가기를 하면 펼침 상태가 초기화되어 닫힘 상태로 돌아옴.
- 원인: (1) 공유 메뉴가 버튼 아래(`mt-2`)로 고정되어 있었음. (2) 펼침 여부가 컴포넌트 내부 `useState`에만 있어 다른 페이지로 이동 후 복귀하면 새로 만들어지며 초기값(닫힘)으로 돌아감.

**변경 사항**
- `src/components/share-button.tsx`: `menuPlacement`("bottom"|"top", 기본 "bottom") 옵션 추가. "top"이면 메뉴가 버튼 위쪽(`bottom-full mb-2`)으로 열림. 기본값은 기존과 동일해 다른 위치의 공유 버튼(도구·가이드·규정 페이지)은 변화 없음.
- 푸터 컴포넌트: 홈 푸터의 공유 버튼에 `menuPlacement="top"` 적용.
- `src/components/guides/guide-category-section.tsx`: 카테고리별 펼침 상태를 `sessionStorage`(`guides-expanded:<카테고리명>`)에 저장하고, 화면이 그려지기 전(`useLayoutEffect`)에 복원. 주소(URL)는 바뀌지 않아 SEO 영향 없음. 탭을 닫으면 초기화. 저장소 접근 오류(비공개 모드 등)는 무시하고 닫힘 상태로 동작.

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과. 실제 Chromium 브라우저(Next 16.3.2, 최소 재현 앱)로 시험: 더보기 → 글 이동 → 뒤로가기 시 펼침 유지, 스크롤 위치 동일 복원, 새로고침 유지, 접은 상태 유지, 새 세션은 닫힘 시작, 대조군(기존 코드)은 뒤로가기 후 닫힘으로 재현됨. 푸터 메뉴는 위로 열릴 때 문서 높이가 늘어나지 않음을 확인.
- 로컬 dev 서버(3011)에서 `/ko`, `/ko/guides`, `/en/guides`, 도구 페이지 200 확인.

## 2026-09-30 — 로컬(개발 환경) 접속은 방문자 수·GA4에서 항상 제외

**배경**
- 운영자 본인의 접속이 방문자 수·GA4에 잡히면 실제 사용자 유입을 정확히 볼 수 없다는 요청. 3개 사이트의 로컬 `.env.local`이 실서버와 같은 Upstash Redis(방문자 수 저장소)를 가리키고, GA4 측정 ID도 로컬에서 그대로 쓰이므로 로컬 접속(`?dev=` 없이 여는 `npm run dev`)도 실제 집계에 반영될 수 있었음.
- 기존에는 `?dev=<DEV_EXCLUDE_TOKEN>`으로 받은 `dev_exclude` 쿠키가 있을 때만 제외했음. 로컬 개발 서버 실행 스크립트(`scripts/dev-open.mjs`)는 `?dev=` 없이 여는 구조였음.

**변경 사항**
- `src/app/api/visitor-count/route.ts`: `NODE_ENV === "development"`이거나 요청 호스트가 `localhost`/`127.0.0.1`/`[::1]`이면 쿠키와 관계없이 증가 없이 읽기만 수행. 기존 `dev_exclude` 쿠키 제외는 그대로 유지.
- `src/app/[locale]/layout.tsx`: GA4 `gtag('config')`를 `dev_exclude` 쿠키가 없고 호스트가 로컬이 아닐 때만 실행.
- 실서버 동작은 변경 없음(운영 환경은 개발 모드·로컬 호스트가 아님). 실서버 제외는 기존대로 각 도메인에서 `?dev=토큰` 접속으로 쿠키 발급(브라우저·기기별 1회, 유효 1년).
- Vercel 확인(읽기 전용, 값 미열람): 3개 프로젝트 모두 `DEV_EXCLUDE_TOKEN`이 Production·Preview에 등록되어 있음.

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과. 로컬 dev 서버 + 가짜 KV 서버로 확인: localhost·127.0.0.1·쿠키 요청 모두 `get`만 발생하고 `incr`/`expire` 0건. GA4 조건 문구가 렌더링된 페이지에 포함됨.

## 2026-09-30 — 공유하기 버튼 위치 조정 + 도구 페이지 16개 전체 확대 + 신규 도구 7개 예시 이미지 기능 추가

**배경**
- 사용자가 실제 배포 후 화면을 직접 확인하며 3가지 후속 수정을 요청: (1) 홈페이지 공유하기 버튼 위치를 상단에서 푸터로 이동, (2) 계산기 도구 페이지 16개 전체에 공유하기 버튼이 없는 문제 해결, (3) 최근에 추가된 도구 7개에 "개발자용 예시 이미지 관리" 기능이 빠져 있어 이미지를 추가할 수 없는 문제 해결.
- 각 항목을 코드로 먼저 확인(정확한 파일 목록·기존 패턴 조사)한 뒤 사용자에게 재확인 질문(특히 공용 푸터 컴포넌트 특성상 "홈페이지에만 노출 vs 전체 페이지 노출" 범위 확인)을 거쳐 승인("모두 그대로 진행해줘") 후 착수.

**변경 사항**
- `src/components/site-footer.tsx`: 클라이언트 컴포넌트로 전환, `usePathname()`으로 홈페이지(`/`) 여부를 판별해 홈페이지에서만 "문의하기" 링크와 RSS 아이콘 사이에 공유하기 버튼(`variant="ghost"`)을 노출. 다른 모든 페이지의 푸터는 기존과 동일.
- `src/app/[locale]/page.tsx`: 상단(부연설명 아래)에 있던 공유하기 버튼 제거(푸터로 이동했으므로 중복 제거).
- 도구 페이지 16개(`dof-calculator`, `golden-hour-calculator`, `shutter-count-checker` 등 사이트에 구현된 전체 계산기) 전부에 "이 계산기에 대해" 제목 옆(같은 줄 오른쪽)에 공유하기 버튼 신규 추가.
- 그중 최근에 추가되어 예시 이미지 기능이 없던 7개 도구(`advanced-dof-diffraction-calculator`, `camera-fov-calculator`, `dof-hyperfocal-table`, `flash-guide-number-calculator`, `golden-hour-calculator`, `shutter-count-checker`, `sunny-16-calculator`)에 기존 9개 도구와 동일한 방식으로 `ToolExampleImages`(예시 이미지 2장 표시) + `ToolImageDevPanel`(로컬 개발 서버 전용 이미지 검색/적용 도구)을 추가. 4개 언어(en/ko/ja/es) 메시지에 각 도구별 `exampleLeftAlt`/`exampleRightAlt` 신규 작성(총 56개 키).

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과.
- 로컬 dev 서버(port 3010)에서 홈페이지·도구 페이지 전체(신규 7개 포함) curl 스모크 테스트로 200 응답 확인. 홈페이지 푸터에는 공유하기 버튼이 노출되고, 도구 페이지(`dof-calculator` 등) 푸터에는 노출되지 않는 것을 응답 HTML로 직접 확인(의도한 "홈페이지 전용" 범위가 코드대로 동작함을 확인). 신규 7개 도구 페이지에서 "예시 이미지 관리 (DEV)" 버튼이 정상적으로 뜨는 것도 확인.

**남은 과제**
- 이번 작업(exifnd.com)에 이어 flydronemap.com / firelic.com 이식은 계획서(`claude/social-share-feature-plan.md`)에 따라 계속 다음 단계로 진행 예정.
- 신규 7개 도구는 예시 이미지가 아직 비어 있는 상태(코드는 준비됐지만 실제 사진은 미선택) — 사용자가 로컬 개발 서버에서 "예시 이미지 관리 (DEV)" 버튼으로 직접 선택해야 함(기존 9개 도구와 동일한 절차).

## 2026-09-30 — 사이트 공통 "공유하기" 기능 신규 추가 (exifnd.com 파일럿)

**배경**
- 3개 자매 사이트(ExifLens/exifnd.com, FlyDroneMap/flydronemap.com, firelic/firelic.com) 어디에도 공유하기 기능이 없어, 방문자가 좋은 콘텐츠를 발견해도 URL을 직접 복사하는 것 외에는 공유할 방법이 없었음(사용자 본인이 네이버 블로그에 가이드 글을 공유하려다 겪은 불편이 계기).
- `claude/social-share-feature-plan.md`에 작업 계획서를 먼저 작성해 범위(가이드/계산기/홈 전체)·채널(기기 공유, 링크 복사, X, Facebook, 카카오톡)·적용 순서(exifnd.com 파일럿 → 로컬 전체 채널 검증 → 배포 → 나머지 2개 사이트 이식)를 사용자에게 보고, 명시적 승인("진행해줘") 후 착수.

**변경 사항**
- `src/components/share-button.tsx` 신설 — 5개 채널(기기 공유/링크 복사/X/Facebook/카카오톡)을 지원하는 공용 공유 버튼+드롭다운 컴포넌트. 카카오 SDK는 방문자가 실제로 메뉴를 열 때만 지연 로드(페이지 로드 시 자동 로드 안 함), 이미지가 없는 페이지(홈/계산기)는 카카오 `feed` 대신 `text` 템플릿으로 자동 대체.
- 가이드 상세 페이지(`guides/[slug]/page.tsx`), 홈페이지(`page.tsx`)에 공유 버튼 배치.
- ND 계산기(`nd-calculator-card.tsx`)에 URL 상태 동기화 추가(노출시간/필터/커스텀 스톱 값을 쿼리 파라미터에 반영, 500ms 디바운스) — 홈페이지가 정적 생성에서 이탈하지 않도록 `useSearchParams()` 대신 마운트 시 `window.location.search`를 직접 읽는 방식 사용 — 계산 결과를 그대로 공유할 수 있도록 공유 버튼도 함께 배치.
- 4개 언어(en/ko/ja/es) 메시지에 `Share` 네임스페이스 신규 추가.
- `.env.example`에 `NEXT_PUBLIC_KAKAO_JS_KEY` 안내 추가(실제 키는 기존과 동일하게 `.env.local`에만 보관, git 추적 대상 아님).

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과.
- 로컬 dev 서버(port 3010) SSR 스모크 테스트로 가이드/홈/계산기 페이지 정상 응답 확인.
- 사용자가 실제 맥/브라우저에서 직접 클릭 테스트 — 진행 중 발견된 버그 2건 모두 수정 후 재확인 완료:
  1) 공유 버튼 클릭 시 자체 드롭다운 대신 macOS 기본 공유 패널이 뜨던 문제 → "기기로 공유"를 드롭다운 안의 선택 항목 하나로 이동.
  2) 카카오톡 공유가 "요청 실패(4019)"로 실패하던 문제 → 로컬 `.env.local`에 `NEXT_PUBLIC_SITE_URL=http://localhost:3010` 추가(기존에는 이 값이 없어 코드의 하드코딩된 플레이스홀더 도메인으로 카카오 링크가 생성되고 있었음) + 카카오 개발자 사이트 "JavaScript SDK 도메인"에 `localhost:3010` 등록.
- 사용자 최종 확인: "이제는 정상적으로 작동하고있어."

**남은 과제**
- flydronemap.com / firelic.com에 동일 컴포넌트/패턴 이식 예정(계획서 순서상 다음 단계). 사용자가 두 사이트의 로컬 개발 포트(3020/3030)도 이미 카카오 JavaScript SDK 도메인에 선제 등록해둔 상태.
- 홈/계산기 페이지에는 기본 og:image/twitter:image가 없어(가이드 페이지에만 존재), 해당 페이지의 카카오/Facebook 공유 시 링크 미리보기에 썸네일이 뜨지 않음(코드는 이미지 없을 때 텍스트형 템플릿으로 안전하게 대체하도록 처리됨) — 대표 이미지 추가 여부는 사용자와 별도 논의 필요.

## 2026-09-28 — 골든아워·블루아워 계산기 신규 추가 (SEO 갭 대응 5단계, 갭#5)

**배경**
- SEO 갭 대응 작업계획서(`claude/exiflens-seo-gap-risk-ordered-work-plan.md`) 5단계 착수. 이 단계는 위치·시간대 등 사진 도메인 밖의 외부 의존성이 필요해 계획서 안에서 가장 리스크가 높은 단계로 분류되어 있었음.
- 착수 전 `suncalc` 라이브러리의 라이선스(BSD-2-Clause, GitHub 저장소 LICENSE 파일 직접 확인)와 의존성(0개), 크기(unpacked ~51KB), 사용 중인 천문 공식(Jean Meeus, exiftool 조사 때와 동일하게 저장소 소스를 직접 읽어 확인)을 조사한 뒤 사용자에게 위험 평가와 함께 보고, 승인받고 진행.

**변경 사항**
- `suncalc@2.0.2`를 신규 의존성으로 추가.
- `src/lib/golden-hour.ts` 신설 — 태양 고도 각도 기준 아침/저녁 블루아워·골든아워 4개 구간을 계산하는 래퍼. 정의는 PhotoPills 등 경쟁 도구와 동일하게 dawn(-6°)~sunrise(-0.833°)=아침 블루아워, sunrise~goldenHourEnd(+6°)=아침 골든아워, goldenHour(+6°)~sunset=저녁 골든아워, sunset~dusk(-6°)=저녁 블루아워로 매핑. 극지방 백야/극야(alwaysUp/alwaysDown) 케이스도 안내 문구로 처리.
- `src/components/golden-hour-calculator-card.tsx` 신설 — 날짜 입력 + 위치 입력(브라우저 Geolocation API "내 위치 사용" 버튼 또는 위도/경도 직접 입력) UI. 계산은 전부 클라이언트에서 이루어지며 위치 정보를 서버로 전송하지 않음(ExifLens 기존 프라이버시 우선 아키텍처 그대로 유지).
- `/tools/golden-hour-calculator` 페이지 신설, `tools-roster.ts`에 라이브 도구로 등록.
- 4개 언어(en/ko/ja/es) 메시지 전체 신규 작성, "how to use" 가이드 아티클(갭#8)도 함께 발행 — 2단계(DoF Table/Sunny 16)에서 누락되었던 실수를 이번에는 반복하지 않음.
- 시간대(타임존) 관련 한계를 카드 안내 문구, 페이지 설명, 가이드 아티클, FAQ에 모두 일관되게 명시: 이 계산기는 별도의 시간대 데이터베이스 없이 계산된 시각을 브라우저(기기) 자체의 현재 시간대로 표시하므로, "내 위치 사용"으로 조회할 때는 정확하지만 다른 시간대의 좌표를 직접 입력해 조회하면 그 지역의 현지 시각이 아니라 기기 시간대 기준 시각이 표시됨.

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과.
- Node 스크립트로 `suncalc.getTimes()`를 인천 좌표(37.5385, 126.7378) 기준으로 직접 호출해, 계산된 일출·일몰 시각을 한국 표준시로 환산한 결과가 상식적으로 알려진 9월 말 인천 지역 일출·일몰 시각(대략 06:2x/18:2x) 범위와 부합함을 확인.
- 로컬 dev 서버(port 3010) + curl로 4개 언어 페이지가 모두 200 응답을 반환하고, `/tools` 허브 목록에 새 도구가 정상 노출되는 것을 확인.
- `npm audit` 결과 기존에 있던 취약점(next/sharp/js-yaml)과 무관하게 `suncalc` 자체는 의존성이 없어 신규 취약점을 추가하지 않음을 확인.

**남은 과제**
- 계획서 5단계는 완료되었으나, 4단계에서 보류된 셔터카운트 체커 관련 항목(갭#15, 소니/후지필름/올림푸스/파나소닉/펜탁스 확장)과 2단계 가이드 세트 소급 보완(갭#8), 6단계(외부활동) 항목은 여전히 미착수 상태.

## 2026-09-28 — 셔터카운트 체커: 지원 카메라 문구 정리 및 설명·FAQ 최신화

**배경**
- 사용자 요청: 지원 카메라 목록을 "브랜드 - 모델" 형식으로 나열하고, 캐논 미지원 모델 안내 문구를 추가해달라는 요청. 아울러 "셔터카운트란?" 설명과 FAQ가 니콘 전용 시절 문구 그대로 남아 있어 캐논 지원 이후 현재 상태와 맞지 않는다는 지적.
- 점검 중 기존 `supportCanon` 문구가 "EOS R5, EOS R6 모델만 지원"으로 되어 있어, 이미 구현된 EOS R6 Mark II/R8/R50이 누락된 오류를 추가로 발견.

**변경 사항**
- 지원 카메라 카드 문구를 "브랜드 - 모델" 형식으로 통일 (예: "캐논 - EOS R5, EOS R6, EOS R6 Mark II, EOS R8, EOS R50 (CR3 파일 전용)"). 이 과정에서 누락되어 있던 R6 Mark II/R8/R50을 문구에 반영.
- 지원 카메라 카드 하단에 "그 외 모든 캐논 모델(구형·신형 포함)은 아직 지원되지 않으며, 추가 예정입니다." 안내 문구를 새 항목(`supportCanonNote`)으로 추가.
- "셔터카운트란?"(`aboutBody`) 설명을 니콘 전용 서술("니콘 카메라의 경우...")에서, 니콘(MakerNote 내 미암호화 필드)과 캐논 EOS R5/R6/R6 Mark II/R8/R50(CR3 컨테이너 내 공개된 위치)을 함께 설명하도록 수정.
- FAQ 첫 번째 항목을 "왜 지금은 니콘만 지원하나요?" → "왜 지금은 니콘과 일부 캐논 기종만 지원하나요?"로 질문·답변 모두 갱신.
- FAQ "캐논 카메라도 지원하나요?" 답변을 EOS R5/R6 2개 기종 기준 문구에서 5개 기종(R5/R6/R6 Mark II/R8/R50) 기준으로 갱신.
- 4개 언어(en/ko/ja/es) `messages/*.json` 모두 동일하게 반영.

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과.
- 로컬 dev 서버(port 3010) + curl로 한국어 페이지의 지원 카메라 목록, 하단 안내 문구, 셔터카운트란 설명, FAQ 문구가 모두 의도한 대로 반영되었는지 직접 확인.

**남은 과제**
- `pageDescription`, `disclaimer` 문구는 이번 요청 범위에 포함되지 않아 그대로 두었으나, `disclaimer`는 여전히 "캐논 EOS R5/R6 지원은..."이라고만 표기되어 있어 R6 Mark II/R8/R50이 빠져 있음 — 추후 확인 필요.

## 2026-09-28 — 셔터카운트 체커: 캐논 EOS R6 Mark II/R8/R50 추가, 부연설명 문구 브랜드 중립화

**배경**
- 사용자 요청: "R6 Mark II 구현해줘. 부연설명 문구가 니콘 전용 기능으로 오해될 수 있으니 수정해줘."
- 사용자 소유 카메라가 캐논 EOS R5 Mark II라는 사실을 확인하는 과정에서, exiftool 최신(13.59, 로컬 설치본 12.76보다 최신) Canon.pm을 직접 조회.

**변경 사항**
- EOS R6 Mark II, EOS R8, EOS R50이 동일한 CameraInfo 오프셋(0x0D29, int32u)을 공유한다는 사실을 exiftool 공개 태그 정의에서 확인 후 매핑 테이블에 추가. R6 Mark II 하나만 요청받았지만 동일 근거로 R8/R50도 함께 지원됨.
- EOS R6 Mark II의 EXIF Model 태그 내부 실제 문자열은 마케팅명이 아닌 "R6m2"라는 점을 exiftool의 매칭 조건 그대로 반영.
- EOS R5 Mark II(사용자 보유 기종)는 이번에도 exiftool 최신 문서 기준으로 공개된 위치가 없음을 재확인 — 미지원 상태 유지.
- 도구 페이지 부연설명 및 `/tools` 허브 설명 문구(4개 언어)를 "니콘 전용 기능"으로 오인되지 않도록 브랜드 중립적 표현으로 수정.
- 가이드 문서(4개 언어) 지원 기종 목록을 5개 기종(R5/R6/R6 Mark II/R8/R50)으로 갱신.

**검증**
- `npx tsc --noEmit`, `npx eslint` 통과.
- 로컬 dev 서버 + curl로 4개 언어 도구 페이지의 수정된 부연설명, `/tools` 허브 설명, 가이드 문서 반영을 직접 확인.

**참고 — 사용자 보유 카메라**
- 석한님 카메라: 캐논 EOS R5 Mark II — 현재 셔터카운트 미지원(공개된 오프셋 없음). 향후 공개되는 대로 재확인 예정.
## 2026-09-28 — 셔터카운트 체커: 캐논 EOS R5/R6(CR3) 지원 추가 + 미작동 브랜드 심층 조사

**배경**
- 사용자 요청: "캐논은 구형은 기존처럼 안내, 신형은 구현 진행해줘. 미작동 브랜드에 대해 좀 더 깊은 조사를 진행해줘."
- 조사는 이번엔 exiftool.org의 HTML 문서를 웹 요약 도구로 훑는 대신, 실제 설치한 exiftool(Perl, 공개 GPL/Artistic 라이선스) 패키지의 태그 정의 파일을 직접 읽어 브랜드별 사실관계(태그 ID, 포맷, 모델 조건, 알려진 한계)를 확인하는 방식으로 진행 — exiftool의 파싱 알고리즘(코드)은 복사하지 않고, "이 브랜드는 이 필드를 이런 조건으로 저장한다"는 사실 정보만 참고해 별도로 새로 구현.

**캐논 신형(EOS R 계열, CR3) 구현**
- CR3는 TIFF가 아니라 ISO-BMFF(MP4와 같은 계열) 컨테이너 포맷임을 확인. `moov` 박스 하위의 `uuid` 박스(고정 확장 ID `85c0b687-820f-11e0-8111-f4ce462b6a48`) 안에 `CMT1`(=IFD0), `CMT2`(=ExifIFD), `CMT3`(=캐논 MakerNote), `CMT4`(=GPS) 박스가 순서대로 들어있고, 각 박스의 내용물 자체가 독립된 미니 TIFF 구조임을 exiftool 공개 태그 문서로 확인.
- exiftool 프로젝트의 공개 테스트용 CR3 샘플 파일(`CanonRaw.cr3`, EOS M50)로 박스 구조를 바이트 단위로 직접 파싱해 실측 검증: CMT1~CMT4 박스 위치가 정확히 일치하고, CMT3 payload가 유효한 `II*\0` TIFF 헤더로 시작하며 그 안의 IFD가 캐논 MakerNote의 표준 태그(SerialNumber 등 47개 태그)를 정상적으로 담고 있음을 확인 — 컨테이너 추출 메커니즘 자체는 실측으로 완전히 검증됨.
- 다만 캐논은 니콘과 달리 셔터카운트에 단일 공식이 없음 — 기종군마다 `CameraInfo`라는 이름의 불투명 바이너리 블록 안 서로 다른 바이트 위치에 저장되며, 그 위치는 기종별로 개별적으로 리버스엔지니어링되어 공개되어야만 알 수 있음. 현재 공개적으로 확인 가능한 위치는 **EOS R5, EOS R6 두 기종뿐**(공용 오프셋 0x0AF1, int32u)이며, R6 Mark II/R7/R10/R50/R3/R8/R1/R5 Mark II를 포함한 그 외 모든 신형 기종은 아직 위치가 공개되지 않은 상태.
- 이 오프셋 값 자체는 실제 R5/R6 촬영 파일이 없어 종단간(exiftool 결과값과의 대조) 검증은 하지 못했음 — 니콘 구현과 달리 이 부분만은 "공개 문서를 신뢰해 구현했으나 실측 대조는 못 함"이라는 한계가 있고, 이를 코드 주석·가이드 문서에 명시.
- 구형 CR2 DSLR 및 위 목록에 없는 신형 기종은 기존과 동일하게 "이 캐논 모델은 아직 지원되지 않습니다" 메시지로 처리(요청하신 대로 구형 안내 문구 유지).

**미작동 브랜드 심층 조사 결과**
- **소니**: `ShutterCount`/`ShutterCount2`/`ShutterCount3` 등 관련 태그 자체는 다수 존재하나, exiftool 문서에 "ILCE-7/7R/7S/7M2는 펌웨어 버전에 따라 오프셋이 바뀌어서 현재 디코딩하지 않는다"는 취지의 명시적 경고가 있을 만큼 모델·펌웨어별 변동이 심함. 구현 난이도가 높고, 만들더라도 신뢰도가 낮은 기종이 섞여 있어 신중한 접근이 필요.
- **후지필름**: `ImageCount` 태그가 있으나 X-T1 특정 펌웨어에서만 문서화되어 있고 "신형 펌웨어 설치 시 0으로 초기화될 수 있음"이라는 한계가 명시되어 있음 — 범용성이 낮은 단일 기종용 필드.
- **올림푸스, 파나소닉**: exiftool의 해당 브랜드 태그 정의 파일 전체를 검색해도 셔터카운트/이미지카운트에 해당하는 필드가 **단 하나도 없음** — 종전에 파악한 "기기 자체 숨김 메뉴에서만 확인 가능, 파일 메타데이터에는 기록되지 않는다"는 판단이 이번 조사로 재확인됨. 이 두 브랜드는 "아직 구현 안 함"이 아니라 "파일 분석 방식으로는 원천적으로 불가능"에 가까운 상태.
- **펜탁스**: 실제로 암호화되어 있음을 확인(니콘과 달리 이번엔 진짜 암호화). exiftool 문서상 복호화 공식은 `평문값 = 저장값 XOR 촬영일자 XOR (0xFFFFFFFF - 촬영시각)`로, 촬영일자/시각은 같은 MakerNote 안의 별도 평문 필드에서 얻음. 다만 이 공식은 exiftool 저자(Phil Harvey)가 직접 리버스엔지니어링해 공개한 것으로 표기되어 있어, 이번 조사에서는 이를 그대로 가져다 쓰기보다 다른 독립 오픈소스 구현으로 교차 확인하는 절차를 아직 거치지 못함 — 구현 여부를 결정하기 전에 이 교차 확인이 먼저 필요.

**변경 사항**
- `src/lib/shutter-count-checker.ts`: ISO-BMFF 박스 워커, 캐논 CR3 파싱 경로(`parseCanonCr3ShutterCount`), 모델별 오프셋 매핑 테이블(`CANON_CAMERA_INFO_SHUTTER_COUNT`, 현재 EOS R5/R6 1건) 추가. 업로드 accept 목록에 `.cr3` 추가.
- `src/components/shutter-count-checker-card.tsx`: 지원 브랜드 목록에 캐논 항목 추가.
- `messages/{en,ko,ja,es}.json`: 캐논 관련 FAQ 1건, 안내 문구, 업로드 힌트 갱신.
- `content/guides/{en,ko,ja,es}/shutter-count-checker-guide.mdx`: "왜 니콘부터" 섹션을 캐논 R5/R6 설명 포함하도록 확장.

**검증**
- `npx tsc --noEmit`, `npx eslint`(변경 파일 대상) 모두 통과.
- exiftool 공개 CR3 샘플로 컨테이너 파싱 성공 확인(모델명 "Canon EOS M50" 정상 추출, CameraInfo 태그 부재 시에도 크래시 없이 "미지원" 메시지로 정상 처리).
- 로컬 `npm run dev`(포트 3010) + `curl`로 4개 언어 도구 페이지, 가이드 페이지, `/faq` 페이지에서 신규 텍스트(캐논 FAQ, 지원 목록 3번째 항목) 노출 확인.
- **특이사항**: 최초 `device_commit_files` 호출이 "성공(written)"으로 보고되었으나 실제 기기에는 이전 버전 파일이 그대로 남아있던 문제를 발견 — 커밋 전 파일 내용을 직접 읽어 확인하는 절차를 통해 뒤늦게 발견하고 재커밋 후 재검증함. 이후 모든 중요 파일 쓰기는 커밋 직후 내용을 다시 읽어 확인하는 방식으로 진행.

**다음 단계**
- 소니/후지필름/펜탁스는 구현 여부를 결정하기 전 추가 검토가 필요(소니: 모델·펌웨어 변동성 감안한 축소 범위 결정, 펜탁스: XOR 공식의 독립 교차 확인). 올림푸스/파나소닉은 파일 메타데이터 방식으로는 지원이 어려운 것으로 잠정 결론.
## 2026-09-28 — 셔터카운트 체커 신규 추가, 니콘 우선 지원 (SEO 콘텐츠 갭 대응 4단계 2번, 이전 보류 항목 재검토 후 구현)

**배경**
- `claude/exiflens-seo-gap-analysis.md` 갭 #1/#15 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 4단계 항목. 직전 작업(플래시 계산기, 같은 날짜 커밋)에서는 "서버사이드 전환 또는 브랜드별 복호화 로직 신규 구현이 필요해 기존 아키텍처를 벗어난다"는 이유로 보류했었음.
- 사용자 요청으로 경쟁 사이트(shuttercount.app 등)의 실제 구현 방식을 재조사한 결과, 업계 표준은 100% 클라이언트 사이드(서버 업로드 없음) 방식이며 기존 ExifLens 아키텍처를 벗어날 필요가 없다는 것을 확인. 이전 "니콘 셔터카운트는 암호화되어 있다"는 판단도 부정확했음 — exiftool 공개 태그 문서 재확인 결과, 암호화되는 것은 셔터카운트 값을 키로 사용하는 다른 필드들이며, 셔터카운트 자체는 평문 32비트 정수로 저장되어 있음을 확인.
- 구현 착수 전 실측 검증: 현재 RAW 파싱에 쓰이는 `libraw-wasm`이 셔터카운트를 노출하는지 exiftool 프로젝트의 공개 테스트 샘플(Nikon.nef/CanonRaw.cr2/CanonRaw.cr3/FujiFilm.raf/Sony ARW)로 직접 확인 — 어떤 브랜드에서도 신뢰 가능한 셔터카운트 필드가 노출되지 않음을 확인. 따라서 기존 라이브러리(exifreader, libraw-wasm) 모두에 의존하지 않는 별도의 저수준 MakerNote 파서를 새로 작성하기로 결정.

**변경 사항**
- 신규 라이브러리 `src/lib/shutter-count-checker.ts`: 파일의 TIFF/Exif 바이트 구조를 직접 파싱해 니콘 MakerNote 내부의 ShutterCount(태그 0x00A7)를 읽어내는 클라이언트 사이드 파서. JPEG(APP1 Exif 세그먼트)와 NEF(TIFF 컨테이너) 양쪽 모두 지원.
- 니콘 MakerNote의 "내부 TIFF 헤더" 오프셋 규칙(제조사 시그니처 이후 10바이트 지점부터 시작하는 새 TIFF 헤더, 그 헤더 자신을 기준으로 한 상대 오프셋)은 exiftool.org 공개 태그 문서 및 MIT 라이선스 독립 오픈소스 구현(evanoberholster/imagemeta)으로 교차 확인 후 새로 구현 — exiftool 소스 코드를 참고하거나 복제하지 않음.
- 캐논/소니/후지필름/올림푸스/파나소닉/펜탁스는 이번 버전에서 미지원으로 정직하게 안내(카드 UI에 지원 브랜드 표시, 미지원 시 에러 없이 "아직 지원되지 않습니다" 메시지로 처리) — 확장 로드맵은 신규 가이드 문서에 안내.
- 신규 도구 페이지 `/tools/shutter-count-checker`, 신규 컴포넌트 `src/components/shutter-count-checker-card.tsx`.
- `src/lib/tools-roster.ts`에 `shutter-count-checker`를 `status: "live"`로 등록(POST_SHOOT_TOOLS).
- `messages/{en,ko,ja,es}.json`에 `ShutterCountChecker` 번역 네임스페이스 및 `ToolsHub.tools` 항목 추가.
- 갭 #8 규칙에 따라 신규 가이드 1편 × 4개 언어(`content/guides/{locale}/shutter-count-checker-guide.mdx`, 카테고리 "장비 & 액세서리") 추가 — 셔터카운트의 의미, 저장 위치(MakerNote), 니콘 우선 지원 이유, 중고 카메라 구매 시 활용법을 다룸.

**검증**
- 별도 조사 환경에서 exiftool 프로젝트의 공개 테스트 샘플(Nikon.nef, NikonD70.jpg)로 파서를 직접 실행해 `exiftool -ShutterCount` 값과 대조: 두 파일 모두 정확히 일치(3619, 526). 니콘 구형 기종(E775, MakerNote 구조가 다른 세대)과 캐논 CR2 파일도 함께 실행해, 미지원 케이스에서 크래시 없이 "미지원" 메시지로 정상적으로 처리되는 것을 확인.
- `npx tsc --noEmit`, `npx eslint`(신규 파일 대상) 모두 통과, 에러 없음.
- 로컬 `npm run dev`(포트 3010) + `curl`로 신규 도구 페이지(en/ko), 신규 가이드 페이지, `/tools` 허브, `/faq` 페이지 모두 200 OK 및 신규 텍스트 노출 확인.
- 작업 전 `src/lib`, `src/components`, `src/app/[locale]/tools`, `messages`, `content/guides`를 `_backups/backup_20260928_045943_shutter-count-checker/`에 백업.

**다음 단계**
- 4단계 항목1(셔터카운트 체커, 니콘) 완료. 셔터카운트 보조 콘텐츠(항목15)는 이번 가이드 1편으로 일부 충족 — 추가 콘텐츠 필요 여부는 다음 논의에서 결정. 5단계(골든아워/블루아워 계산기)는 여전히 보류 상태.

## 2026-09-28 — 플래시 가이드넘버 계산기 신규 추가 (SEO 콘텐츠 갭 대응 4단계 1번)

**배경**
- `claude/exiflens-seo-gap-analysis.md`의 갭 #6("Flash Sync Speed", "Studio Lighting" 가이드는 있으나 이를 뒷받침하는 계산기가 없는 콘텐츠-도구 불일치) 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 4단계(순서: 6→1→15) 첫 항목 실행.
- 착수 전 사용자에게 4단계 진행 방향 확인: 원래 계획서상 4단계는 플래시 계산기(항목 6) → 셔터카운트 체커(항목 1) → 셔터카운트 보조 콘텐츠(항목 15) 순이었으나, 셔터카운트 체커 항목을 먼저 조사한 결과 원래 갭 리포트의 전제("ExifLens EXIF 엔진 재사용 가능")가 실제로는 성립하지 않음을 확인(자세한 조사 내용은 아래 "셔터카운트 조사 결과" 참고). 사용자 결정에 따라 셔터카운트 항목은 일단 보류하고, 플래시 계산기만 먼저 진행.
- 플래시 가이드넘버 공식 자체는 위키피디아 등 공개 자료로 재검증: GN = 조리개값 × 거리(ISO 100 기준), ISO가 다르면 가이드넘버는 ISO 비율의 제곱근에 비례해 스케일링됨(예: ISO 200에서 약 41% 증가) — 외부 데이터 의존 없는 표준 공식으로 확인.

**변경 사항**
- 신규 도구 페이지 `/tools/flash-guide-number-calculator` 추가 — 플래시 매뉴얼에 적힌 가이드넘버(ISO 100 기준)와 촬영 ISO를 입력하면, 조리개값 기준 최대 도달 거리 또는 거리 기준 필요 조리개값을 계산.
- 신규 라이브러리 `src/lib/flash-guide-number-calculator.ts` 추가: `calculateGuideNumberAtIso()`(ISO 스케일링), `calculateApertureFromGuideNumber()`, `calculateDistanceFromGuideNumber()`, 미터/피트 단위 변환. 조리개값·ISO 프리셋 목록과 포맷 함수는 기존 `exposure-calculator.ts`의 `APERTURE_STOPS`/`ISO_STOPS`/`formatAperture`/`formatIso`를 그대로 재사용.
- 신규 컴포넌트: `src/components/flash-guide-number-calculator-card.tsx`.
- `src/lib/tools-roster.ts`에 `flash-guide-number-calculator`를 `status: "live"`로 등록.
- `messages/{en,ko,ja,es}.json`에 `FlashGuideNumberCalculator` 번역 네임스페이스 및 `ToolsHub.tools` 항목 추가.
- 갭 #8 규칙에 따라 신규 가이드 1편 × 4개 언어(`content/guides/{locale}/flash-guide-number-calculator-guide.mdx`) 추가, 기존 `flash-sync-speed-explained`/`studio-lighting-basics` 가이드와 상호 링크.

**검증**
- `npx tsc --noEmit`, `npx eslint`(신규/변경 파일 대상) 모두 통과, 에러 없음.
- 공식을 수기로 재계산해 대조: GN 30(m), ISO 100, f/8 기준 최대 도달 거리 3.75m(=30÷8) — 공식 수기 계산과 정확히 일치.
- 로컬 `npm run dev`(포트 3010) + `curl`로 4개 언어(en/ko/ja/es) × 신규 도구 페이지, 신규 가이드 페이지, `/tools` 허브, `/faq`, `/guides` 인덱스, 홈페이지 총 24개 경로 모두 200 OK 확인.
- `/tools` 허브에 신규 슬러그 노출, `/faq`에 신규 도구 FAQ 제목 집계, `/guides` 인덱스에 신규 가이드 노출을 각각 확인.
- dev 서버 로그의 에러는 기존에 알려진 외부 제휴 API(AliExpress/Coupang) 호출 실패뿐이며 신규 코드 관련 런타임 에러는 없음.
- 작업 전 `src/lib`, `src/components`, `src/app/[locale]/tools`, `messages`, `content/guides`를 `_backups/backup_20260928_041411_flash-guide-number-calculator/`에 백업.

**셔터카운트 조사 결과 (이번 작업 범위 밖, 기록용)**
- 현재 사용 중인 EXIF 라이브러리 `exifreader`(v4.44.0)는 메이커노트 중 Canon·Pentax만 파싱하며, 그마저도 셔터카운트/이미지카운트 필드 자체를 지원하지 않음(소스 코드 확인 완료). 대안 검토한 `exifr` 라이브러리도 동일하게 미지원.
- 외부 조사 결과: Nikon/Sony/Fujifilm/Pentax는 EXIF 메이커노트에 셔터카운트 값이 존재하나 최소 Nikon은 암호화되어 있어 시리얼 넘버 기반 복호화 알고리즘이 필요(ExifTool이 수년간 리버스엔지니어링해 유지보수 중인 영역, Perl로만 완전 구현되어 있고 지속적으로 기종별 예외가 추가됨). Canon·Olympus·Panasonic은 EXIF/RAW 파일 자체에 셔터카운트를 기록하지 않아 웹 업로드 방식으로는 원천적으로 지원 불가.
- 즉 이 기능은 (1) 서버사이드에서 ExifTool류 외부 바이너리를 호출하거나 (2) 일부 브랜드만 자체 복호화 로직을 새로 구현하는 두 갈래 중 하나가 필요하며, 둘 다 기존의 클라이언트사이드 완결형·프라이버시 지향 아키텍처에서 벗어나는 방향 전환임. 사용자와 상의 후 이번 4단계 범위에서는 보류하기로 결정.

**다음 단계**
- 4단계 1번(플래시 계산기) 완료. 셔터카운트 체커(항목 1)는 보류 상태 — 아키텍처 방향(서버사이드 도입 여부 등)에 대한 별도 논의 후 재검토 예정. 사용자 확인에 따라 5단계(골든아워/블루아워 계산기) 또는 6단계(외부활동)로 순서를 조정해 진행할 수 있음.

## 2026-09-28 — Camera Field of View(화각) 계산기 신규 추가 (SEO 콘텐츠 갭 대응 3단계 2번, 3단계 완료)

**배경**
- `claude/exiflens-seo-gap-analysis.md`의 갭 #7(Camera Field of View 계산기 부재) 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 3단계 6번 항목 실행.
- 착수 전 확인: 이전 작업(3단계 1번, CoC+회절 계산기) 진행 중 `crop-factor-calculator.ts`에 화각(수평/수직) 계산 함수(`calculateFovDegrees`, `formatFovDegrees`)가 이미 존재하고 `crop-factor-calculator-card.tsx`에서 부가 정보로 노출되고 있음을 미리 확인해둠 — 이번 항목은 계획서 예상보다 재사용 비중이 더 높은 순수 재사용 작업으로 확정.

**변경 사항**
- 신규 도구 페이지 `/tools/camera-fov-calculator` 추가 — 센서 크기(프리셋 + 직접 입력)와 초점거리를 입력하면 수평/수직/대각선 화각을 함께 표시. 계산 로직은 100% 재사용(`crop-factor-calculator.ts`의 `calculateFovDegrees`, `calculateDiagonalMm`, `formatFovDegrees`를 그대로 사용, 신규 계산 함수 추가 없음).
- 크롭팩터 계산기와의 검색 의도 차이(화각 자체가 목적 vs 크롭팩터/환산 초점거리 비교가 목적)를 유지하기 위해 대각선 화각과, 자주 쓰는 초점거리(14~300mm) 구간의 수평·수직·대각선 화각 비교 표를 추가해 카니벌라이제이션 없이 차별화.
- 신규 컴포넌트: `src/components/camera-fov-calculator-card.tsx`.
- `src/lib/tools-roster.ts`에 `camera-fov-calculator`를 `status: "live"`로 등록.
- `messages/{en,ko,ja,es}.json`에 `CameraFovCalculator` 번역 네임스페이스 및 `ToolsHub.tools` 항목 추가.
- 갭 #8(신규 도구마다 "how to use" 가이드 세트 발행) 규칙에 따라 신규 가이드 1편 × 4개 언어(`content/guides/{locale}/camera-field-of-view-calculator-guide.mdx`) 추가, 기존 `sensor-size-and-crop-factor-explained` 가이드 및 크롭팩터 계산기와 상호 링크.

**검증**
- `npx tsc --noEmit`, `npx eslint`(신규/변경 파일 대상) 모두 통과, 에러 없음.
- 공식을 수기로 재계산해 대조: APS-C(23.5×15.6mm)·50mm 기준 수평 화각 26.4°, 수직 화각 17.7°, 대각선 화각 31.5° — 삼각함수 공식 수기 계산과 정확히 일치. 비교표의 14mm 행(수평 80.0°)도 일치 확인.
- 로컬 `npm run dev`(포트 3010) + `curl`로 4개 언어(en/ko/ja/es) × 신규 도구 페이지, 신규 가이드 페이지, `/tools` 허브, `/faq`, `/guides` 인덱스, 홈페이지 총 24개 경로 모두 200 OK 확인.
- `/tools` 허브에 신규 슬러그 노출, `/faq`에 신규 도구 FAQ 제목 집계, `/guides` 인덱스에 신규 가이드 노출을 각각 확인.
- dev 서버 로그의 에러는 기존에 알려진 외부 제휴 API(AliExpress/Coupang) 호출 실패뿐이며 신규 코드 관련 런타임 에러는 없음.
- 작업 전 `src/lib`, `src/components`, `src/app/[locale]/tools`, `messages`, `content/guides`를 `_backups/backup_20260928_024013_camera-fov-calculator/`에 백업.

**3단계 완료 요약**
- 3단계(CoC+회절 계산기, Camera FOV 계산기) 두 항목 모두 완료. 두 항목 모두 신규 계산 로직 없이(회절 항목은 검증된 표준 공식만 추가) 기존 코드를 재사용하는 저위험 작업으로 마무리됨.

**다음 단계**
- 4단계(플래시 가이드넘버/플래시 노출 계산기, 셔터 카운트 체커, 셔터카운트 보조 콘텐츠)로 진행 예정 — 신규 독립 계산기 단계로, 특히 셔터 카운트 체커는 카메라 제조사별 메이커노트 파싱 편차가 있어 착수 전 리스크를 다시 짚어볼 필요.

## 2026-09-28 — 고급 심도 & 회절(CoC+Diffraction) 계산기 신규 추가 (SEO 콘텐츠 갭 대응 3단계 1번)

**배경**
- `claude/exiflens-seo-gap-analysis.md`의 갭 #3(PhotoPills "Advanced DoF" 계층에 해당하는 Circle of Confusion + Diffraction 계산기 부재) 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 3단계 5번 항목 실행.
- 착수 전 기존 코드 확인: `dof-calculator.ts`에 이미 회절 한계 계산 로직은 없었으나, 센서별 착란원(CoC) 값과 표준 심도 공식은 이미 검증되어 있어 그대로 재사용.
- 별도로 `crop-factor-calculator.ts`에 화각(FOV) 계산 로직이 이미 존재함을 확인 — 3단계 2번(Camera FOV 계산기) 착수 시 재사용도(리스크)가 계획서 예상보다 더 높다는 점을 미리 파악해둠(다음 항목에 적용 예정).

**변경 사항**
- `src/lib/dof-calculator.ts`에 회절 관련 함수 추가: `calculateAiryDiskDiameterMm()`, `calculateDiffractionLimitedAperture()`, `calculateDiffraction()`, `formatAperture()`, `formatMicrons()`. 레일리 기준 근사식(에어리 디스크 지름 ≈ 2.44 × 파장 × f값, 기준 파장 550nm — 대부분의 온라인 회절 계산기가 쓰는 표준 관례)을 사용해, 이미 있던 센서별 착란원 값으로 회절 한계 조리개값을 역산.
- 신규 도구 페이지 `/tools/advanced-dof-diffraction-calculator` 추가 — 회절 한계 조리개값·에어리 디스크 지름과, 선택한 조리개값·촬영 거리 기준 심도(하이퍼포컬/근접·원경 한계/전체 심도)를 함께 표시. 심도 계산은 기존 `calculateDof()`를 그대로 재사용.
- 신규 컴포넌트: `src/components/advanced-dof-diffraction-card.tsx`.
- `src/lib/tools-roster.ts`에 `advanced-dof-diffraction-calculator`를 `status: "live"`로 등록.
- `messages/{en,ko,ja,es}.json`에 `AdvancedDofDiffractionCalculator` 번역 네임스페이스 및 `ToolsHub.tools` 항목 추가.
- 갭 #8(신규 도구마다 "how to use" 가이드 세트 발행) 규칙에 따라 신규 가이드 1편 × 4개 언어(`content/guides/{locale}/advanced-dof-diffraction-calculator-guide.mdx`) 추가. 계산기가 사용하는 센서 크기 기반(착란원 기반) 회절 한계는 화소수를 반영하지 않는 경험칙이라는 점을 명시하고, 기존 화소 크기(픽셀 피치) 기반 가이드 `diffraction-and-optimal-aperture`와 상호 링크해 두 관점이 서로 모순되지 않고 보완적으로 읽히도록 함(사실관계 정확성 검증 차원).

**검증**
- `npx tsc --noEmit`, `npx eslint`(신규/변경 파일 대상) 모두 통과, 에러 없음.
- 공식 자체를 수기로 재계산해 대조: 풀프레임·50mm·f/2.8·촬영거리 5m 기준으로 회절 한계 f/22.4(레일리 근사식 계산과 일치), 에어리 디스크 지름 3.8µm, 하이퍼포컬 29.8m, 근접 한계 4.29m, 원경 한계 6.00m, 전체 심도 1.71m — 모두 공식 수기 계산과 정확히 일치함을 확인.
- 로컬 `npm run dev`(포트 3010) + `curl`로 4개 언어(en/ko/ja/es) × 신규 도구 페이지, 신규 가이드 페이지, `/tools` 허브, `/faq`, `/guides` 인덱스, 홈페이지 총 24개 경로 모두 200 OK 확인.
- `/tools` 허브에 신규 슬러그 노출, `/faq`에 신규 도구 FAQ 제목 집계, `/guides` 인덱스에 신규 가이드 노출을 각각 확인.
- dev 서버 로그의 에러는 기존에 알려진 외부 제휴 API(AliExpress/Coupang) 호출 실패뿐이며 신규 코드 관련 런타임 에러는 없음.
- 작업 전 `src/lib`, `src/components`, `src/app/[locale]/tools`, `messages`, `content/guides`를 `_backups/backup_20260928_023013_advanced-dof-diffraction/`에 백업.

**참고 사항**
- 2단계(DoF Table/Hyperfocal Table, Sunny 16 계산기)에서는 공통 규칙(갭 #8, 신규 도구마다 가이드 세트 발행)이 누락되었음을 이번에 재확인 — 추후 여유가 될 때 두 도구용 "how to use" 가이드를 소급 보완하는 것을 검토 권장(이번 작업의 범위에는 포함하지 않음).

**다음 단계**
- 3단계 1번(CoC+회절 계산기) 완료. 3단계 2번(Camera FOV 계산기)으로 진행 예정 — 기존 `crop-factor-calculator.ts`의 화각 계산 로직을 재사용하는 방식으로 착수.

## 2026-09-28 — DoF/하이퍼포컬 표 페이지 & 써니 16 계산기 신규 추가 (SEO 콘텐츠 갭 대응 2단계)

**배경**
- `claude/exiflens-seo-gap-analysis.md`의 갭 #4(하이퍼포컬/심도 "표" 형태 페이지 부재) 및 갭 #2(써니 16 계산기 부재), `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 2단계 실행.
- 두 도구 모두 기존 라이브러리 함수를 그대로 재사용하는 "재사용 로직" 단계로 분류되어 신규 공식/신규 계산 로직 추가 없이 진행.

**변경 사항**
- 신규 도구 페이지 2개 추가:
  - `/tools/dof-hyperfocal-table` — 기존 `src/lib/dof-calculator.ts`의 `calculateDof()`를 그대로 재사용. 모든 표준 조리개값(f/1.4~f/22)에 대한 하이퍼포컬 디스턴스 표와, 여러 촬영 거리(0.5m~100m)에 대한 근접/원경 초점 한계·전체 심도 표를 함께 제공. 하이퍼포컬 디스턴스는 촬영 거리와 무관하다는 공식 특성을 활용해 임의의 placeholder 거리값으로 계산.
  - `/tools/sunny-16-calculator` — 기존 `src/lib/exposure-calculator.ts`의 `calculateExposureCompensation()`을 2단계 스톱 변환(조리개→ISO 순)으로 재사용. 표준 "써니 16 룰"과 그 변형(써니 11/8/5.6/4, 각각 약간 흐림/흐림/매우 흐림/그늘·일몰 조건)을 프리셋으로 제공하고, 사용자가 선택한 ISO·조리개에 맞춰 추천 셔터스피드를 계산.
  - 신규 컴포넌트: `src/components/dof-hyperfocal-table-card.tsx`, `src/components/sunny16-calculator-card.tsx`.
  - 신규 페이지: `src/app/[locale]/tools/dof-hyperfocal-table/page.tsx`, `src/app/[locale]/tools/sunny-16-calculator/page.tsx` — 기존 도구 페이지와 동일한 패턴(canonical/hreflang 메타데이터, breadcrumb·WebApplication·FAQPage JSON-LD, 안내/면책 섹션, FAQ 아코디언, `generateStaticParams()`). 예시 이미지(`ToolExampleImages`)는 신규 이미지 에셋이 필요해 이번엔 의도적으로 제외.
  - `src/lib/tools-roster.ts`의 `FIELD_TOOLS`에 두 도구를 `status: "live"`로 등록 → `/tools` 허브, 홈페이지 도구 하이라이트, `/faq` 페이지 FAQ 집계에 자동 반영.
  - `messages/{en,ko,ja,es}.json`에 `DofHyperfocalTable`, `Sunny16Calculator` 번역 네임스페이스 및 `ToolsHub.tools` 항목 추가.

**검증**
- `npx tsc --noEmit`, `npx eslint`(신규/변경 파일 대상) 모두 통과, 에러 없음.
- 로컬 `npm run dev`(포트 3010) + `curl`로 4개 언어(en/ko/ja/es) × 신규 페이지 2개, `/tools` 허브, `/faq`, 홈페이지 총 20개 경로 모두 200 OK 확인.
- `/tools` 허브에 두 신규 슬러그(`dof-hyperfocal-table`, `sunny-16-calculator`) 노출 확인, `/faq` 페이지에 두 도구의 FAQ 제목이 집계되어 노출됨을 확인, 홈페이지 도구 하이라이트에도 두 도구가 포함됨을 확인.
- dev 서버 로그의 에러는 기존에 알려진 것과 동일한 외부 제휴 API 호출 실패(AliExpress/Coupang, 샌드박스 네트워크 제한에 의한 것으로 이번 작업과 무관)뿐이며, 신규 코드 관련 런타임 에러는 없음.
- 작업 전 `src/lib`, `src/components`, `src/app/[locale]/tools`, `messages`를 `_backups/backup_20260928_021218_dof-table-sunny16-calculators/`에 백업.

**다음 단계**
- 2단계 완료. 3단계(CoC+회절 계산기, Camera FOV 계산기)로 진행 예정.

## 2026-09-28 — "무료 대안" 비교 콘텐츠 2편 신규 추가 (SEO 콘텐츠 갭 대응 1단계 2번, 경쟁사명 직접 언급)

**배경**
- `claude/exiflens-seo-gap-analysis.md`의 갭 #10("무료 대안" 비교 콘텐츠 신설) 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md` 1단계 2번 항목 실행.
- 진행 전 사용자와 "경쟁사명을 제목에 직접 노출할지" 여부를 논의: 상표의 지시적 공정사용(nominative fair use)에 해당해 법적 문제는 크지 않으나, (1) 로고/스크린샷 미사용, (2) 제휴 관계 오인 방지 문구 명시, (3) 검증 안 된 가격·폄하성 주장 배제, (4) 정보의 시점 명시라는 안전장치를 전제로 사용자가 "경쟁사명 직접 노출" 방식으로 승인.

**변경 사항**
- 신규 가이드 2편 × 4개 언어(en/ko/ja/es) = 총 8개 MDX 파일 추가(`content/guides/{locale}/`):
  - `free-alternative-to-photopills-exposure-calculators` — PhotoPills(유료 모바일 앱)와 ExifLens 무료 웹 계산기가 겹치는 부분(심도/노출삼각형/하이퍼포컬/브라케팅/아스트로 NPF/타임랩스)과, ExifLens가 다루지 않는 PhotoPills 고유 영역(AR 플래닝, 지도 기반 계획, Advanced DoF 등)을 사실 기반으로 대등하게 서술.
  - `free-nd-filter-calculator-alternative-to-shootcalc` — ShootCalc.com(소형 무료 웹 ND 계산기)과 ExifLens ND 계산기의 기능(순방향/역방향, 필터 스태킹)이 동일함을 인정하고, ShootCalc에만 있는 셔터카운트체커 등 차이점도 숨기지 않고 명시.
  - 두 가이드 모두 본문 상단에 "안내 사항(Disclosure)" 섹션을 넣어 (a) 언급된 경쟁 서비스는 별도 회사 제품이며 ExifLens와 제휴·후원 관계가 없다는 점, (b) 상표는 각 소유자에게 귀속된다는 점, (c) 언급된 가격·기능 정보는 작성 시점(2026년 9월) 기준이며 변경될 수 있으니 공식 사이트에서 재확인을 권한다는 점을 명시.
  - 콘텐츠 전체에서 경쟁사에 대한 근거 없는 폄하 표현 없이, ExifLens가 못 하는 부분(PhotoPills의 AR 플래닝, ShootCalc의 셔터카운트체커)도 그대로 인정하는 대등한 비교 톤으로 작성 — 객관적 사실 비교만 다룸.
  - 로고·스크린샷 등 경쟁사 저작물은 전혀 사용하지 않고 텍스트 언급만 포함.
  - `category`는 새 카테고리("Tools & Alternatives" / "도구 비교/대안" / "ツール比較・代替" / "Herramientas y alternativas")로 신설 — 기존 가이드 카테고리와 겹치지 않도록 구분.

**검증**
- 로컬 `npm run dev`(포트 3010) + `curl`로 8개 신규 가이드 페이지(4개 언어 × 2편) 및 `/guides` 인덱스 페이지(4개 언어) 모두 200 OK 확인, dev 서버 로그에 런타임 에러 없음.
- 코드(.ts/.tsx) 변경 없는 콘텐츠 전용 작업이라 tsc/eslint/build 전체 실행은 생략, dev 서버 렌더링 확인으로 회귀 여부 검증.
- 작업 전 `content/guides/` 전체를 `_backups/backup_20260928_020618_free-alternative-guides/`에 백업.

**리스크 및 후속 확인 필요 사항**
- 이 콘텐츠는 경쟁사명을 직접 언급하는 콘텐츠이므로, 배포 후 애드센스 정책 위반 신고나 경쟁사 측 이의 제기가 없는지 주기적으로 확인 권장.
- 여기 언급된 PhotoPills/ShootCalc의 가격·기능 정보는 시점 기준(2026년 9월)이라 추후 실제와 달라질 수 있음 — 분기 단위로 사실관계 재검토 권장.

**다음 단계**
- 1단계 완료. 2단계(DoF Table/Hyperfocal Table 페이지 분리, Sunny 16 계산기)로 진행 예정.

## 2026-09-28 — 매크로 사진 심화 가이드 2편 신규 추가 (SEO 콘텐츠 갭 대응 1단계)

**배경**
- `claude/exiflens-seo-gap-analysis.md`(경쟁사 역산 SEO 갭 분석) 및 `claude/exiflens-seo-gap-risk-ordered-work-plan.md`(리스크 낮은 순 작업계획서)의 1단계 1번 항목 실행.
- 경쟁 사이트(PhotoPills 등)는 매크로 전용 심화 계산기/콘텐츠를 별도로 갖출 만큼 세분화된 니치인데, ExifLens는 매크로 기초(`macro-photography-basics`)와 포커스 스태킹(`focus-stacking-for-macro-photography`) 가이드만 있고 광학 심화(회절/심도) 콘텐츠가 얕다는 갭을 보완.
- 사전에 발견한 사실: ExifLens에는 이미 매일 자동으로 새 가이드를 발행하는 예약 작업 시스템(`automation/guide-topics-queue.json` + `publish-guide.command`)이 별도로 존재하며, 130개 주제가 큐에 등록돼 있음(대기 순번이 많이 밀려 있음). 이번 2개 주제는 그 자동 발행 큐를 거치지 않고, 사용자 승인에 따라 지금 바로 수동으로 4개 언어 MDX를 작성해 즉시 반영하는 방식으로 진행함 — 자동화 큐와는 별개 경로이므로, 추후 큐에 동일/유사 주제가 추가되지 않도록 주의 필요.

**변경 사항**
- 신규 가이드 2편 × 4개 언어(en/ko/ja/es) = 총 8개 MDX 파일 추가(`content/guides/{locale}/`):
  - `macro-photography-diffraction-explained` — 배율이 올라갈수록 유효 조리개(effective aperture = 표시 f값 × (1+배율))가 커져, 매크로 촬영에서는 일반 촬영 거리보다 회절 한계가 2~3스톱 일찍 찾아온다는 내용. 기존 `diffraction-and-optimal-aperture`, `focus-stacking-for-macro-photography` 가이드와 상호 링크.
  - `macro-depth-of-field-vs-standard-dof` — 표준 심도 공식(하이퍼포컬 기반)은 촬영거리≫초점거리를 전제하는데, 1:1 근접 배율에서는 이 전제가 깨져 심도가 거리 대신 배율·조리개에 좌우되고, 앞/뒤 심도 비율도 3:7에서 거의 5:5로 뒤바뀐다는 내용. 기존 `understanding-depth-of-field`, `macro-photography-basics`, `macro-photography-diffraction-explained` 가이드와 상호 링크.
  - 두 가이드 모두 `category` 필드는 로케일별 기존 매크로 가이드와 동일한 문자열로 맞춤(en: "Photography Genres", ko: "장르별 촬영 가이드", ja: "ジャンル別撮影ガイド", es: "Guías por género fotográfico") — `/guides` 인덱스 페이지의 카테고리 그룹핑에 정상 편입되도록 함.
  - `tags` 필드도 기존 관련 가이드의 표기 관례(영문 kebab-case, 스페인어 악센트/공백 제거, "diafragma" 대신 "apertura" 태그 사용)에 맞춰 통일.
  - 신규 이미지(`image`/`imageCredit`)는 첨부하지 않음 — 기존 이미지 첨부는 별도 자동화 도구(Unsplash 검색/적용, `automation/attach-guide-image.py` 등)를 거치는데, 이번엔 그 경로를 타지 않고 수동으로 작성했기 때문. `image` 필드는 optional이라 렌더링에는 문제 없음. 필요 시 추후 이미지 첨부 자동화 도구로 보완 가능.
  - `src/lib/guides.ts`의 `getGuideSlugs()`는 디렉터리 내 `.mdx` 파일을 자동 탐지하는 구조라 별도 등록/설정 변경 없이 새 가이드가 바로 인식됨.

**검증**
- 로컬 `npm run dev`(포트 3010) + `curl`로 8개 신규 가이드 페이지(4개 언어 × 2편) 및 `/guides` 인덱스 페이지(4개 언어) 모두 200 OK 확인, dev 서버 로그에 런타임 에러 없음.
- `/en/guides` 인덱스 페이지 HTML에 신규 슬러그 2개가 실제로 링크로 노출되는 것을 확인.
- 코드(.ts/.tsx) 변경이 없는 콘텐츠 전용 작업이라 `npx tsc --noEmit`/`npx eslint`/`npm run build` 전체 실행은 생략 — 대신 dev 서버 실행 자체가 성공했고 8개 신규 라우트가 모두 정상 렌더링된 것으로 회귀 여부를 확인함.
- 작업 전 `content/guides/` 전체를 `_backups/backup_20260928_014833_macro-diffraction-dof-guides/`에 백업.

**다음 단계**
- 리스크 낮은 순 작업계획서의 1단계 2번("무료 대안" 비교 콘텐츠) 진행.
- 필요 시 이 2개 가이드에도 Unsplash 이미지 자동 첨부 도구를 적용해 히어로 이미지 보강.
- 자동 발행 큐(`guide-topics-queue.json`)에 이번 2개와 유사한 매크로 광학 심화 주제가 중복 등록되지 않도록 향후 큐 관리 시 주의.

## 2026-09-27 — 쿠팡 API 장애 시 알리익스프레스 임시 대체 노출 기능 추가

**배경**
- 사용자 요청: 쿠팡 API 호출이 시간당 하드캡 등으로 일시 중단되어 한국어 페이지에 상품이 표시되지 않는 시간 동안, 완전히 빈 화면 대신 알리익스프레스 상품을 임시로 보여줄 수 있는지 문의.
- 초기 검토 시 "알리익스프레스 로케일 매핑에 ko가 없어 불가능하다"고 잘못 답변했으나, 사용자 지적으로 재확인한 결과 알리익스프레스 오픈 API 자체는 `target_language=KO`/`target_currency=KRW`를 정식 지원하며, 매핑 누락은 API 한계가 아니라 "한국어 방문자는 항상 쿠팡으로만 라우팅되어 이 경로가 쓰인 적이 없었다"는 기존 설계상 이유였음. 답변 오류를 인정하고 정정.

**변경 사항**
- `src/app/api/aliexpress/search/route.ts`의 `LOCALE_TO_ALIEXPRESS`에 `ko: { currency: "KRW", language: "KO" }` 추가.
- `src/components/coupang-gear-cards.tsx`: 쿠팡 결과가 "empty"/"error" 상태가 되면 기존의 단순 안내 문구 대신 `<AliexpressGearCards />`를 렌더링하도록 변경. 이 컴포넌트는 쿠팡 provider(항상 한국어/한국 지역 컨텍스트)에서만 쓰이므로, `AliexpressGearCards`가 자체 `useLocale()`로 감지한 "ko"가 그대로 적용되어 KRW/한국어 상품이 노출됨.
- `src/components/aliexpress-gear-cards.tsx`: 한국어 로케일일 때는 기존 `gearDisclosure`(쿠팡 파트너스 명시 문구) 대신 알리익스프레스를 정확히 명시하는 새 문구(`gearDisclosureAliexpress`)를 사용하도록 분기 — 표시광고 고지가 실제 노출 중인 제휴 프로그램과 다르게 표기되는 것을 방지(법적/신뢰성 리스크로 판단해 자체적으로 추가).
- `messages/ko.json`: `gearDisclosureAliexpress` 키 신규 추가("이 사이트는 알리익스프레스 어필리에이트 프로그램에 참여하고 있으며...").
- `src/lib/aliexpress.ts`: 쿠팡(`src/lib/coupang.ts`)과 동일한 패턴의 Redis 기반 실제 결과 캐싱(6시간 TTL) + API 에러 시 15분 쿨다운 캐싱을 추가. 기존에는 Next.js의 `fetch(..., { next: { revalidate: 21600 } })`에만 의존하고 있었는데, 이는 쿠팡 쪽에서 이미 프로덕션에서 동작하지 않는 것으로 확인된 것과 동일한 패턴이라, 새로 호출 빈도가 늘어나는 이번 기능에서 같은 문제를 반복하지 않도록 선제적으로 안전조치를 적용.

**검증**
- `npx tsc --noEmit`, `npx eslint <변경 파일>` 모두 통과.
- `npm run build` 정상 완료.
- 로컬 `npm run dev` + `curl`로 `/api/coupang/search`, `/api/aliexpress/search?locale=ko` 모두 정상 응답(런타임 크래시 없음) 확인.
- 정직하게 밝히는 한계: 이 세션(클라우드 샌드박스)은 조직 네트워크 정책상 알리익스프레스 API 호스트(`api-sg.aliexpress.com`)에도 직접 접속이 차단되어 있어(기존에 확인된 exifnd.com, Upstash 차단과 동일한 종류의 제한), 로컬 검증 시 실제 API 호출은 `getaddrinfo EAI_AGAIN` 에러로 실패했음 — 다만 이 에러가 각 키워드별로 정상적으로 캐치되어 빈 배열로 우아하게 폴백되는 것은 확인했고(크래시 없음), 실제 알리익스프레스 응답/캐싱 동작 자체는 배포 후 실제 사이트에서 확인이 필요함.

**다음 단계**
- 배포 후 한국어 페이지에서 쿠팡 API가 일시적으로 막힌 상황을 재현(혹은 자연 발생 시)해, 알리익스프레스 상품이 정상적으로 대체 노출되는지, 그리고 문구가 알리익스프레스로 정확히 표기되는지 확인.
- Upstash 대시보드에서 `exiflens:aliexpress:search:v1:*` 캐시 키가 생성되는지 확인.

## 2026-09-27 — 쿠팡 검색 API 시간당 호출 하드캡 추가 (2회 초과 재발 방지 강화)

**배경**
- 앞선 항목("쿠팡 검색 API 시간당 호출한도 초과 문제 수정")에서 Redis 기반 결과 캐싱을 도입했으나, 사용자가 "이미 2회 초과된 상황이라 절대 재발해서는 안 된다"고 강하게 요청. 결과 캐싱만으로는 Upstash 응답 실패/지연 시 안전하게 `null`을 반환하고 실제 API로 폴백하도록 되어 있어(정상 상황에서는 합리적인 폴백이지만), 이론상 "캐시 미스처럼 보이는 예외 상황"에서는 여전히 실제 호출이 발생할 수 있는 구조였음.
- 이 계정은 이미 시간당 10회 한도를 2회 초과한 상태였고, 3회째 초과 시 파트너스 이용 자체가 제한되므로, "정상 상황을 가정한 완화책" 수준을 넘어 "물리적으로 호출 자체를 막는" 하드캡이 필요하다고 판단.

**변경 사항**
- `src/lib/coupang.ts`에 시간당 호출 횟수를 세는 공유 카운터(Upstash Redis `INCR`, 키: `coupang-shared:calls:v1:<UTC 시간버킷>`)를 추가.
- 결과 캐시가 미스인 경우, 실제 쿠팡 API를 호출하기 직전에 이 카운터를 증가시키고, 값이 안전 마진(`HOURLY_SAFETY_LIMIT = 7`, 실제 한도 10 대비 여유분 확보)을 넘으면 실제 API를 호출하지 않고 즉시 빈 결과를 반환 + 15분간 캐싱(circuit breaker와 동일한 쿨다운 재사용).
- 이 카운터 키는 프로젝트 접두사 없이(`PROJECT` 접두사 미적용) ExifLens/FlyDroneMap이 완전히 동일한 키를 공유하도록 설계 — 두 사이트가 같은 `COUPANG_ACCESS_KEY`를 쓰기 때문에, 쿠팡 쪽에서 보는 실제 시간당 호출 총량 기준으로 하드캡이 작동해야 의미가 있음.
- 동일한 수정을 FlyDroneMap의 `src/lib/coupang.ts`에도 함께 적용(사용자 승인 하에 두 프로젝트 동시 진행).

**검증**
- `npx tsc --noEmit`, `npx eslint src/lib/coupang.ts` 모두 통과.
- `npm run build` 정상 완료.
- 로컬 `npm run dev` + `curl http://localhost:3010/api/coupang/search` 확인 — `.env.local`의 `COUPANG_API_DISABLED=true`로 인해 이번에도 하드캡 로직 이전 단계에서 단락(short-circuit)되어 `{"products":[]}` 응답, 런타임 에러 없이 정상 동작 확인.
- 정직하게 밝히는 한계: 이 세션(클라우드 샌드박스)은 조직 네트워크 정책상 Upstash(`*.upstash.io`) 직접 접속이 차단되어 있어, `INCR`/`EXPIRE` 호출이 실제 Upstash 인스턴스에서 정상 동작하는지는 이 환경에서 직접 검증하지 못함. 다만 이미 프로덕션에서 검증된 `visitor-counter.ts`와 동일한 Upstash REST 호출 패턴(`GET`, `SET .../EX/`)을 그대로 따르고 있고, 이번에 추가한 `INCR`/`EXPIRE` 역시 Upstash REST API의 표준 명령 경로 형식(`{KV_URL}/incr/{key}`, `{KV_URL}/expire/{key}/{seconds}`)을 사용함.

**다음 단계**
- 배포 후 Vercel 런타임 로그(`get_runtime_errors`/`get_runtime_logs`)에서 "hourly call safety limit reached" 관련 로그가 나타나는지, 그리고 기존의 쿠팡 자체 rate-limit 초과 에러가 더 이상 발생하지 않는지 1~2주 모니터링.
- Upstash 대시보드에서 `coupang-shared:calls:v1:*` 키가 매 시간 새로 생성/만료되는지 확인.

## 2026-09-27 — 쿠팡 검색 API 시간당 호출한도 초과 문제 수정 (긴급)

**배경**
- 사용자가 "쿠팡광고가 정상적으로 보이다가 현재 보이지 않는다"고 문의. Vercel 운영 로그(`get_runtime_errors`)를 확인한 결과, `/api/coupang/search`에서 "검색 API의 시간당 사용 횟수를 초과했습니다... 총 3회 초과시 파트너스 이용이 제한됩니다 (현재 2회 초과)" 에러가 15분 사이 여러 요청에서 반복적으로 발생 중이었음.
- 근본 원인: 홈페이지 방문 1회당 ND필터 키워드 6개 + 액세서리 키워드 3개, 총 9개 키워드로 실제 쿠팡 API를 호출하는 구조인데, 기존 코드 주석은 "Next.js의 `fetch(..., { next: { revalidate: 21600 } })`로 키워드별 6시간 캐싱되어 재방문해도 추가 호출이 없다"고 되어 있었으나, 실제 운영 로그를 보면 몇 분 간격의 요청마다 매번 새로 API를 호출하고 있어 이 캐싱이 프로덕션에서 전혀 작동하지 않고 있었음.
- 더 심각한 부분: 이 쿠팡 API 키(`COUPANG_ACCESS_KEY`)가 flydronemap과 **완전히 동일**하다는 것을 `.env.local` 비교로 확인 — 시간당 10회 제한이 두 사이트가 나눠 쓰는 공동 한도였음. 계정이 이미 2회 초과 경고를 받은 상태라, 한 번 더 초과하면 쿠팡 파트너스 이용이 제한(계정 정지)될 수 있는 긴급한 사안으로 판단해 즉시 두 프로젝트에 함께 수정을 진행함(사용자 승인 받음).

**변경 내용 (exiflens, flydronemap 동일하게 적용)**
- `src/lib/coupang.ts`의 `searchCoupangProducts()`에 Upstash Redis(방문자 카운터가 이미 쓰고 있는 것과 동일한 KV 인스턴스) 기반의 실제 캐시를 추가. 키워드+limit 조합마다 캐시 키를 만들어 성공한 결과를 6시간 TTL로 저장하고, 다음 호출부터는 실제 API를 부르지 않고 캐시에서 바로 반환.
- 캐시 키에 프로젝트 접두사(`exiflens:` / `flydronemap:`)를 붙여, 두 사이트가 같은 Redis 인스턴스를 공유하더라도 서로의 캐시를 덮어쓰지 않도록 함 — 특히 `productUrl`에는 사이트별 `subId`가 태그되어 있어, 캐시를 잘못 공유하면 제휴 커미션 귀속이 틀어질 수 있어 이 부분을 명확히 분리함.
- API 에러(한도 초과 포함) 발생 시에도 빈 결과를 15분 TTL로 짧게 캐시해두는 회로차단기(circuit breaker)를 추가 — 계정이 이미 한도를 넘긴 상태에서 같은 키워드에 대해 재요청이 들어와도 15분간은 조용히 빈 배열만 반환하고 실제 API를 다시 두드리지 않도록 함.
- 기존 Next.js `fetch` 레벨 캐싱(`next: { revalidate }`)은 신뢰할 수 없다고 판단되어 제거하고 `cache: "no-store"`로 명시 — 캐싱 책임을 전부 위 Redis 계층으로 일원화.

**검증**
- 양쪽 프로젝트 모두 `npx tsc --noEmit`, `npx eslint src/lib/coupang.ts`, `npm run build` 통과.
- 캐시 read/write 로직만 별도로 검증하기 위해 실제 쿠팡 API를 호출하지 않는 격리된 테스트 스크립트(`__coupang_cache_selftest__` 키로 SET → GET 라운드트립)를 작성했으나, 이 세션이 작업 중인 샌드박스/로컬 환경에서 Upstash 호스트(`*.upstash.io`)로의 아웃바운드 네트워크 자체가 (exifnd.com 직접 접속과 마찬가지로) 조직 방화벽에 막혀있어 이 자리에서 직접 실행 검증은 하지 못함. 다만 GET/SET 호출 방식은 이미 프로덕션에서 정상 동작 중인 `src/lib/visitor-counter.ts`의 Upstash REST 호출 패턴(같은 `KV_REST_API_URL`/`KV_REST_API_TOKEN`, 같은 Bearer 인증 방식)을 그대로 따르고 있어 신뢰도는 높다고 판단.
- 실제 쿠팡 API 호출은 계정이 이미 2회 초과 상태라 테스트 목적으로도 추가 호출하지 않음(3회째 초과 시 파트너스 제한 위험을 피하기 위함).

**다음 단계 (배포 후 필수 확인)**
- 배포 후 Vercel 운영 로그(`get_runtime_errors`, `get_runtime_logs`)에서 같은 시간당 한도 초과 에러가 더 이상 반복되지 않는지 확인.
- Upstash 대시보드 또는 KV 조회로 `exiflens:coupang:search:v1:*` / `flydronemap:coupang:search:v1:*` 캐시 키가 실제로 쌓이는지 확인.
- 사이트에서 쿠팡 상품 카드가 다시 정상적으로 노출되는지 눈으로 확인.

---

## 2026-09-27 — 홈페이지에 FAQ 하이라이트 섹션 추가

**배경**
- 사용자가 "메인 화면에 텍스트가 많아 보이도록, /faq 페이지의 질문/답변을 몇 개 뽑아 홈페이지에도 노출하면 좋겠다"고 제안. 목적은 이전 가이드 하이라이트(3→6개 확대)와 동일한 맥락 — 홈페이지가 단순 계산기 모음이 아니라 질문/답변 형태의 실질적인 콘텐츠도 갖춘 사이트임을 구글봇/방문자 모두에게 보여주기 위함.
- 위치는 사용자가 직접 지정: "사진 도구 살펴보기" 섹션 바로 아래. FAQ 안에 도구별 질문도 섞여 있어, 방금 도구를 훑어본 방문자가 이어서 관련 질문을 자연스럽게 볼 수 있도록.
- 추가로 Claude의 제안(구조화 데이터도 함께 노출)을 사용자가 승인하여 반영.

**변경 내용**
- 신규 컴포넌트 `src/components/home-faq-highlights.tsx` 추가. `/faq` 페이지가 이미 하던 것과 동일한 방식(`tools-roster.ts`의 라이브 도구 목록 + 각 도구의 `faqNamespace` 번역 + 사이트 공통 `Home.faq`)으로 전체 FAQ 풀(현재 33개: 공통 6개 + 라이브 도구 9개 × 3개)을 모은 뒤, 매 요청마다 5개를 무작위로 선택해 노출.
- `/faq` 페이지와 동일하게 `<details>/<summary>` 네이티브 아코디언으로 렌더링 — 접힌 상태에서도 답변 텍스트가 서버 렌더링된 HTML에 그대로 포함되어 크롤러가 전체 텍스트를 읽을 수 있음.
- 노출된 5개 질문에 대해 홈페이지 자체에도 `FAQPage` JSON-LD 구조화 데이터를 추가(Claude 제안, 사용자 승인). `/faq` 페이지의 전체 33개짜리 JSON-LD와 일부 겹치지만, 각 페이지가 자신에게 실제로 보이는 콘텐츠만 마크업하는 것은 구글 구조화 데이터 가이드라인에 부합하며, 홈페이지도 FAQ 리치 스니펫 노출 대상이 되는 부가 효과 기대.
- `src/app/[locale]/page.tsx`에 "Section 8"로 `<HomeFaqHighlights />`를 `<HomeToolsHighlights />` 바로 다음, 최상단 `</div>` 직전에 배치. 기존 "Section 6" 주석의 "3 guides" 표기도 지난 변경(3→6개)에 맞춰 "6 guides"로 함께 수정.
- `messages/{en,es,ja,ko}.json`에 `faqHighlightsTitle`/`faqHighlightsSubtitle`/`faqHighlightsCta` 키를 4개 언어 전부 추가.

**검증**
- `npx tsc --noEmit`, `npx eslint` (변경 파일 대상) 통과.
- `npm run build` 성공 (AliExpress API 관련 네트워크 경고는 이번 변경과 무관한 기존 이슈).
- 4개 언어 메시지 JSON 파일 모두 파이썬 `json.load`로 유효성 확인.
- 로컬 `npm run dev`(포트 3010) + curl로 `/ko` 홈페이지 응답 확인 — `<details>` 태그 5개, `FAQPage` JSON-LD 1개, `/ko/faq` 링크가 정상적으로 렌더링됨을 확인.

**다음 단계**
- 배포 후 Google Search Console의 리치 결과(FAQ) 보고서에서 홈페이지가 새로 인식되는지 1~2주 관찰 권장.

---

## 2026-09-27

### 홈페이지 가이드 하이라이트 3개 → 6개로 확대

**배경**
- 사용자가 exifnd.com 홈페이지의 "가이드 살펴보기" 섹션이 3개 카드만 노출되는 것을 확인, 구글봇이 크롤링 시 페이지에 콘텐츠가 부족해 보이지 않도록 6개로 늘리자고 제안.
- 이 섹션(`src/components/home-guide-highlights.tsx`)은 원래 AdSense 재심사 대응 목적으로 추가된 것으로("심사봇이 홈페이지 자체의 크롤링 가능한 텍스트/링크 풍부함을 평가함"), 이번 변경은 같은 방향의 자연스러운 확장.

**변경 내용**
- `pickRandomGuides(getAllGuidesMeta(locale as Locale), 3)` → `..., 6)`으로 변경 (커밋 3ec09d1).
- 그리드가 `sm:grid-cols-3`(3열)이라 6개를 넣어도 레이아웃 코드 변경 없이 자동으로 2줄(3+3)로 배치됨.
- 코드 상단 주석의 "3 guides" 표현도 "6 guides"로 함께 수정.

**검증**
- 언어별(en/es/ja/ko) 발행된 가이드가 각 52개씩 있어 6개 무작위 노출에 콘텐츠 부족 문제 없음을 확인.
- `npx tsc --noEmit`, `npx eslint` 통과.
- `npm run build` 성공 (AliExpress API 관련 네트워크 경고는 이번 변경과 무관한 기존 이슈).
- 로컬 `npm run dev`(포트 3010) + curl로 `/ko` 홈페이지 응답 확인 — 서로 다른 6개 가이드 슬러그 링크가 정상 노출됨을 확인.

**다음 단계**
- 배포 후 GSC에서 홈페이지 관련 크롤링/색인 지표에 변화가 있는지 1~2주 정도 관찰 권장.

---

## 2026-09-27 — SEO: 루트 경로 자동 리디렉션을 언어 협상 방식에서 고정 방식으로 변경

- 배경: 사용자가 공유한 Google Search Console 스크린샷과 외부 SEO 감사 보고서를 계기로, 루트 도메인(`https://exifnd.com/`)이 "리디렉션이 포함된 페이지"로 색인되지 않는 문제를 함께 진단. 코드 확인 결과 hreflang/canonical(`src/lib/seo.ts`의 `languageAlternates()`)은 이미 올바르게 구현되어 있었고, sitemap도 루트 도메인을 등록하지 않는 등 대부분의 지적 사항은 실제로 문제가 아니었음. 다만 `src/i18n/routing.ts`의 next-intl 라우팅 설정이 기본값(`localeDetection`이 켜져 있음)이라, 언어 경로 없이 접속(`/`, `/guides/<slug>` 등)했을 때 방문자의 브라우저 Accept-Language 헤더에 따라 리디렉션되는 언어가 달라지는 구조였음(사용자가 직접 `https://exifnd.com/guides/macro-photography-basics`에 접속했을 때 브라우저 언어 설정에 따라 `/ko`로 리디렉션되는 것을 확인해 재현). 구글은 이런 콘텐츠 협상(content negotiation) 기반 자동 리디렉션을 권장하지 않으며, 리디렉션 목적지가 방문자/봇마다 달라지면 색인 처리가 비일관적일 수 있음.
- **수정**: `src/i18n/routing.ts`의 `defineRouting()` 설정에 `localeDetection: false`를 추가. 이제 언어 경로 없이 접속하면 방문자의 Accept-Language 헤더와 무관하게 항상 고정된 기본 언어(`en`)로만 리디렉션됨. 사이트 내 언어 스위처(각 언어 경로로 직접 링크)는 이 옵션과 무관하게 그대로 동작.
- **의도적으로 적용하지 않은 부분**: 동시에 공유된 외부 SEO 감사 보고서의 middleware.ts 예시 코드는 그대로 적용하지 않음. 그 코드는 next-intl 라우팅 자체를 빼고 새로 작성된 것이라, 실제로 쓰고 있는 next-intl 로케일 라우팅과 `src/proxy.ts`(Next.js 16의 middleware 명칭 변경)에 이미 구현되어 있는 지역(geo) 쿠키, 개발자 제외 쿠키 기능이 깨질 위험이 있었음. 또한 Search Console에서 제공받은 "크롤링됨 - 현재 색인 생성 안됨" 6개 URL 중 4개(언어 경로 없는 구형 URL)는 실제 접속 테스트 결과 정상적으로 리디렉션되는 것으로 확인되어, 별도 코드 수정 없이 구글의 자연스러운 재검증 과정에서 정리될 것으로 판단하고 지켜보기로 함. 나머지 2개(`/ja/hyperfocal-distance-explained`, `/es/raw-vs-jpeg-which-should-you-shoot`)는 일반적인 카메라 기초 주제라 콘텐츠 차별성 부족이 원인으로 추정되며, 이는 이미 이번 주에 시작한 "도구 활용법 중심" 주제 전환 방향으로 개선될 것으로 기대.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint src/i18n/routing.ts`(오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(자동 포트 3010) 환경에서 `curl`로 Accept-Language를 `ko`/`ja`/헤더 없음(구글봇 유사) 세 가지로 바꿔가며 `/` 요청 시 전부 `Location: /en`으로 일관되게 리디렉션됨을 확인. 언어 경로 없는 가이드 글(`/guides/macro-photography-basics`)도 동일하게 항상 `/en/guides/macro-photography-basics`로 리디렉션됨을 확인. 언어 스위처로 직접 `/ko` 접속 시 200 응답과 정상적인 페이지 타이틀이 렌더링되어 기존 기능에 영향이 없음을 확인.
- **커밋**: `e5e8a86` "fix(i18n): disable Accept-Language-based auto-redirect for root locale routing"
- **다음 단계**: push → 1~2주 후 Search Console에서 (1) 루트 도메인의 "리디렉션 포함" 표시가 유지되는지(정상, 문제 아님), (2) 언어 경로 없는 4개 구형 URL이 자연스럽게 정리되는지, (3) 이번 주부터 발행되는 도구 활용법 중심 신규 가이드들의 색인 비율이 기존 "카메라 기초" 류보다 개선되는지 확인 권장.

## 2026-09-23 — 가이드 자동 발행: 주제 큐 100개 확장 + 1일 2건 발행으로 전환

- 배경: 미발행 주제가 2개(순서 29, 30)만 남아 곧 소진될 상황이었음. 사용자가 (1) 확장된 9개 도구(심도, 노출 삼각형, 타임랩스, 별사진, 브라케팅, 인쇄 해상도, 저장 용량, EXIF 제거, 센서 크기 환산)의 실전 활용법을 다루는 가이드를 포함해 더 다양한 주제로 채워주고, (2) 발행 개수 제한 없이 중단 요청 전까지 계속 발행되길 원하며, (3) 검색 노출 확대를 위해 하루 발행량을 1건에서 2건으로 늘리고 싶다고 요청. 다만 발행량을 늘리는 과정에서 글 한 편의 깊이가 얕아지는 것(AI가 겉핥기로 쓴 듯한 글)은 명확히 원하지 않는다고 강조함. 작업 전 방향(주제 큐 사전 대량 확보 + 소진 임박 경고 vs 완전 자동 생성)을 설명하고 안전한 방식(A안)으로 진행할지 확인받았고, 2건/일 전환에 대해서도 의견을 먼저 제시(품질 저하 없이 완전히 독립된 글 2편, 트리거는 하루 1회 그대로 유지해 큐 갱신 지연으로 인한 중복 주제 선택 위험 회피)한 뒤 "바로 판단해서 진행해줘" 승인을 받아 진행.
- **주제 큐 확장**: `automation/guide-topics-queue.json`에 순서 31~130, 총 100개 주제를 추가(기존 30개 + 신규 100개 = 총 130개, 이 중 미발행 102개). "카메라의 역사"류 트리비아성 주제는 배제하고, (a) 9개 도구를 실제로 사용하면서 얻을 수 있는 스킬/응용법 중심 주제 17개(예: "심도 계산기로 인물사진 배경 흐림 정확히 맞추는 법", "별사진 계산기로 NPF 룰 기반 노출값 정하는 법", "EXIF 제거 도구로 SNS 업로드 전 위치정보 지우는 법" 등 9개 도구 전부 포함), (b) 장르별·상황별 실전 촬영 설정, 조명, 렌즈 활용, 장비 관리, 백업/워크플로우 등 트리비아가 아닌 실용적 스킬 주제 83개로 구성.
- **1일 2건 발행으로 전환**: ExifLens 가이드 자동 발행 예약 작업(scheduled task, 매일 KST 06:00 실행)의 프롬프트를 수정. 실행 시각·실행 횟수(하루 1회)는 그대로 유지하되, 한 번의 실행에서 미발행 주제 중 order가 가장 작은 것부터 2개를 선택해 각각 4개 언어(en/ko/ja/es)로 독립적으로 작성(총 8개 mdx 파일)하도록 변경. "두 주제 모두 분량을 줄이거나 서로 나눠쓰지 않고 각각 기존과 동일한 E-E-A-T 품질 기준(구체적 수치·실전 시나리오·왜 그런지 설명 등)을 100% 충족해야 한다"는 문구를 명시적으로 추가해 품질 저하를 방지. 빌드 검증(`npm run build`)은 두 주제의 mdx를 모두 배치한 뒤 한 번만 수행하도록 해 세션 실행 시간 증가를 최소화. 미발행 주제가 10개 이하로 남으면(firelic 프로젝트와 동일한 방식) 최종 보고에 보충 필요 경고를 포함하도록 추가(기존 ExifLens 트리거에는 이 경고 로직이 없었음).
- **의도적으로 채택하지 않은 방식**: 트리거 자체를 하루 2번(예: 06:00, 18:00) 실행하는 방식은 검토했으나, 첫 실행분의 발행 패키지(zip)를 사용자가 아직 처리하지 않은 상태에서 두 번째 실행이 GitHub의 큐를 다시 읽으면 같은 주제를 중복으로 선택할 위험이 있어 채택하지 않음. 예약 작업 소진 시 스스로 새 주제를 생성해 무한히 이어가는 완전 자동화 방식도 검토했으나, 사람의 사전 검수 없이 주제가 계속 생성되면 품질/중복 관리가 느슨해질 위험이 있어 채택하지 않음.
- **검증**: 큐 파일은 파이썬 `json.load`로 JSON 유효성 확인, 슬러그 중복 없음을 스크립트 내 assert로 확인, 총 130개 중 미발행 102개임을 확인. 예약 작업 프롬프트는 예약 작업 갱신 도구로 수정 후 목록 조회로 반영 상태 재확인.
- **커밋**: "chore(automation): expand guide topic queue with 100 practical tool-usage guides" (이 CHANGELOG 기록은 별도 커밋). 예약 작업 프롬프트 자체는 Claude Cowork 서비스 쪽 설정이라 이 저장소의 git 커밋 대상이 아님.
- **다음 단계**: 내일(KST 06:00) 첫 2건 동시 발행분이 도착하면 품질(깊이, 도구 활용법 정확성)을 확인하고, 사용자 의도와 다르면 추가 조정 요청 예정. 큐가 다시 10개 이하로 줄어들면 예약 작업이 자동으로 경고를 남기므로 그때 추가 주제 보충 필요.

## 2026-09-23 — 도구 예시 이미지: 모바일에서도 좌/우 2열 배치 유지 (상하 배치 버그 수정)

- 배경: 사용자가 오늘 확장된 도구들의 예시 이미지가 모바일에서 좌/우가 아닌 상/하로 보인다고 지적하며 "스케일만 줄여서 좌우로 보이게 할 수 있는지" 질문. 확인 결과 `ToolExampleImages` 공용 컴포넌트가 `sm:grid-cols-2`(Tailwind 640px 이상에서만 2열)를 쓰고 있어, 그보다 좁은 모바일 화면에서는 grid 기본값인 1열(상하 배치)로 떨어지는 것이 원인이었음. 원인과 해결 방법을 설명한 뒤 "진행해줘" 승인을 받아 수정.
- **수정**: `src/components/tools/tool-example-images.tsx` — 그리드 클래스를 `sm:grid-cols-2`에서 브레이크포인트 조건 없는 `grid-cols-2`로 변경해 모바일 폭에서도 항상 좌/우 2열로 배치되도록 수정(사진 비율 `aspect-[4/3]`은 그대로 유지되므로 찌그러짐 없이 크기만 작아짐). 좁은 화면에서 간격이 너무 넓어 보이지 않도록 `gap-4`를 `gap-3 sm:gap-4`로 조정. `next/image`의 `sizes` 속성도 실제 항상 2열(각 이미지가 뷰포트 폭의 절반)인 상황에 맞춰 `(min-width: 640px) 50vw, 50vw`로 정리(기존에는 모바일에서 `100vw`로 표기돼 있었지만 실제로는 항상 절반 폭만 차지해왔던 점을 함께 바로잡음).
- **적용 범위**: 이 컴포넌트를 공용으로 쓰는 모든 도구 페이지(총 9개 — 심도, 노출 삼각형, 타임랩스, 별사진, 브라케팅, 인쇄 해상도, 저장 용량, EXIF 제거, 센서 크기 환산)에 동일하게 적용됨.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev` + `curl`로 `/ko/tools/crop-factor-calculator` 렌더링 HTML에서 수정된 클래스(`grid gap-3 sm:gap-4 grid-cols-2`)가 정확히 출력됨을 확인. next-intl 관련 오류 없음 확인.
- **커밋**: `0a371b8` "fix(tools): keep example-image pairs side-by-side on mobile too"
- **다음 단계**: push → 실제 배포 사이트를 모바일 화면에서 새로고침해 예시 이미지가 좌/우로 나란히 보이는지 육안 확인 권장.

## 2026-09-23 — FAQ 페이지: 확장된 도구 9개의 FAQ를 카테고리별로 통합 노출

- 배경: 사용자가 "각 기능 페이지에는 FAQ가 있지만 `/faq` 페이지에는 확장된 기능(도구)들의 FAQ 내용이 없다"고 지적, 카테고리를 구분해서 `/faq` 페이지에도 함께 노출해달라고 요청. 작업 전 두 가지를 제안하고 확인받음: (1) 분류 방식은 `/tools` 허브가 이미 쓰는 "촬영 현장 계산 도구"/"촬영 후·실무 도구" 2개 대분류 안에 도구별 소제목으로 그룹핑, (2) 도구별 FAQ까지 합쳐 하나의 `FAQPage` 구조화 데이터(JSON-LD)로 전부 포함(검색 노출에 유리). "1,2번 너의 의견대로 그대로 진행 해줘" 승인을 받아 진행.
- **수정**:
  - `src/lib/tools-roster.ts` — 각 도구 항목에 `faqNamespace`(해당 도구의 next-intl 메시지 네임스페이스, 예: `DofCalculator`) 필드 추가. `/faq` 페이지가 이 필드로 각 도구의 `faq` 배열 위치를 찾음.
  - `src/app/[locale]/faq/page.tsx` — 기존에는 홈 자체 FAQ 6개만 노출했으나, `tools-roster.ts`의 `FIELD_TOOLS`/`POST_SHOOT_TOOLS` 순회하며 `live` 상태인 9개 도구 전체의 FAQ(각 3개, 총 27개)를 함께 조회해 "일반"(홈 FAQ) → "촬영 현장 계산 도구"(도구별 소제목 + FAQ) → "촬영 후·실무 도구"(동일 구조) 3개 대분류로 그룹핑해 노출. 각 도구 소제목은 해당 도구 페이지(`/tools/<slug>`)로 연결되는 링크로 구성해 내부 링크도 추가 확보. 홈 FAQ 6개 + 도구 FAQ 27개(총 33개) 전체를 하나의 `FAQPage` JSON-LD `mainEntity`로 합쳐서 출력. 각 질문은 기존과 동일하게 기본적으로 접혀 있는 `<details>` 아코디언 형태를 유지해, 문항 수가 늘어나도 페이지가 한눈에 부담스러워 보이지 않도록 함.
  - `messages/{en,ko,ja,es}.json`의 `Faq` 네임스페이스에 `generalSectionTitle`(홈 FAQ 그룹 제목: 한국어 "일반", 영어 "General", 스페인어 "General", 일본어 "一般") 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(자동 포트 3010) + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) `/faq` 페이지 모두 200 확인, 카테고리 제목 3개("일반"/"촬영 현장 계산 도구"/"촬영 후 · 실무 도구") 렌더링 확인, 9개 도구 링크(`/ko/tools/<slug>`) 전체 존재 확인, 도구별 FAQ 문항(예: "과초점거리란 무엇인가요?", "크롭 팩터는 어떻게 계산되나요?")과 기존 홈 FAQ 문항(예: "정말로 사진이 서버에 업로드되지 않나요?")이 모두 실제 렌더링됨을 직접 확인. `acceptedAnswer` 개수가 66건(33개 질문 × 2, HTML 초기 렌더 + RSC 페이로드 중복 포함)으로 기대값(홈 6 + 도구 9×3=27 = 33)과 정확히 일치함을 확인. next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인.
- **커밋**: `97d4404` "feat(faq): surface every live tool's FAQ on the /faq page, categorized"
- **다음 단계**: push → 실제 배포 사이트 `/faq` 페이지에서 카테고리별 아코디언이 잘 보이는지 육안 확인 권장. 이후 새 도구가 추가될 때도 `tools-roster.ts`에 `faqNamespace`만 채워주면 `/faq` 페이지에 자동 반영됨.

## 2026-09-23 — 메인 페이지: 가이드 랜덤 노출 + 사진 도구 전체 미리보기 섹션 추가

- 배경: 사용자가 두 가지를 요청. (1) 메인 페이지 하단 "가이드 살펴보기"가 접속할 때마다 다르게 노출되었으면 좋겠다. (2) `/tools`에 확장된 도구 기능들을 PC에서 상단 메뉴를 클릭하지 않는 사용자도 알 수 있도록 메인 페이지에 미리보기/요약으로 노출해달라 — "오늘 작업한 도구만"이 아니라 "너가 작업한 확장된 모든 기능(tools에 추가된 기능들)" 전체를 노출하는 것으로 범위를 확인받음. 추가로 "구글이 크롤링할 때 메인 페이지를 보고 사이트 가치를 판단하는 것 같다"는 이유로, 단순 기능 홍보뿐 아니라 홈페이지 자체의 크롤링 가능한 텍스트/링크를 늘려 "내용이 알찬 사이트"임을 어필하려는 목적도 함께 전달받음(기존 `home-guide-highlights.tsx`가 애드센스 재심사 대응으로 추가됐던 것과 동일한 맥락). 작업 전 범위 확정(오늘 5개 도구 vs 전체 9개 도구)과 리스크(홈페이지 스크롤 길이 증가)를 먼저 확인받은 뒤 "진행해줘" 승인을 받아 진행.
- **신규**:
  - `src/lib/tools-roster.ts` — 기존 `/tools` 허브 페이지(`tools/page.tsx`)에 하드코딩돼 있던 `FIELD_TOOLS`/`POST_SHOOT_TOOLS` 도구 목록(slug + live/comingSoon 상태)을 별도 파일로 분리해 단일 소스로 관리. `/tools` 허브와 이번에 추가한 메인 페이지 도구 미리보기 섹션이 동일한 목록을 참조하므로, 앞으로 새 도구가 이 목록에 한 번만 추가되면 두 곳 모두에 자동으로 반영됨(중복 관리 불필요). `getLiveTools()`로 `live` 상태 도구만 필터링해서 제공.
  - `src/components/home-tools-highlights.tsx` — 현재 `live` 상태인 도구 9개 전체(기존 4개 + 오늘 추가된 5개)를 이름 + 실제 한 줄 설명(기존 `ToolsHub` 번역 데이터 재사용) 카드로 나열하고 각 도구 페이지로 링크. 서버 컴포넌트로 구현해 자바스크립트 실행 없이도 구글봇이 텍스트와 내부 링크 9개를 그대로 크롤링할 수 있도록 구성. 하단에 `/tools` 전체 보기 링크도 포함.
  - `messages/{en,ko,ja,es}.json`의 `Home` 네임스페이스에 `toolsHighlightsTitle`/`toolsHighlightsSubtitle`/`toolsHighlightsCta` 3개 키 추가(기존 `guideHighlights*` 키와 같은 톤으로 작성).
- **수정**:
  - `src/components/home-guide-highlights.tsx` — 기존에는 전체 가이드 중 앞 3개(`.slice(0, 3)`)를 고정 노출했으나, Fisher-Yates 셔플로 매 요청마다 무작위 3개를 뽑도록 변경. 홈페이지는 이미 동적 렌더링(정적 생성 아님)이라 실제로 접속할 때마다 다른 조합이 노출됨.
  - `src/app/[locale]/tools/page.tsx` — 도구 목록을 자체 하드코딩 대신 `src/lib/tools-roster.ts`에서 import하도록 리팩터링(동작은 동일, 중복 제거).
  - `src/app/[locale]/page.tsx` — `<HomeGuideHighlights>` 섹션 바로 아래에 `<HomeToolsHighlights>` 섹션 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(자동 포트 3010) + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 홈페이지에서 새 섹션 타이틀 렌더링 확인, `/ko` 홈페이지 HTML에서 9개 도구 링크(`/ko/tools/<slug>`)가 모두 정확히 1개씩 존재함을 확인. 가이드 랜덤 노출은 같은 로케일로 2회 연속 요청해 서로 다른 가이드 3개 조합이 나오는 것을 직접 확인(1차: color-space-srgb-vs-adobe-rgb 외 2건, 2차: graduated-nd-filter-guide 외 2건 — 서로 다름). next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인(로그에 나타난 `gear-recommendation-ssr` 관련 오류는 기존에 의도적으로 비활성화해 둔 쿠팡 API 킬스위치로 인한 것으로 이번 작업과 무관).
- **커밋**: `3214091` "feat(home): randomize guide highlights and surface all live tools"
- **다음 단계**: push → 실제 배포 사이트에서 새로고침 시 가이드 조합이 바뀌는지, 홈페이지 하단에 9개 도구 카드가 잘 보이는지 육안 확인 권장.

## 2026-09-23 — /tools 9번 도구(마지막 도구): 센서 크기별 환산 화각 계산기 추가 (고급 옵션 + 심도 정밀 진단 포함)

- 배경: 승인된 9개 도구 순서 중 마지막(9번)에 따라 진행. 사전에 기본 계산(센서 크기별 크롭 팩터, 35mm 환산 초점거리, 화각)과 고급 옵션 2가지(다른 센서와의 비교 환산, 피사계 심도 정밀 진단)를 계획으로 제시했고, 심도 정밀 진단의 범위(안내 문구 수준 vs 정밀 계산)에 대해 먼저 확인을 구한 뒤 "고급옵션 정밀진단까지 포함해서 작업 진행 해줘" 승인을 받아 진행.
- **신규**:
  - `src/lib/crop-factor-calculator.ts` — 센서 프리셋(풀프레임, APS-C 캐논(1.6배)와 APS-C 니콘/소니/후지(1.5배)를 별도 옵션으로 구분, 마이크로포서드, 1인치, 미디엄포맷, 직접 입력) + `calculateCropFactor`(센서 대각선과 풀프레임 대각선(약 43.3mm)의 비율로 계산 — 제조사 공식 크롭 팩터 값과 거의 동일), `calculateEquivalentFocalLengthMm`(실제 초점거리 × 크롭 팩터), `calculateFovDegrees`(2·atan(센서 크기/2f)의 표준 화각 공식), `calculateComparableFocalLengthMm`(35mm 환산 초점거리를 비교 대상 센서의 크롭 팩터로 나눠 동일 화각을 만드는 초점거리 역산), `calculateEquivalentAperture`(화각을 맞춘 상태에서 심도·배경흐림은 조리개 숫자가 아닌 실제 렌즈 구경(입사동 지름)에 좌우된다는 사진학적 "환산(equivalence)" 원리에 따라, 두 센서의 크롭 팩터 비율만큼 f값을 환산), `calculateCircleOfConfusionMm`(센서 대각선/1500 근사치, 심도 정밀 진단용).
  - `src/components/crop-factor-calculator-card.tsx` — 센서 선택(프리셋 + 직접 입력 폭/높이) + 실제 초점거리 입력 → 크롭 팩터·35mm 환산 초점거리·수평/수직 화각 결과. 고급 옵션: (1) 비교할 센서 선택 → 동일 화각을 만드는 환산 초점거리, (2) 심도 정밀 진단 — 조리개·촬영 거리 입력 → 기존 심도(DoF) 계산기(`dof-calculator.ts`)의 과초점거리/근거리·원거리 한계/총 심도 범위 공식을 그대로 재사용(중복 구현 없이 DRY 유지)해 실제 피사계 심도를 계산하고, 비교 센서 기준 환산 조리개값(심도·배경흐림 비교용 참고치)을 함께 안내.
  - `src/app/[locale]/tools/crop-factor-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용, 권장 검색어: "camera lens sensor comparison mirrorless dslr").
  - `messages/{en,ko,ja,es}.json`에 `CropFactorCalculator` 네임스페이스 전체 번역 추가(기존 `ToolsHub.tools.crop-factor-calculator`의 이름/설명 문구를 그대로 페이지 타이틀/설명에 재사용해 일관성 유지).
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `crop-factor-calculator`를 `comingSoon` → `live`로 전환(승인된 9개 도구 전체가 이제 모두 `live` 상태), `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(자동 포트 3010) + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 모두 `/tools/crop-factor-calculator` 200 및 실제 렌더링 텍스트 확인, `/ko/tools` 허브에서도 정상 노출(comingSoon 배지 아님) 확인. 계산 결과 수치도 직접 검증(기본값 APS-C 센서(23.5×15.6mm) + 초점거리 50mm → 크롭 팩터 1.53×, 환산 초점거리 77mm로 렌더링된 것을 확인 — 손으로 계산한 예상값과 일치). next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인.
- **커밋**: `5d3da4b` "feat: add crop factor / equivalent focal length calculator (Tool #9)"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용. 이번 도구로 최초 승인된 9개 도구 순서가 모두 완료되었으며, 이후 신규 도구/기능은 별도 계획 제시 및 승인 절차를 거쳐 진행 예정.

## 2026-09-23 — /tools 8번 도구: EXIF/메타데이터 일괄 제거 도구 추가 (전체 포맷 + 단일/일괄 + 고급 옵션)

- 배경: 승인된 9개 도구 순서(8번)에 따라 진행. 사용자가 3가지 명시적 요구사항을 제시: (1) 한 장 단일 처리와 여러 장 일괄 처리 모두 지원, (2) 메타데이터가 저장되는 모든 포맷을 지원, (3) 고급 옵션 포함 — 이와 함께 "지금까지 새롭게 추가된 고급옵션 기능은 추후 유료로 전환될 수 있으므로, 가급적 모든 기능에 고급옵션이 필요하다"는 **제품 전략 방향(향후 모든 도구에 공통 적용)**을 전달받음. 작업 시작 전 기술적 리스크(HEIC/HEIF의 제한적인 브라우저 디코딩 지원, TIFF의 낮은 실사용 빈도, IPTC/XMP 범위의 모호성, 대량 파일 처리 시 성능)를 사용자에게 먼저 설명하고, JPEG/PNG/WebP 3개 포맷(웹에서 메타데이터를 저장하는 포맷 중 실사용 비중이 가장 높은 조합)으로 범위를 확정한 뒤 "현상태 백업 후 작업 진행해줘" 승인을 받아 진행.
- **신규**:
  - `src/lib/metadata-remover.ts` — 캔버스 재인코딩 방식(화질/색상 손실 발생) 대신, 원본 바이트를 직접 파싱해 메타데이터 영역만 잘라내는 **무손실 바이트 단위 제거 방식** 채택. `detectImageFormat`(매직 바이트로 JPEG/PNG/WebP 판별), `stripJpegSegments`(JPEG 마커 세그먼트를 순회하며 APP1/EXIF, APP13/IPTC, COM 세그먼트만 선택 제거, SOS 이후 압축 데이터는 그대로 보존), `stripPngChunks`(PNG 청크 구조를 순회하며 tEXt/zTXt/iTXt/eXIf/tIME 등 보조 청크만 제거), `stripWebpChunks`(WebP RIFF 서브청크 중 EXIF/XMP 청크 제거 + VP8X 청크의 존재 플래그 비트 초기화 + RIFF 전체 크기 필드 재계산), `removeGpsOnlyFromJpeg`(`piexifjs`로 GPS 태그만 선택 제거하는 고급 옵션용 부분 제거 함수 — 별도 XMP 블록에 GPS가 중복 저장된 경우까지는 다루지 못하는 한계를 UI 안내 문구에 명시).
  - `src/types/piexifjs.d.ts` — 타입 정의가 없는 `piexifjs` 패키지용 앰비언트 모듈 선언.
  - `src/components/exif-remover-card.tsx` — 파일 선택(단일/다중, 최대 20장) → 업로드 즉시 기존 `parseExifFile`로 카메라/GPS/촬영일 요약 표시 → "제거 실행" 시 각 파일을 순차 처리 → 완료된 파일 개별 다운로드 또는 2장 이상일 때 `jszip`으로 ZIP 일괄 다운로드. 고급 옵션: GPS 정보만 선택 제거(체크 시 EXIF 전체가 아닌 GPS 태그만 제거), IPTC 정보 포함 제거(기본 켜짐).
  - `src/app/[locale]/tools/exif-remover/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용, 권장 검색어: "privacy data protection photo metadata camera").
  - `messages/{en,ko,ja,es}.json`에 `ExifRemover` 네임스페이스 전체 번역 추가(이전 저장 용량 계산기 작업에서 발견한 점(.) 포함 평면 키 실수를 재발하지 않도록 사전 검증하여 작성).
- **신규 의존성**: `piexifjs`(JPEG GPS 태그 부분 제거용), `jszip`(브라우저 내 ZIP 일괄 다운로드 생성용).
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `exif-remover`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건 — 최초 `Blob` 생성부에서 `Uint8Array<ArrayBufferLike>` 타입 오류가 있었으나, 정확한 바이트 범위를 `ArrayBuffer`로 명시적으로 슬라이스하도록 수정해 해결), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(자동 포트 3010) + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 모두 `/tools/exif-remover` 200 및 실제 렌더링 텍스트(한국어: "EXIF/메타데이터 일괄 제거 도구", 영어: "EXIF / Metadata Remover", 스페인어: "Eliminador de EXIF", 일본어: "EXIF/メタデータ一括削除ツール") 확인, `/ko/tools` 허브에서도 정상 노출(comingSoon 배지 아님) 확인. next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인.
- **참고(별도 발견 사항, 이번 작업과 무관)**: `piexifjs`/`jszip` 설치 중 `npm audit`에서 기존에 존재하던 취약점 3건 발견(js-yaml/high — `gray-matter`가 내장한 구버전 경유, Next.js 16.0.0–16.3.2/critical — 인증 없이 원격 코드 실행 가능한 취약점, sharp <0.35.4/high — libheif 경유). 이번에 추가한 두 패키지와는 무관하며, `npm audit fix --force`는 Next.js를 현재 지정 범위 밖으로 올리게 되어 별도의 신중한 테스트 사이클이 필요하므로 이번 작업에서는 손대지 않고 사용자에게 별도 보고함.
- **제품 전략 메모(향후 모든 도구 공통 적용)**: 사용자 지시 — "지금까지 새롭게 추가된 고급옵션 기능은 추후 유료로 전환될 수 있으므로, 가급적 모든 기능에 고급옵션이 필요하다." 특정 도구에 국한되지 않고 앞으로 추가/수정하는 모든 도구 기능에 기본적으로 적용해야 하는 상시 방향으로 기록.
- **커밋**: `0a070d5` "feat: add EXIF/metadata remover tool (Tool #8)"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용 → 이후 9번 도구(센서 크기별 환산 화각 계산기)로 순차 진행(사전 계획 제시 및 명시적 진행 승인 필요).

## 2026-09-23 — /tools 7번 도구: 저장 용량 계산기 추가 (고급 옵션 포함)

- 배경: 승인된 9개 도구 순서(7번)에 따라 진행. 사용자가 "고급 옵션도 처음부터 포함해서 한 번에 진행"을 요청 — 기본 계산(파일 형식 + 촬영 매수 → 총 저장 용량, 필요한 메모리카드 매수)에 고급 옵션(백업 벌 수 반영, 클라우드 업로드 시간 예상)을 처음부터 함께 구현.
- **신규**:
  - `src/lib/storage-calculator.ts` — `calculateTotalShots`(직접 입력 또는 일수 기준(일일 매수×일수) 두 가지 방식으로 총 촬영 매수 산출), `calculateStoragePlan`(파일 크기×매수×(1+백업 벌 수)로 총 용량 계산 + 메모리카드 매수 역산), `calculateUploadTimeSeconds`(총 용량/업로드 속도로 예상 업로드 시간 추정), 파일 형식 프리셋(JPEG 압축/RAW 압축/RAW 무압축, 대표 MB/장 값) + 메모리카드 용량 프리셋(64GB~2TB), 포맷터 함수들.
  - `src/components/storage-calculator-card.tsx` — 파일 형식 선택(프리셋+직접 입력) + 촬영 매수 입력 방식 전환(직접 입력/일수 기준) + 메모리카드 용량 선택 + 결과(총 매수, 필요 용량, 필요 카드 매수), 고급 옵션(추가 백업 벌 수 + 백업 제외 원본 용량 비교 표시, 인터넷 업로드 속도 입력 + 예상 클라우드 업로드 시간).
  - `src/app/[locale]/tools/storage-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용).
  - `messages/{en,ko,ja,es}.json`에 `StorageCalculator` 네임스페이스 전체 번역 추가(파일 형식 옵션은 `formatOption.<id>` 중첩 구조로 구성).
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `storage-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성 — 빌드 전 `.next` 캐시 삭제 권한이 세션 초기화로 재요청 필요했으며, 재승인 후 정상 진행). 로컬 `npm run dev`(자동 포트 3010) + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 모두 `/tools/storage-calculator` 200 및 실제 렌더링 텍스트 확인, `/ko/tools` 허브에서도 정상 노출 확인. next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인. (참고: `formatOption.<id>` 번역 키를 처음에 점(.) 포함 평면 키로 잘못 생성했다가, next-intl의 점 표기 중첩 경로 규칙에 맞춰 중첩 객체 구조로 즉시 수정함.)
- **커밋**: `bb60d00` "feat(tools): add Storage Space Calculator with advanced options"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용 → 이후 8번 도구(EXIF 일괄 제거 도구)로 순차 진행.

## 2026-09-23 — 로컬 dev 서버 포트 3010으로 고정 (3개 프로젝트 공통 포트 충돌 방지)

- 배경: exiflens/flydronemap/firelic 3개 형제 프로젝트가 모두 `next dev` 기본 포트(3000)를 그대로 사용해, 동시에 여러 프로젝트의 dev 서버를 띄우면 나중에 실행한 쪽이 자동으로 3001/3002 등으로 밀려나 "어느 터미널이 어느 프로젝트인지" 혼동되는 문제가 반복 확인됨(flydronemap 2026-09-23 "사이트 전체 점검" 항목에서도 이 문제로 확인이 꼬인 사례 발생). "💼 프로젝트 공통 작업" 대화방에서 3개 프로젝트에 동일 패턴으로 일괄 적용.
- **수정**: `package.json`의 `dev:plain`(`next dev`)에 `-p 3010` 추가, `scripts/dev-open.mjs`가 실제 spawn하는 `next dev` 호출과 Chrome 자동 오픈 실패 시 폴백 URL(`FALLBACK_URL`)도 3010으로 동기화. `README.md`의 안내 URL도 `localhost:3000` → `localhost:3010`으로 수정. 포트 배정(서로 겹치지 않음): exiflens=3010, flydronemap=3020, firelic=3030.
- **검증**: `package.json` JSON 유효성, `node --check scripts/dev-open.mjs` 구문 검증 통과. 3개 저장소의 dev 서버를 동시에 기동해 각각 지정 포트에서 정상 응답하는 것을 스모크 테스트로 확인(서로 포트 충돌 없음을 직접 검증).
- **커밋**: `a50c080` "fix(dev): exiflens 로컬 dev 서버 포트를 3010으로 고정 (형제 프로젝트 포트 충돌 방지)"
- **다음 단계**: push → 이후 `npm run dev`로 이 프로젝트를 실행하면 항상 3010번 포트로 뜸(flydronemap/firelic과 동시에 띄워도 더 이상 충돌 없음).

## 2026-09-23 — /tools 6번 도구: 인쇄 해상도 / DPI 계산기 추가 (고급 옵션 포함)

- 배경: 승인된 9개 도구 순서(6번)에 따라 진행. 사용자가 "고급 옵션도 처음부터 포함해서 한 번에 진행"을 요청 — 기본 계산(사진 픽셀 크기 + DPI → 최대 인쇄 크기, 원하는 인쇄 크기 → 필요한 픽셀 크기 및 충분/부족 판정)에 고급 옵션(업스케일링 가이드)을 처음부터 함께 구현.
- **신규**:
  - `src/lib/print-resolution-calculator.ts` — `calculateMaxPrintSize`(픽셀 크기 + DPI → 인치/cm 최대 인쇄 크기), `calculateRequiredPixels`(원하는 인쇄 크기 + DPI → 필요한 픽셀 크기/화소수), `calculateUpscaleGuidance`(현재 대비 필요 픽셀의 면적비에서 선형 배율을 역산해 sufficient/minor/moderate/major 4단계로 분류), 사진 인화 크기 프리셋(4×6~20×30in) + ISO 표준 용지 프리셋(A4/A3/A2/A1, mm→inch 정확 환산) 상수, 포맷터 함수들.
  - `src/components/print-resolution-calculator-card.tsx` — 사진 픽셀 크기/DPI 입력 + 최대 인쇄 크기 결과, 원하는 인쇄 크기 선택(사진 인화 크기·표준 용지 그룹 + 직접 입력 단위(in/cm) 전환) + 필요 픽셀 크기·충분/부족 판정, 고급 옵션(업스케일 배율 + 단계별 안내 문구).
  - `src/app/[locale]/tools/print-resolution-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용).
  - `messages/{en,ko,ja,es}.json`에 `PrintResolutionCalculator` 네임스페이스 전체 번역 추가.
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `print-resolution-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev` + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 모두 `/tools/print-resolution-calculator` 200 및 실제 렌더링 텍스트 확인, `/ko/tools` 허브에서도 정상 노출 확인. next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인.
- **커밋**: `e83f967` "feat(tools): add Print Resolution / DPI Calculator with advanced options"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용 → 이후 7번 도구(저장 용량 계산기)로 순차 진행.

## 2026-09-23 — /tools 5번 도구: 브라케팅(HDR) 계산기 추가 (고급 옵션 포함)

- 배경: 승인된 9개 도구 순서(5번)에 따라 진행. 사용자가 "고급 옵션도 처음부터 포함해서 한 번에 진행"을 요청 — 기본 브라케팅 계산(기준 노출 + 스텝 + 매수 → 프레임별 조리개/셔터스피드/ISO)에 고급 옵션 2가지(다이나믹 레인지 가이드, 예상 총 촬영 시간)를 처음부터 함께 구현.
- **신규**:
  - `src/lib/bracket-calculator.ts` — `calculateBracketPlan`(기준 조리개·셔터스피드·ISO + 브라케팅 대상 파라미터 + 스텝(스탑) + 매수를 입력받아, 대상 파라미터만 표준 EV 브라케팅 컨벤션(+EV=더 밝은 프레임)에 따라 위아래로 조정한 프레임 목록을 생성 — 셔터/ISO는 스탑당 2배, 조리개는 스탑당 √2배이되 밝아지는 방향이 반대(조리개 값 감소)임을 반영), 다이나믹 레인지 가이드(총 EV 범위를 standard/highContrast/extreme 3단계로 분류하는 임계값 로직), `formatStepStops`/`formatStopsOffset`/`formatShootingTimeSeconds` 포맷터. 노출 계산기(`src/lib/exposure-calculator.ts`)의 스탑 프리셋·포맷터를 그대로 재사용(중복 구현 없음).
  - `src/components/bracket-calculator-card.tsx` — 기준 노출 입력(조리개/셔터스피드/ISO) + 브라케팅 대상 파라미터/스텝/매수 선택 + 프레임별 결과 리스트(대상 파라미터만 강조 표시) + 고급 옵션 섹션(샷당 오버헤드 입력, 예상 총 촬영 시간, 총 밝기 범위, 다이나믹 레인지 가이드 문구).
  - `src/app/[locale]/tools/bracketing-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용).
  - `messages/{en,ko,ja,es}.json`에 `BracketCalculator` 네임스페이스 전체 번역 추가.
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `bracketing-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev` + `curl`로 4개 로케일(`/ko`, `/en`, `/es`, `/ja`) 모두 `/tools/bracketing-calculator` 200 및 실제 렌더링 텍스트(각 언어별 카드 제목) 확인, `/ko/tools` 허브에서도 "브라케팅(HDR) 계산기"가 정상 노출(comingSoon 배지 아님) 확인. next-intl 관련 오류(MISSING_MESSAGE 등) 없음 확인.
- **커밋**: `09261a0` "feat(tools): add Bracketing (HDR) Calculator with advanced options"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용 → 이후 6번 도구(인쇄 해상도/DPI 계산기)로 순차 진행.

## 2026-09-23 — 쿠팡(Coupang) API 임시 중단 킬스위치 추가

- 배경: ExifLens와 FlyDroneMap 두 개발 사이트를 동시에 테스트하면서 쿠팡 파트너스 Open API의 시간당 호출 제한(10회/시간)을 초과함. 사용자 요청에 따라 ExifLens에서만(FlyDroneMap은 해당 프로젝트 대화방에서 별도 조치, firelic은 현재 미작업) 쿠팡 API 호출을 임시로 중단하고, 기능 추가는 계속 진행.
- **수정**: `src/lib/coupang.ts` — `COUPANG_API_DISABLED` 환경변수가 `"true"`일 때 `searchCoupangProducts()`가 실제 네트워크 요청 전에 `CoupangConfigError`를 던지도록 킬스위치 추가. 기존에 자격증명 누락 시 처리하던 경로를 그대로 재사용하므로 `/api/coupang/search` 라우트나 UI 쪽은 수정 불필요(해당 섹션이 조용히 숨겨짐).
- **문서화**: `.env.example`에 `COUPANG_API_DISABLED` 항목 추가(주석 포함). 실제 활성화는 커밋되지 않는 `.env.local`에서 `COUPANG_API_DISABLED=true`로 설정.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(오류 0건), `npm run build`(exit code 0). 로컬 `npm run dev` + `curl http://localhost:3000/api/coupang/search` → `HTTP 200`, `{"products":[]}` 즉시 반환(응답 시간 18ms, 실제 쿠팡 서버 호출 없음, 에러 로그 없음) 확인.
- **커밋**: `447b3e8` "feat(coupang): add temporary kill-switch for outbound API calls"
- **재개 방법**: 사용자가 "쿠팡 API 다시 켜줘"라고 요청하면, `.env.local`의 `COUPANG_API_DISABLED=true`를 제거(또는 다른 값으로 변경)하여 재개.

## 2026-09-23 — /tools 4번 도구: 별사진(천체) 노출 계산기 추가 (500 법칙 + NPF 법칙, 화소수 프리셋)

- 배경: 승인된 9개 도구 순서(4번)에 따라 진행. 사용자가 NPF 법칙에 필요한 카메라 화소수 입력을, 자유 입력 대신 실제 최근 미러리스 카메라 화소수를 조사해 대표 모델명과 함께 표기한 프리셋으로 선택하도록 요청 — 웹 검색으로 확인한 실제 화소수(24.2/33/45/51.4/61MP)를 대표값으로 사용.
- **신규**:
  - `src/lib/astro-calculator.ts` — 센서 프리셋(실제 물리 폭 mm, 크롭팩터, 종횡비), 화소수 프리셋(대표 모델명 포함: Canon R6 Mark II·Sony A7 III·Nikon Z6III=24MP대, Sony A7 IV·Canon R6 Mark III=33MP대, Canon R5 Mark II·Nikon Z8/Z9=45MP대, Fuji GFX50S II=50MP대, Sony A7R V/VI=61MP대), `calculateHorizontalPixels`/`calculatePixelPitchMicrons`(화소수+센서 물리 크기 → 픽셀 피치 역산), `calculate500Rule`(500 ÷ 풀프레임 환산 초점거리), `calculateNpfRule`(`t = (35N + 30p) / f`, 조리개·픽셀 피치 반영 정밀 공식).
  - `src/components/astro-calculator-card.tsx` — 초점거리/조리개/센서 크기/화소수 프리셋 입력 + 500 법칙과 NPF 법칙 결과 비교, 어느 쪽이 더 보수적인지 설명 문구 표시.
  - `src/app/[locale]/tools/astrophotography-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조, 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용).
  - `messages/{en,ko,ja,es}.json`에 `AstroCalculator` 네임스페이스 전체 번역 추가 — 화소수 표기는 로케일별로 다르게(한국어/일본어는 "약 2,400만 화소대", 영어/스페인어는 "~24MP") 표시되도록 `megapixelOption` 문자열에 `{man}`/`{mp}` 두 플레이스홀더를 함께 준비하고 각 로케일이 필요한 것만 사용.
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `astrophotography-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 정상 생성). 로컬 `npm run dev`(포트 3000) + `curl`로 `/ko/tools/astrophotography-calculator`, `/en/tools/astrophotography-calculator`, `/ko/tools` 모두 200 및 실제 렌더링 텍스트("별사진(천체) 노출 계산기", "NPF 법칙") 확인.
- **커밋**: `fc83410` "feat(tools): add Astrophotography Exposure Calculator (500 & NPF rules)"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용(권장 검색어: 좌="짧은 노출로 별이 점으로 찍힌 은하수", 우="긴 노출로 별 궤적이 생긴 야간 사진") → 이후 5번 도구(브라케팅/HDR 계산기)로 순차 진행.

## 2026-09-23 — /tools 3번 도구: 타임랩스 계산기 추가 (고급 옵션 포함)

- 배경: 승인된 9개 도구 순서(3번)에 따라 진행. 사용자가 "기능마다 완성 후 또 작업하면 번거로우니 고급 옵션도 한 번에 포함해달라"고 요청 — 기본 계산(간격/촬영시간/총 장수 3항목 상호 계산 + 결과 영상 길이)에 고급 옵션 2가지(저장 공간 계산, 셔터 각도/모션 블러 지표)를 처음부터 함께 구현.
- **신규**:
  - `src/lib/timelapse-calculator.ts` — `calculateShootPlan`(간격/촬영시간/총 장수 중 2개를 알면 나머지 1개를 역산하는 3-way 솔버, `shotCount = duration / interval` 관계 기반), `calculateVideoDurationSeconds`(장수/fps → 영상 길이), `calculateStorageGb`(장수 × 장당 용량 → 총 저장 공간), `calculateShutterAngle`(셔터 스피드/간격 비율 → 셔터 각도·모션 블러 품질 판정: choppy/cinematic/smooth), 포맷터 함수들.
  - `src/components/timelapse-calculator-card.tsx` — 촬영 계획(모드 선택 + 입력/읽기전용 필드), 결과 영상(fps 선택 + 영상 길이), 고급 옵션(저장 공간 계산 + 셔터 각도) 3개 섹션 카드 UI. 셔터 스피드 프리셋·포맷터는 노출 계산기(`src/lib/exposure-calculator.ts`)의 `SHUTTER_SPEED_STOPS_SECONDS`/`formatShutterSpeed`를 그대로 재사용(중복 구현 없이 DRY 유지).
  - `src/app/[locale]/tools/timelapse-calculator/page.tsx` — 기존 계산기 페이지들과 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용 — 사용자가 로컬에서 직접 선택 필요).
  - `messages/{en,ko,ja,es}.json`에 `TimelapseCalculator` 네임스페이스 전체 번역 추가.
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `timelapse-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건), `npm run build`(exit code 0, 240+/240+ 페이지 정상 생성). 로컬 `npm run dev`(포트 3000) + `curl`로 `/ko/tools/timelapse-calculator`, `/en/tools/timelapse-calculator`, `/ko/tools` 모두 200 및 실제 렌더링 텍스트("타임랩스 계산기", "셔터 각도", "저장 공간 계산") 확인.
- **커밋**: `b1a1dbb` "feat(tools): add Time-Lapse Calculator (with storage & shutter-angle options)"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용(권장 검색어: 좌="별 궤적이 담긴 야간 장노출", 우="빠르게 흐르는 구름 타임랩스") → 이후 4번 도구(별사진 NPF/500 rule 노출 계산기)로 순차 진행.

## 2026-09-23 — /tools 2번 도구: 노출 삼각형(Exposure Triangle) / 스탑 변환 계산기 추가

- 배경: 승인된 9개 도구 순서(2번)에 따라 진행. 조리개·셔터 스피드·ISO 중 하나를 원하는 값으로 바꿨을 때, 밝기를 그대로 유지하려면 다른 한 값을 얼마나 조정해야 하는지 계산하는 "상반칙(reciprocity)" 기반 도구.
- **신규**:
  - `src/lib/exposure-calculator.ts` — 조리개/셔터스피드/ISO 각각의 빛 기여도를 공통 log2("스탑") 척도로 환산(`조리개는 -2*log2(N)`, `셔터·ISO는 log2(value)`)해 기준 노출값을 그대로 유지하는 보정값을 역산. 표준 풀스탑 프리셋(조리개/셔터/ISO) 및 표시 포맷터 포함.
  - `src/components/exposure-calculator-card.tsx` — 기준 노출(조리개/셔터/ISO) 입력 + "변경할 값"/"보정할 값" 선택 UI + 실시간 결과 카드. DoF 계산기와 동일한 shadcn Select/Input 컴포넌트 재사용.
  - `src/app/[locale]/tools/exposure-stops-calculator/page.tsx` — DoF 계산기 페이지와 동일한 구조(브레드크럼, WebApplication+FAQPage+BreadcrumbList JSON-LD, 설명 섹션, FAQ 3문항), 공통 `<ToolExampleImages>`/`<ToolImageDevPanel>` 템플릿 재사용(실제 예시 사진은 아직 미적용 — 사용자가 로컬에서 직접 선택 필요, DoF 계산기와 동일한 절차).
  - `messages/{en,ko,ja,es}.json`에 `ExposureCalculator` 네임스페이스 전체 번역 추가.
- **수정**: `src/app/[locale]/tools/page.tsx`에서 `exposure-stops-calculator`를 `comingSoon` → `live`로 전환, `src/app/sitemap.ts`에 신규 경로 추가.
- **버그 수정(작업 중 발견)**: `compensateParam`을 `useEffect` 안에서 `setState`하는 방식으로 최초 작성했으나 `eslint`(`react-hooks/set-state-in-effect`)에서 캐스케이딩 렌더 위험을 지적 — 렌더링 중 파생값으로 계산하는 방식으로 리팩터링해 해결.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류 0건 — 위 버그 수정 후), `npm run build`(exit code 0, 240/240 페이지 정상 생성 — 이번엔 `.next` 폴더가 정상이라 `distDir` 임시 우회 없이 바로 성공. 알리익스프레스/쿠팡 API 호출 실패는 기존과 동일한 샌드박스 네트워크 제한). 로컬 `npm run dev`(포트 3000) + `curl`로 `/ko/tools/exposure-stops-calculator`, `/en/tools/exposure-stops-calculator`, `/ko/tools` 모두 200 및 실제 렌더링 텍스트("노출 삼각형 / 스탑 변환 계산기", "스탑 변화량") 확인.
- **커밋**: `0ef8c20` "feat(tools): add Exposure Triangle / Stop Converter calculator"
- **다음 단계**: push → 사용자가 로컬에서 이 도구의 좌/우 예시 사진 적용(권장 검색어: 좌="빠른 셔터로 정지된 동작", 우="느린 셔터로 흐려진 동작") → 이후 3번 도구(타임랩스 계산기)로 순차 진행.

## 2026-09-23 — 심도(DoF) 계산기 예시 이미지(좌/우) 실제 사진 적용

- 배경: 앞선 작업(공통 "예시 이미지" 템플릿 + 개발자 이미지 관리 도구)에서 실제 사진은 Claude의 브릿지 셸이 `api.unsplash.com`에 접근할 수 없어 미적용 상태로 남아 있었음. 사용자가 로컬에서 직접 `npm run dev`를 실행한 뒤 "🛠 예시 이미지 관리 (DEV)" 패널로 좌(근거리 초점)/우(원거리 초점) 사진을 직접 검색·적용 완료.
- **수정**:
  - `public/tools/images/dof-calculator-left.webp`(신규) — 근거리 초점 예시 사진 (Mario Verduzco, Unsplash).
  - `public/tools/images/dof-calculator-right.webp`(신규) — 원거리 초점 예시 사진 (Thanhy Nguyen, Unsplash).
  - `src/data/tool-images.json` — `dof-calculator` 항목에 위 두 이미지 경로 및 저작자 정보 반영.
- **커밋 시 유의**: 저장소에 이번 작업과 무관한 기존 변경(`CLAUDE.md`, `SEO_TASKS.md`, `automation/apply-seo-task.command`, `automation/publish-guide.command` 수정 및 일부 한글 파일명 삭제)이 함께 존재했으나, `git add -A`/`-u`를 쓰지 않고 이번 작업 대상 3개 파일만 명시적으로 `git add`하여 무관한 변경이 섞이지 않도록 함.
- **커밋**: `afe6133` "feat(tools): apply DoF calculator example images"
- **다음 단계**: push 후 로컬/실사이트에서 이미지 노출 최종 확인. 이어서 이미지에 나열된 순서대로 2번 도구(노출 삼각형/스탑 변환 계산기)로 진행.

## 2026-09-23 — 계산기 도구 페이지 공통 "예시 이미지" 템플릿 + 개발자 이미지 관리 도구 추가

- 배경: 심도(DoF) 계산기 페이지를 로컬에서 확인하던 사용자가, "제목 → 부연설명 → 계산기" 구조 사이에 좌/우 예시 사진(근거리 초점 예 / 원거리 초점 예)을 추가해 시각적으로 이해를 돕고 싶다고 요청. 이미지 출처는 가이드 아티클에서 이미 쓰고 있는 언스플래시(Unsplash) 연동을 재사용하고, 가이드처럼 이미지 교체 기능도 함께 원함. 또한 이 패턴을 모든 계산기 도구 페이지에 공통 적용 가능한 템플릿으로 만들어달라는 요청.
- **수정/신규**:
  - `src/data/tool-images.json`(신규) — slug + 위치(left/right) 기준으로 이미지 경로·저작자 정보 저장. 가이드와 달리 도구 페이지는 mdx가 없고 언어 무관하게 사진 1장을 공유하므로 언어별 frontmatter 대신 단일 JSON 파일 채택.
  - `src/lib/tool-images.ts`(신규) — `getToolImages(slug)` 로더. 이미지가 아직 없는 슬롯은 `undefined`로 안전하게 반환.
  - `src/components/tools/tool-example-images.tsx`(신규) — 모든 계산기 도구 페이지가 공통으로 쓰는 `<ToolExampleImages>` 템플릿. 좌/우 중 있는 것만 렌더링, 둘 다 없으면 아무것도 렌더링하지 않아 이미지 미설정 상태에서도 안전.
  - `src/lib/dev/tool-image-tool.ts`(신규) — 기존 가이드 이미지 도구(`guide-image-tool.ts`)의 Unsplash 검색 함수(`searchGuideImageCandidates`)를 그대로 재사용, 적용/업로드 로직만 도구 전용(slug+slot 저장)으로 신규 구현.
  - `src/app/api/dev/tool-image-apply/route.ts`, `src/app/api/dev/tool-image-upload/route.ts`(신규) — 가이드 이미지 도구와 동일하게 `NODE_ENV !== "development"`면 403 반환. 검색은 기존 `/api/dev/guide-image-search`를 그대로 재사용(신규 라우트 불필요).
  - `src/components/dev/tool-image-dev-panel.tsx`(신규) — 가이드 이미지 관리 패널과 동일한 UX(플로팅 패널, Unsplash 검색+선택 또는 직접 업로드)에 "왼쪽/오른쪽" 슬롯 선택 토글 추가. 모든 도구 페이지가 slug만 바꿔 재사용하는 공통 컴포넌트.
  - `src/app/[locale]/tools/dof-calculator/page.tsx` — `<ToolExampleImages slug="dof-calculator" .../>`를 부연설명과 계산기 카드 사이에 배치, 개발 모드 전용 `<ToolImageDevPanel>` 연결.
  - `messages/{en,ko,ja,es}.json`의 `DofCalculator` 네임스페이스에 `exampleLeftAlt`/`exampleRightAlt`(근거리/원거리 초점 예시 alt 텍스트) 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류·경고 0건), `npm run build`(`distDir`를 `.next-verify`로 임시 지정해 검증 — 236/236 페이지 정상 생성, `/api/dev/tool-image-apply`·`/api/dev/tool-image-upload` 라우트 정상 포함, exit code 0). 로컬 `npm run dev`로 `/en/tools/dof-calculator` 개발 모드 렌더링 확인 — "🛠 예시 이미지 관리 (DEV)" 플로팅 버튼 정상 노출, 이미지 미설정 상태에서도 페이지 정상 동작(크래시 없음).
- **알려진 제약(실제 사진 미적용 상태)**: 이 브릿지 환경(Claude의 원격 셸)은 조직 아웃바운드 정책상 `api.unsplash.com` 등 임의 외부 호스트로 나가는 요청이 차단되어 있어(`EAI_AGAIN`), Claude가 직접 Unsplash 검색·다운로드를 자동 수행할 수 없음(가이드 자동 발행 스크립트의 alibaba/coupang API 호출이 이 환경에서 항상 실패하는 것과 동일한 원인). 따라서 `dof-calculator`의 실제 좌/우 사진은 아직 비어 있는 상태 — 사용자가 실제 컴퓨터에서 직접 `npm run dev`를 실행한 뒤(Claude의 브릿지 셸이 아니라 사용자 본인이 직접 실행해야 정상적으로 인터넷에 연결됨), 페이지 우측 하단의 "🛠 예시 이미지 관리 (DEV)" 패널로 검색·선택해 채워야 함.
- **커밋**: `c47ca5e` "feat(tools): add shared example-image template + dev image tool for calculator pages"
- **다음 단계**: 사용자가 로컬에서 직접 `npm run dev`로 개발 서버를 띄운 뒤 심도 계산기 페이지의 이미지 관리 패널로 좌(근거리 초점)/우(원거리 초점) 사진을 선택·적용 → push. 이후 새로 만드는 도구 페이지들도 `<ToolExampleImages>` + `<ToolImageDevPanel>`을 동일하게 재사용.

## 2026-09-22 — /tools 허브 신설 및 심도(DoF)/과초점거리 계산기 추가 (기능 확장 1단계)

- 배경: 애드센스 심사와 별개로 exifnd.com에 카메라/사진 카테고리 신규 도구를 추가하는 확장 전략 논의(`claude/exiflens-tool-expansion-strategy-and-freeimgfix-benchmark.md`, 2026-09-21) 및 사용자가 제시한 9개 도구 후보 이미지(2026-09-22)를 바탕으로, 하위 경로(subpath) 확장 방식과 이미지에 나열된 순서(심도 → 노출 스탑 → 타임랩스 → 별사진 → 브라케팅 → 인쇄해상도 → 저장용량 → EXIF제거 → 크롭팩터)대로 진행하기로 사용자 승인.
- **작업 전 백업**: `_backups/backup_20260922_231810_tools_hub_and_dof_calculator/`에 수정 대상 파일(`page.tsx`, `site-header.tsx`, `messages/*.json`) 백업.
- **신규**: `/tools` 허브 페이지(`src/app/[locale]/tools/page.tsx`) — 촬영 현장 계산 도구 / 촬영 후·실무 도구 2개 섹션, 9개 도구 카드(1번만 활성 링크, 나머지는 "준비 중" 배지). 1번 도구 심도(DoF)/과초점거리 계산기 구현: `src/lib/dof-calculator.ts`(과초점거리 공식 H=f²/(N·c)+f 기반 근거리/원거리 초점 한계·전체 심도 계산, 센서 크기별 착란원 프리셋 5종 + 직접 입력), `src/components/dof-calculator-card.tsx`(ND 계산기와 동일한 클라이언트 즉시 계산 카드 UI), `src/app/[locale]/tools/dof-calculator/page.tsx`(설명/FAQ 3문항/면책 문구 + BreadcrumbList·WebApplication·FAQPage JSON-LD).
- **수정**: `src/components/site-header.tsx`/`site-footer.tsx`에 "Tools" 내비게이션 링크 추가(데스크톱/모바일 메뉴 모두), `src/app/sitemap.ts`에 `/tools`, `/tools/dof-calculator` 경로 추가, `messages/{en,ko,ja,es}.json`에 `Header.toolsNav`, `Footer.tools`, `ToolsHub`, `DofCalculator` 네임스페이스 전체 번역 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint`(신규/수정 파일 전체 오류·경고 0건), `npm run build`(브릿지 환경의 `.next` 캐시 폴더에 남은 macOS FUSE 잔여 파일로 빌드가 시작 단계에서 막혀, `next.config.ts`에 `distDir`를 임시로 `.next-verify`로 지정해 검증 후 원복 — Turbopack 컴파일 성공, TypeScript 통과, 234/234 페이지 전부 정상 생성. 알리익스프레스/쿠팡 API 호출 실패는 샌드박스 네트워크 제한에 의한 기존 현상으로 이번 작업과 무관. 마지막 "Finalizing" 단계의 `.next-verify/export-detail.json` unlink EPERM은 브릿지 환경 고유의 무해한 현상). 로컬 `npm run dev`(포트 3000) 실행 후 `curl`로 `/en/tools`, `/en/tools/dof-calculator`, `/ko/tools`, `/ko/tools/dof-calculator` 응답 코드(200) 및 실제 렌더링 텍스트(영/한 번역 정상 출력)까지 직접 확인.
- **참고(환경 이슈)**: 이번 커밋 과정에서 `git add`/`git commit`이 남긴 `.git/index.lock`이 브릿지 환경의 파일 삭제 제한으로 자동 정리되지 않아 커밋이 일시 중단됨 — 사용자가 해당 lock 파일을 직접 삭제해 재개. 향후 동일 현상이 반복될 수 있음(삭제 권한이 없으면 git의 임시 파일 정리가 실패하는 이 브릿지 환경 고유의 제약).
- **커밋**: `be9b042` "feat(tools): add /tools hub and Depth of Field / Hyperfocal Distance calculator"
- **다음 단계**: push, 실사이트에서 `/tools`, `/tools/dof-calculator` 최종 확인. 이어서 이미지에 나열된 순서대로 2번 도구(노출 삼각형/스탑 변환 계산기)부터 순차 진행 예정.

## 2026-09-19 — 홈 콘텐츠(빈 콘텐츠) 및 쿠키 동의 배너 공통 작업 — 항목 2: Google Consent Mode v2 쿠키 동의 배너 추가 (애드센스 제휴 마케팅 공통 대화방에서 진행)

- 배경: FlyDroneMap과 동일한 문제 — GA4와 애드센스가 모두 실제로 동작 중인데도 쿠키 동의 관리(CMP)가 전혀 없었음. FlyDroneMap에 먼저 적용한 Google Consent Mode v2 방식을 그대로 이식.
- **작업 전 백업**: `_backups/backup_20260919_114658_consent_banner/`에 수정 대상 파일 백업.
- **수정**: FlyDroneMap과 동일한 구성 — 신규 `src/lib/consent.ts`(EEA+영국+스위스 국가 코드 목록 + `needsConsentBanner`), `src/app/[locale]/layout.tsx`의 GA4 inline script에 `gtag('consent','default',{...})` 추가(region 범위 한정), Vercel `x-vercel-ip-country` 헤더로 `needsConsent` 계산, 신규 `src/components/consent-banner.tsx`(`useSyncExternalStore` 기반, 선택 로컬스토리지 저장), `messages/{en,es,ja,ko}.json`에 `Consent` 네임스페이스 추가.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint src`(오류/경고 0건), `npm run build`(오래된 `.next`를 `.next_stale_*`로 옮긴 뒤 재시도 — Turbopack 컴파일 성공, TypeScript 통과, 210/210 페이지 전부 정상 생성. `.next/export-detail.json` unlink EPERM은 브릿지 환경 고유의 무해한 현상).
- **커밋**: `d6c259f`
- **다음 단계**: push, 실사이트에서 배너 노출/미노출 조건 및 동의 후 GA4 반영 최종 확인.

## 2026-09-19 — 홈 콘텐츠(빈 콘텐츠) 및 쿠키 동의 배너 공통 작업 — 항목 1: 장비 추천 섹션 SSR 시드 적용 (애드센스 제휴 마케팅 공통 대화방에서 진행)

- 배경: FlyDroneMap과 동일한 문제 — 홈 화면 "장비 추천"(GearRecommendation) 섹션이 서버 렌더링 시점에는 로딩 스켈레톤만 그려지고 실제 상품은 클라이언트에서만 fetch됨. FlyDroneMap에 먼저 적용한 방식을 ExifLens 고유 구조(ND 필터 선택 `useNdCalculatorStore`/`filterId`, 기본값 `"nd1000"`)에 맞춰 이식.
- **작업 전 백업**: `_backups/backup_20260919_090702_gear_ssr_content/`에 수정 대상 4개 파일 백업.
- **수정**:
  - 신규 `src/lib/gear-recommendation-ssr.ts` — 서버 전용 헬퍼. 캐시(6시간 revalidate) 적용 `searchCoupangProducts`/`searchAliexpressProducts`를 ExifLens ROW1 키워드("에이치앤와이 nd" / "nisi nd")로 호출해 2개 상품 미리 조회. 실패 시 `null` 반환.
  - `src/components/gear-recommendation-section.tsx`, `src/components/gear-recommendation.tsx` → FlyDroneMap과 동일 패턴으로 `initialData`/`getServerSnapshot` 연결.
  - `src/components/coupang-gear-cards.tsx` → `filterId`(현재 서버 라우트가 실제로는 읽지 않는 코스메틱 값)를 고려해, SSR로 시드된 `nd1000` 상태가 실 fetch 완료 전 성급히 "stale" 처리되지 않도록 조건 보정.
  - `src/components/aliexpress-gear-cards.tsx` → FlyDroneMap과 동일 패턴(초기값 시드, 실패해도 시드 유지), 기존 ExifLens 파일의 "Ads Block" 개발자 도구 주석/구조는 그대로 보존.
- **참고(설계 조정)**: FlyDroneMap과 동일하게, 계획서의 "고정 큐레이션(하드코딩)" 대신 기존 캐시된 서버 함수를 재사용하는 방식으로 구현(트래킹 URL 포함 상품 데이터를 브라우저 도구로 직접 추출하는 것이 안전상 차단되어 하드코딩이 불가능했음). 사용자 승인 의도는 동일하게 충족.
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint src`(오류/경고 0건), `npm run build`(오래된 `.next`를 `.next_stale_*`로 옮긴 뒤 재시도 — Turbopack 컴파일 성공, TypeScript 통과, 210/210 페이지 전부 정상 생성. 샌드박스 네트워크 제한으로 API 호출이 `EAI_AGAIN`으로 실패했으나 catch 로직이 정상적으로 `null` 반환 — 안전 폴백 정상 동작 확인. 실제 상품 시드가 채워지는지는 실배포 환경에서 별도 확인 필요. `.next/export-detail.json` unlink EPERM은 브릿지 환경 고유의 무해한 현상).
- **커밋**: `afc5828` "fix: SSR seed real gear-recommendation products to avoid empty homepage content"
- **다음 단계**: push, 실배포 환경에서 최종 확인. 이어서 항목 2(쿠키 동의 배너)를 3개 프로젝트 공통으로 진행 예정.

## 2026-09-17 — 가이드 목록 페이지: 카테고리별 "더보기" 펼치기 기능 추가 (애드센스 제휴 마케팅 공통 대화방에서 진행)

- 배경: 가이드 게시글이 계속 늘어나면서 `/guides` 목록 페이지가 카테고리마다 전체 글을 다 나열해 세로 스크롤이 과도하게 길어짐. ExifLens/FlyDroneMap/firelic 3개 프로젝트에 동일하게 적용하기 위해 신설된 공통 대화방에서 작업 진행(FlyDroneMap에 먼저 적용한 뒤 이식).
- **작업 전 백업**: `_backups/backup_20260916_234232_guides_showmore/`에 `src/app/[locale]/guides/page.tsx`, `messages/{en,ko,ja,es}.json` 백업.
- **수정**: 카테고리별 카드 그리드를 신규 클라이언트 컴포넌트 `src/components/guides/guide-category-section.tsx`로 분리, 카테고리당 기본 4개(2행)만 노출하고 그 이상은 "더보기" 버튼(shadcn `Button`, outline/sm)으로 펼치도록 구현. 버튼은 카테고리별로 독립적으로 동작. `src/app/[locale]/guides/page.tsx`는 이 컴포넌트를 사용하도록 수정(카테고리 그룹이 `[category, guides]` 튜플 배열인 ExifLens 고유 구조에 맞춰 연결), 더 이상 쓰이지 않는 `Link` import 제거.
- **i18n**: `messages/{en,ko,ja,es}.json`의 `Guides` 네임스페이스에 `showMore`/`showLess` 키 추가(ko: 더보기/접기, en: Show more/Show less, ja: もっと見る/閉じる, es: Ver más/Ver menos).
- **검증**: `npx tsc --noEmit`(오류 0건), `npx eslint src`(오류/경고 0건), `npm run build`(오래된 `.next` 잔재를 `.next_old_*`로 옮긴 뒤 재시도 — Turbopack 컴파일 성공, TypeScript 통과, 202개 페이지 전부 정상 생성. 마지막 "Finalizing" 단계의 `.next/export-detail.json` unlink EPERM은 이 브릿지 환경 고유의 무해한 현상).
- **다음 단계**: 로컬 커밋 완료 후 사용자가 저장소 루트의 push용 `.command` 스크립트를 실행해 push, 실사이트에서 카테고리별 더보기 동작 최종 확인 필요. 동일 작업을 firelic에도 이어서 적용 예정.

## 2026-09-14 (추가) — 홈 화면 가이드 썸네일 이미지 sizes 속성 보정 + browserslist 명시로 레거시 JS 폴리필 제거 (PageSpeed 진단 반영)

- 배경: PageSpeed Insights(모바일) 재측정 결과 exifnd.com에서 firelic.com과 동일한 두 가지 진단이 발견됨. (1) "이미지 전송 개선"(약 21KiB)이 `src/components/home-guide-highlights.tsx`의 가이드 썸네일 이미지 1건으로 전부 집계. (2) "레거시 JavaScript"(14KiB) — `Array.prototype.at/flat/flatMap`, `Object.fromEntries/hasOwn`, `String.prototype.trimEnd/trimStart` 폴리필이 번들에 항상 포함됨.
- 원인 (1): `<Image sizes="(min-width: 640px) 33vw, 100vw" .../>`의 모바일 분기(`100vw`)가 카드에 중첩된 패딩(바깥 컨테이너 `px-4` 32px + 카드 `p-4` 32px, 합계 약 64px)을 반영하지 못해, Next.js가 실제 렌더링 폭(약 346px)보다 큰 이미지 버킷을 요청.
- 원인 (2): `package.json`에 `browserslist` 설정이 없어 Next.js 빌드가 오래된 브라우저까지 지원하는 기본값을 사용, 최신 브라우저에서는 불필요한 폴리필이 번들에 항상 포함됨.
- 수정 (1): `src/components/home-guide-highlights.tsx`의 `sizes` 값을 `"(min-width: 640px) 33vw, 100vw"` → `"(min-width: 640px) 33vw, calc(100vw - 64px)"`로 변경. 데스크톱(640px 이상) 분기는 그대로 유지, 시각적/레이아웃 변경 없음.
- 수정 (2): `package.json`에 `browserslist`를 FlyDroneMap에서 이미 사용자 승인 후 적용한 것과 동일한 기준(`chrome 64, edge 79, firefox 67, opera 51, safari 12` — 모두 2018년 이후 브라우저)으로 명시. **트레이드오프 안내**: 이 기준보다 오래된 브라우저 사용자는 빌드 타겟에서 명시적으로 제외됨(실무적으로 비중이 매우 작은 수준으로 판단, 동일한 정책에 대해 사용자 사전 확인 후 진행).
- 검증: 작업 전 `_backups/exiflens_backup_20260913_201338_sizes속성및browserslist수정전.tar.gz`로 백업 생성. `npx tsc --noEmit`, `npx eslint src/components/home-guide-highlights.tsx` 모두 통과. `npm run build` 정상 완료(전체 페이지 정상 생성). 로컬 `next start`(포트 4125)로 실행 후 `curl`로 `/en` 렌더링 HTML을 직접 확인해 새 `sizes` 값이 실제 서버 응답에 정상 반영됨을 확인. 레거시 JS 폴리필 감소분은 배포 후 PageSpeed 재측정으로 최종 확인 예정.
- 참고(별도 처리, 이번 세션에서 미착수): "사용하지 않는 자바스크립트"(265KiB) 중 약 219KiB(Google Ads/Doubleclick)와 167KiB(Google Tag Manager)는 제3자 스크립트로 저희가 손댈 수 없는 영역. 자사 몫(약 46KiB)과 자바스크립트 실행 시간(1.4초) 항목은 이름 없는 해시 청크에 분산되어 있어, 추측성 수정 대신 webpack-bundle-analyzer를 이용한 별도의 정밀 조사가 필요하다고 판단해 이번 세션에서는 손대지 않음. "효율적인 캐시 수명 사용"(16KiB) 역시 100% Google Ads 스크립트(제3자)로 개선 여지 없음. "렌더링 차단 요청"(180ms)/"네트워크 종속 항목 트리"는 Next.js가 자동 생성하는 CSS 청크 1개가 원인으로, 프레임워크 내부 동작이라 이번 세션에서는 손대지 않음.

## 2026-09-14 (추가) — 사진 업로드 입력창 접근성 라벨 추가 (PageSpeed Insights 진단 반영)

- 배경: 제미나이 SEO/GEO 진단에 이어 PageSpeed Insights(pagespeed.web.dev)로 3개 사이트를 실측한 결과, exifnd.com의 접근성 점수(95점) 및 신규 "에이전트형 브라우징" 항목(1/2) 감점 사유가 "Form elements must have labels" — 즉 숨김 처리된 파일 업로드 `<input type="file">`에 스크린리더/AI 에이전트가 인식할 수 있는 이름이 연결되어 있지 않은 것으로 확인됨.
- 수정: `src/components/exif-uploader.tsx`의 숨김 파일 입력(`className="sr-only"`)에 `aria-label={t("uploaderTitle")}` 추가. 기존 번역 문구("Drag & Drop photo here to auto-extract EXIF" 등)를 그대로 재사용해 별도 번역 키 추가 없이 4개 언어 모두 자동 반영됨. 시각적 UI·동작 변경 없음.
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일), `npm run build` 통과. `next start` 로컬 서버로 렌더링된 HTML에 `aria-label="Drag & Drop photo here to auto-extract EXIF"`가 정상 출력되는 것 확인.
- 작업 전 `_backups/exiflens_backup_*_업로드접근성라벨전`으로 백업 완료.


## 2026-09-13 (추가) — RSS 메타 태그 및 푸터 아이콘 추가

- 배경: RSS 피드(`/rss.xml`)를 만들었지만 화면상 확인 방법과 검색엔진에 알리는 표준 신호가 없었음.
- 수정1(SEO용, 비노출): `src/app/[locale]/layout.tsx`의 `generateMetadata()` alternates에 `types: { "application/rss+xml": SITE_URL + "/rss.xml" }` 추가 → `<head>`에 `<link rel="alternate" type="application/rss+xml" href=".../rss.xml">` 자동 생성.
- 수정2(시각적 확인용): `src/components/site-footer.tsx` 네비게이션의 "문의하기" 링크 바로 오른쪽에 `lucide-react`의 `Rss` 아이콘 링크 추가(`/rss.xml`로 이동). 기능적 차이는 없고, 완성도 있는 사이트로 보이도록 하는 목적.
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일), `npm run build` 통과. `next start` 로컬 서버로 실제 렌더링된 HTML에서 `<link rel="alternate" type="application/rss+xml">` 태그와 푸터 아이콘(`aria-label="RSS feed"`) 둘 다 정상 출력 확인.
- 작업 전 `_backups/exiflens_backup_*_RSS메타태그_푸터아이콘전`으로 백업 완료.



## 2026-09-13 (추가) — RSS 피드 신규 추가 (네이버 크롤링 유도)

- 배경: 네이버 서치어드바이저에서 exifnd.com 색인이 메인페이지 1건뿐이고 수집 활동이 8/29~9/1 이후 멈춘 것을 발견. `robots.ts`/`sitemap.ts` 모두 정상(전체 정적 경로 + 가이드 34개×4개 언어 포함, 사이트맵도 26.08.27 제출 확인)임을 확인해 코드 결함은 아니었으나, RSS 피드가 아예 없어 신규/갱신 콘텐츠를 크롤러에게 더 빠르게 알릴 방법이 부족했음.
- 수정: 신규 `src/app/rss.xml/route.ts` — 기존 `getAllGuidesMeta()`를 재사용해 4개 언어(en/es/ja/ko) 가이드 전체를 최신순으로 모아 RSS 2.0 규격 XML을 직접 생성(별도 패키지 의존성 없음), 최근 50건으로 제한.
- 검증: `npx tsc --noEmit`, `npx eslint src/app/rss.xml/route.ts`, `npm run build`(라우트가 `/rss.xml`로 정상 빌드됨) 통과. `next start`로 로컬 서버 구동 후 `curl`로 실제 XML 응답 확인, `xmllint --noout`으로 XML 유효성 검증 완료(정상).
- 참고: exifnd.com(ExifLens)에만 우선 적용. flydronemap.com/firelic.com은 사용자 확인 후 동일 패턴으로 순차 적용 예정.
- 작업 전 `_backups/exiflens_backup_20260913_151304_RSS추가전` 폴더로 전체 백업 완료.



## 2026-09-13 (추가) — AdSense 승인 전까지 광고 placeholder 박스 임시 숨김

- 배경: 애드센스 재신청 전 정밀 진단 요청 결과, "Ad · 300×250" 같은 빈 광고 자리표시자 박스가 그대로 노출되면 "준비되지 않은 사이트"로 판단되어 승인 거절 위험이 있다는 지적을 받음(exifnd.com/flydronemap.com/firelic.com 3개 사이트 공통 요청).
- 검증: 다른 지적 사항(exifnd.com 가이드 수가 flydronemap보다 적다)은 실제로는 두 사이트 모두 34개로 동일해 사실이 아님을 확인, 불필요한 작업 방지.
- 수정: `src/components/ad-zone.tsx`에 `ADSENSE_APPROVED`(현재 false) 상수 추가, false일 때 아무것도 렌더링하지 않도록 처리. 승인 후 상수만 true로 되돌리면 복원됨(호출부 변경 불필요).
- 검증: `npx tsc --noEmit`, `npx eslint`, `npm run build` 통과. 빌드된 정적 HTML에서 광고 박스(`data-ad-slot`) 마크업이 완전히 제거되고 가이드 섹션 등 다른 콘텐츠는 그대로 유지되는 것 확인.
- 작업 전 `_backups/exiflens_backup_*_광고박스숨김전`으로 백업 완료.


## 2026-09-13 — 홈페이지에 가이드 하이라이트 섹션 추가 (AdSense 재심사 대응)

- 배경: exifnd.com이 애드센스 승인 거절(사유: Low Value Content), 이어서 flydronemap.com도 거절. 사용자가 제미나이에게 원인 분석을 요청해 받은 진단 문서 2건(exifnd 전용 1건 + 3개 사이트 공통 1건)을 실제 코드 상태와 대조 검증.
- 검증 결과: 문서가 지적한 "가이드 링크/법적 페이지 부재"는 이미 예전에 해결되어 사실과 다름(헤더 `/guides` 링크, 푸터 개인정보/약관 링크 모두 기존 구현 확인). 가이드 상세 페이지의 alt 태그 커버 이미지, "툴로 돌아가기" CTA도 이미 구현되어 있었음. 반면 두 문서가 공통으로 지적한 "홈페이지 자체의 텍스트/링크 부족"은 실제로 미해결 상태였음(usage 안내 문구 약 265자 수준, 가이드로 연결되는 카드 섹션 없음).
- 수정: 신규 `src/components/home-guide-highlights.tsx` — 최신 가이드 3개를 제목+요약+커버 이미지(alt 포함, 기존 이미지 자산 재사용)+링크 카드로 홈페이지 하단(usage 섹션 아래)에 노출. `/guides` 전체 목록 링크 포함.
- 수정: `src/app/[locale]/page.tsx`에 위 섹션 연결.
- 수정: `messages/{ko,en,ja,es}.json`의 `Home` 네임스페이스에 `guideHighlightsTitle`/`guideHighlightsSubtitle`/`guideHighlightsCta` 3개 키 추가.
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일), `npm run build`(전체 빌드, 홈페이지 정적 HTML에 신규 문구 실제 렌더링 확인) 모두 통과.
- 작업 전 `_backup_20260912_*` 폴더로 3개 저장소 전체 백업 완료(node_modules/.next/.git/백업폴더 제외).


## 2026-09-08 (추가) — 방문자 카운터를 "당일 방문 / 누적 방문"으로 분리

- 배경: 방문자 카운터를 누적 숫자 하나만이 아니라 "당일 방문"과 "누적 방문"으로 나눠서 보고 싶다는 요청. 처음에는 방문자 각자의 국가(로컬 시간대) 자정 기준으로 "당일"을 리셋하는 방식을 요청받았으나, 이 경우 같은 순간에도 보는 사람마다 "오늘" 숫자가 달라지는 문제가 있어 조사 후 재확인: GA4의 "보고 시간대" 및 대부분의 방문자 카운터 도구가 방문자별 로컬 시간이 아니라 사이트 운영자가 지정한 시간대 하나로 통일해서 "하루" 경계를 정한다는 점을 사용자에게 공유하고, 동일한 방식(한국시간 KST 자정 기준)으로 진행하기로 합의.
- 수정: `src/lib/visitor-counter.ts` — 누적 카운트(`<project>:visitor_count`)에 더해 KST 날짜별 카운트(`<project>:visitor_count:daily:YYYY-MM-DD`)를 함께 증가/조회하도록 `getVisitorCounts()`/`incrementVisitorCounts()`로 확장. 날짜별 키는 TTL(2일)을 걸어 오래된 날짜 버킷이 자동 정리되도록 함.
- 수정: `src/app/api/visitor-count/route.ts` — 응답을 `{ count }`에서 `{ daily, total }`로 변경.
- 수정: `src/components/visitor-counter.tsx`(firelic은 `VisitorCounter.tsx`) — "Today N · Total N" 형태로 두 숫자를 함께 표시하도록 변경. 다국어(en/es/ja/ko) 사이트 전반에 노출되는 항목이라, 별도 번역 키를 추가하는 대신 기존 "Visitors: N" 표기와 동일하게 영문 라벨을 그대로 사용(사용자가 예시는 다듬어도 된다고 확인).
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일), `npm run build`(전체 빌드, 기존 페이지 SSG 유지 확인) 모두 통과.

## 2026-09-08 (추가) — 방문자 카운터 + 개발자 방문 제외(GA/카운터) 기능 추가

- 배경: 배포된 사이트에 방문자 수를 표시하고 싶으나, 개발자 본인의 방문(집 + 외부에서 모바일 북마크로 접속하는 경우 모두)은 집계에서 제외하고 싶다는 요청. IP 기반 제외는 외부 접속 시 걸러내지 못하는 문제가 있어(사용자 확인), 네트워크/위치와 무관하게 동작하는 쿠키 기반 방식으로 설계.
- 추가: `src/proxy.ts` — `?dev=<DEV_EXCLUDE_TOKEN>` 쿼리 파라미터로 접속하면 1년 만료 `dev_exclude` 쿠키를 심는 로직 추가(기존 geo-country 쿠키 로직과 나란히 동작).
- 추가: `src/app/[locale]/layout.tsx` — GA4 인라인 스크립트에서 `dev_exclude` 쿠키가 있으면 `gtag('config', ...)` 호출(및 그로 인한 페이지뷰 수집)을 건너뛰도록 수정.
- 추가: `src/lib/visitor-counter.ts`, `src/app/api/visitor-count/route.ts` — Vercel KV(Upstash Redis)를 raw fetch(REST API)로 호출해 방문자 수를 증가/조회. `dev_exclude` 쿠키가 있으면 증가 없이 조회만 수행. Redis 키는 `exiflens:visitor_count`로, FlyDroneMap/firelic과 공유하는 Vercel KV 인스턴스 1개를 프로젝트별 키 접두어로 구분해서 사용.
- 추가: `src/components/visitor-counter.tsx` — 클라이언트 컴포넌트로 카운트를 fetch해 표시. `src/components/site-footer.tsx` 푸터에 배치.
- 추가: `.env.example`에 `KV_REST_API_URL`/`KV_REST_API_TOKEN`/`DEV_EXCLUDE_TOKEN` 안내 추가.
- 검증: `npx tsc --noEmit`, `npx eslint`(변경 파일) 통과. `npm run build`로 전체 빌드 확인 — 기존 페이지들은 여전히 SSG(●)로 정적 생성되고, `/api/visitor-count`만 동적(ƒ)으로 분리되어 있어 정적 생성에 영향 없음을 확인.
- 참고: Vercel 대시보드에서 KV(Upstash Redis) 스토리지를 exiflens/flydronemap/firelic 3개 프로젝트에 공유 연결 완료(사용자 작업). `DEV_EXCLUDE_TOKEN` 값은 각 프로젝트의 Vercel 환경변수에도 별도로 등록 필요(사용자 작업, 다음 배포 전).

## 2026-09-07 (추가) — 쿠팡파트너스 subId 트래킹 파라미터 실제 연동

- 배경: 사용자가 `.env.local`에 `COUPANG_PARTNER_SUBID` 값을 직접 입력했으나, 점검 결과 `src/lib/coupang.ts`를 포함한 코드베이스 어디에서도 이 환경변수를 읽어서 사용하는 곳이 없어 실제로는 아무 효과가 없는 상태였음(값만 존재, 미배선).
- 수정: `src/lib/coupang.ts`의 `searchCoupangProducts()` — `COUPANG_PARTNER_SUBID`가 설정되어 있으면 쿠팡 상품 검색 API 요청에 `subId` 파라미터로 함께 전달하도록 추가. 이렇게 하면 응답으로 받는 `productUrl`에 subId가 자동으로 포함되어, 쿠팡 파트너스 대시보드에서 이 subId 기준으로 클릭/매출 성과를 구분해서 확인할 수 있음. 값이 없으면 기존과 동일하게 파라미터 자체를 생략(빈 값으로 보내지 않음).
- 검증: `npx tsc --noEmit`, `npx eslint src/lib/coupang.ts` 모두 통과. 실제 API 호출 결과(subId가 반영된 링크가 실제로 반환되는지)는 클라우드 세션에서 검증 불가 — 로컬 개발 서버 재시작 후 확인 필요.
- 작업 전 `_backups/coupang.ts.backup_20260907_082003`로 해당 파일 백업.

## 2026-09-08 — 가이드 자동 발행 결과물 zip 자동 압축 해제 지원

- 배경: 매일 자동 발행 예약 작업 결과물이 zip 1개로 전달되도록 이미 바뀌어 있었으나(2026-09-06), `automation/publish-guide.command` 자체는 여전히 개별 mdx/json/txt 파일만 인식해 사용자가 매번 수동으로 압축을 풀어야 했음. firelic에 이미 적용된 동일 기능(2026-09-07)을 ExifLens에도 이식.
- 수정: `automation/publish-guide.command` — 스크립트가 자신과 같은 폴더(`automation/`)에서 zip 파일을 발견하면 기존 콘텐츠 파일 탐색 전에 자동으로 압축을 해제(unzip 후 원본 zip 삭제)하도록 단계 추가. 개별 파일로 전달되는 경우(과거 방식)도 그대로 호환됨.
- 검증: `bash -n`으로 문법 검사 통과. 실제 예약 작업 zip을 이용한 전체 흐름(압축해제→콘텐츠 반영→이미지 첨부→커밋→push)은 다음 자동 발행(익일 오전 6시) 결과로 확인 필요.

## 2026-09-06 — 비(非)한국 방문자용 알리익스프레스 어필리에이트 연동

- 신규 기능(같은 날, 사용자 제안): 개발자 전용 "Ads Block" — 로컬 개발 서버(ExifLens 실행.command, NODE_ENV=development)에서 홈페이지에 노출된 알리익스프레스 상품 카드를 클릭해도 실제 상품 페이지로 이동하지 않고(개발자 본인의 클릭 어뷰징 방지) 카드 테두리만 선택 표시되도록 하고, 여러 개를 선택한 뒤 "Ads Block" 버튼 한 번으로 한꺼번에 차단 등록하는 기능 추가
  - 신규 파일: `src/lib/aliexpress-blocklist.ts` — `src/lib/aliexpress-blocked-products.json`(상품ID/이름/차단일시 배열)을 읽고 쓰는 서버 전용 헬퍼. `getBlockedProductIds()`는 실제 검색 라우트에서, `addBlockedProducts()`는 아래 개발자 전용 라우트에서 사용
  - 신규 파일: `src/lib/aliexpress-blocked-products.json` — 최초 빈 배열(`[]`)로 시작. 실제 방문자 화면에도 반영되어야 하는 데이터이므로 git 추적 대상(커밋에 포함)
  - 신규 파일: `src/app/api/dev/aliexpress-block/route.ts` — 기존 `guide-image-*` 개발자 도구 라우트와 동일한 패턴(`NODE_ENV !== "development"`면 403)으로 선택된 상품(productId/productName)을 받아 `addBlockedProducts()` 호출
  - 수정: `src/components/aliexpress-gear-cards.tsx` — `IS_DEV`(=`process.env.NODE_ENV === "development"`, 프로덕션 빌드에서 데드코드 제거됨)일 때만 카드 클릭을 `preventDefault()`하고 선택 상태(빨간 테두리)를 토글, 화면 좌측 하단에 선택 개수 표시 + "Ads Block" 버튼(선택 0개면 비활성) 플로팅 패널 추가. 차단 성공 시 낙관적 업데이트로 화면에서도 즉시 제거
  - 수정: `src/app/api/aliexpress/search/route.ts` — `isRelevantProduct()`가 제목 블랙리스트와 함께 `getBlockedProductIds()`로 얻은 productId 차단 목록도 함께 확인하도록 확장. 기존 `BLACKLIST_TITLE_WORDS`(패턴/공통 단어 기반)와 이번 productId 기반 차단은 서로 보완 관계 — 패턴화하기 애매한 개별 상품은 이 기능으로, 반복되는 카테고리 패턴은 계속 `BLACKLIST_TITLE_WORDS`에 수동 추가
  - 범위 밖으로 확정: 차단 해제(관리) UI는 만들지 않음 — 필요 시 `aliexpress-blocked-products.json`을 직접 열어 해당 줄만 지우면 됨
- 검증: `npx tsc --noEmit`, 변경/신규 파일 `npx eslint`, `npm run build` 모두 통과(`/api/dev/aliexpress-block` 라우트 정상 등록 확인). 실제 클릭→차단→화면 반영 흐름은 클라우드 샌드박스에서 실시간 API 호출이 차단되어 있어 검증 불가 — 사용자 로컬 환경에서 실제 클릭 테스트 필요

- 블랙리스트 추가(같은 날, 사용자 캡처 화면 기준): es 로케일에서 "Equipo de Perforación de Pozos de Agua Portátil"(휴대용 소형 우물 굴착 장비), "703-82563 703-82563-02 Interruptor de Trim y Tilt"(보트 모터 트림/틸트 스위치)가 카메라 액세서리 자리에 노출되는 것을 확인해 `BLACKLIST_TITLE_WORDS`에 `perforación de pozos`/`water well drilling`, `trim y tilt`/`trim and tilt` 추가. 상품 제목이 target_language(en/ja/es)에 따라 언어가 달라지므로, 앞으로 추가할 때도 화면에 보인 언어 그대로 넣으면 되고 필요시 다른 언어 버전도 함께 추가하도록 코드 주석에 명시

- 개선(추가, 같은 날, 사용자 지정): `src/app/api/aliexpress/search/route.ts`의 검색 키워드를 사용자가 직접 지정한 제조사 브랜드명으로 전면 교체 — 1열(ND 필터): `nisi nd`/`benro nd`/`neewer nd`/`haida nd`/`freewell nd` (5개), 2열(액세서리): `smallrig`/`tilta`/`ulanzi`/`falcam`/`lexar`/`telesin` (6개, 기존 3개에서 확대). 각 열 노출 개수는 기존과 동일하게 5개 유지, 열 내 상품 선택/순서는 계속 무작위. 직전에 추가한 `BLACKLIST_TITLE_WORDS` 2차 필터는 브랜드명 검색에서도 안전장치로 그대로 유지 — 사용자가 필요할 때마다 이 배열에 단어만 추가하면 즉시 반영되는 구조
- 버그 수정(같은 날): 사용자가 "2열이 5개 노출 중 4개만 뜬다"고 제보. 원인은 `randomDistribution` 함수가 각 키워드 풀의 실제 재고(검색 결과 개수)를 고려하지 않고 무작위로 배정해, 재고가 적은 키워드에 필요 이상으로 배정되면 그 초과분이 그냥 버려지는 로직 결함이었음 — 액세서리 키워드가 6개로 늘면서 재고 편차가 커져 이 결함이 더 자주 드러날 상황이었음. `randomDistribution`을 각 풀의 남은 여유(capacity)만 배정하고 여유 없는 풀은 배정 대상에서 제외해 다른 풀로 넘기도록 수정 — 전체 재고 합이 노출 개수 이상이면 항상 5개를 채우도록 보장
- 검증: `npx tsc --noEmit`, 변경 파일 `npx eslint` 통과. 실제 브랜드 키워드 검색 결과 품질 및 5개 노출 여부는 클라우드 샌드박스에서 실시간 API 호출이 차단되어 있어 검증 불가 — 사용자 로컬 환경에서 확인 필요

- 후속 확인(같은 날): 동시 병렬 호출로 되돌린 뒤 en/ja/es 언어를 여러 번 전환하며 테스트한 결과 `IncompleteSignature` 오류가 재발하지 않음을 사용자가 확인 — 애초에 요청 빈도는 원인이 아니었고 App Secret 오탈자만이 실제 원인이었던 것으로 최종 확인됨. 순차 호출용으로 추가했던 `sleep()`/`runSequential()`/`Settled<T>` 헬퍼는 모두 제거하고 쿠팡과 동일한 병렬(`Promise.all`) 방식을 최종 유지
- 버그 수정(추가, 같은 날): 위 테스트 과정에서 사용자가 실제 화면 캡처로 "ND 필터 검색 결과에 로봇 장난감, 폰 케이스, 완구용 카메라, 범용 메모리스틱 등 무관한 상품이 함께 노출된다"는 상품 타겟팅 부정확 문제를 제보. 알리익스프레스 검색 API 자체의 연관도 판정이 느슨해 `camera bag`/`camera tripod`/`camera memory card` 같은 짧은 키워드가 카메라와 무관한 상품까지 폭넓게 매칭시키는 것이 원인으로 파악됨. `src/app/api/aliexpress/search/route.ts`에 두 가지 대응을 함께 적용: (1) 액세서리 검색 키워드를 더 구체적인 문구로 교체(`DSLR camera bag case`, `camera tripod stand`, `SD memory card for camera`), (2) API 응답으로 받은 상품 제목에 `robot`/`toy`/`phone case`/`smart watch`/`bluetooth speaker` 등 무관 카테고리 단어가 포함되면 걸러내는 `BLACKLIST_TITLE_WORDS` 기반 2차 필터(`isRelevantProduct`) 신규 추가. 카테고리 ID 기반 제한(더 근본적이지만 별도 API 조회/검증 필요)은 이번 범위 밖으로 보류, 추후 이 방식으로도 부족하면 재검토
- 검증: `npx tsc --noEmit`, 변경 파일 `npx eslint` 통과. 실제 필터링 효과는 클라우드 샌드박스에서 실시간 API 호출이 차단되어 있어 검증 불가 — 사용자 로컬 환경에서 언어 전환 후 무관 상품 노출 여부 확인 필요

- 버그 수정(추가, 같은 날): App Secret 오탈자를 사용자가 직접 콘솔에서 재확인/재입력한 뒤에도 여전히 간헐적으로 `IncompleteSignature` 오류가 났지만, 동시에 "잠깐이지만 광고가 뜨는 것을 확인"했다는 결정적 단서로 원인이 자격증명이 아니라 요청 빈도라고 추정함. `/api/aliexpress/search`가 ND 필터 키워드 4개 + 액세서리 키워드 3개, 총 7건을 매번 동시에 병렬 호출하고 있었는데, Test 상태 앱은 초당 요청 한도가 매우 낮은 것으로 보여 이 병렬 호출이 거의 매번 일부(혹은 전부) 요청을 실패시키고 있을 가능성을 의심. `src/app/api/aliexpress/search/route.ts`를 병렬(`Promise.all`) 대신 300ms 간격을 둔 순차 호출로 임시 변경 — 응답은 느려지지만(약 7×0.3초) 성공률이 크게 개선될 것으로 기대
- 후속 확인(같은 날): 로케일 기본값 버그(아래 항목)까지 해결한 뒤 알리익스프레스 광고가 실제로 안정적으로 뜨는 것을 확인했는데, 사용자가 "그 시점에 App Secret 오탈자 수정과 순차 호출 변경이 동시에 있었으니 어느 쪽이 진짜 원인이었는지 알 수 없다"는 점을 정확히 지적. 두 원인이 뒤섞여 있어 사후적으로 판별이 불가능하므로, 자격증명이 이미 정상인 지금 상태에서 실험으로 가리기 위해 `route.ts`를 다시 원래의 동시 병렬 호출(`Promise.all`)로 되돌리고 사용자 환경에서 언어를 여러 번 전환하며 `IncompleteSignature` 재발 여부 테스트 진행 중. 재발하면 순차 호출로 다시 되돌리고, 재발하지 않으면 이 항목의 "요청 빈도가 원인" 서술은 부정확했던 것으로 정정하고 쿠팡과 동일한 병렬 방식을 최종 유지 (다음 항목에서 결과 반영 예정)
- 배경: 홈페이지 "장비 추천" 섹션은 한국에서는 쿠팡 파트너스 상품이 노출되지만, 실제 코드를 확인한 결과 한국 이외 국가에서는 `AffiliateProvider`가 애초에 `"coupang" | "amazon" | null` 타입만 지원했고 아마존 경로는 항상 `null`을 반환하는 미구현 스텁이었음 — 즉 한국 밖 모든 방문자는 안내 문구(`Home.gearSectionHint`)만 보고 있었음. 아마존은 정산금 현금화 문제로 이미 보류 결정된 상태였고, 사용자가 보유한 알리익스프레스 어필리에이트 오픈 플랫폼 앱(App Key/Secret, 트래킹ID "Exiflens")을 받아 쿠팡 파트너스와 동일한 구조로 신규 구현
- 신규 파일: `src/lib/aliexpress.ts` — 서버 전용 클라이언트. 알리익스프레스 오픈 플랫폼(TOP) 서명 규칙(파라미터 알파벳 정렬 후 concat, App Secret으로 앞뒤 감싸 MD5 → 대문자 hex)을 구현하고 `aliexpress.affiliate.product.query` 메서드를 호출해 상품 목록을 정규화. `AliexpressConfigError`(환경변수 미설정)와 `AliexpressApiError`(API 오류 응답)를 구분해 던짐
- 버그 수정(같은 날, 사용자의 로컬 재현 로그로 확인): 최초 구현은 실제로 붙여보니 알리익스프레스 게이트웨이가 매 요청마다 `IncompleteSignature`(서명 형식 불일치) 오류를 반환해 상품이 전혀 뜨지 않았음. 커뮤니티 자료(python-aliexpress-api SDK 등)를 참고해 timestamp를 밀리초로, 시스템/비즈니스 파라미터를 쿼리스트링/바디로 분리하는 방식으로 1차 수정했으나 동일한 `IncompleteSignature` 오류가 계속 재현됨 — 여러 자료가 서로 다른 방식(MD5/HMAC-SHA256, 타임스탬프 형식 등)을 제시해 추측만으로는 원인을 좁힐 수 없었음. 최종적으로는 사용자가 같은 App Key/Secret을 이미 실사용 중인 별도 프로젝트(네이버 블로그 자동화, `main.js`의 `searchAliexpressProduct()`)의 실제 동작하는 코드를 확인해 그대로 이식: 원래 방식(상하이 시간 문자열 timestamp, MD5, 모든 파라미터를 하나의 POST 바디로 전송)이 맞았고, 오히려 `page_no`/`fields`/`partner_id` 같은 불필요한 파라미터를 추가로 보낸 것이 원인이었을 가능성이 높아 이를 모두 제거. 함께 보였던 하이드레이션(hydration) 콘솔 경고(`style={{user-select:"auto"}}`)는 브라우저 확장 프로그램이 주입한 속성으로 인한 것으로 실제 코드 버그가 아님을 확인
- 버그 수정: 언어 스위처로 로케일을 바꾸면 개발 서버가 실제로 죽어버리는 별도의 기존 버그도 함께 발견/수정. `src/app/api/dev/watch/route.ts`(마지막 브라우저 탭이 닫히면 개발 서버를 자동 종료하는 개발자 전용 도구)의 `CLOSE_DEBOUNCE_MS`가 700ms였는데, 로케일 전환은 `[locale]` 레이아웃 전체를 재마운트시켜 SSE 연결이 한 번 끊겼다가 다시 열리고, 처음 방문하는 로케일 페이지는 Turbopack이 그 자리에서 컴파일하느라 700ms를 넘기는 경우가 있어 그 사이 "탭이 닫혔다"고 오판해 서버를 종료시키고 있었음. 디바운스를 6000ms로 늘려 해결(실제 탭을 닫았을 때의 자동 종료 체감 속도에는 차이 없음)
- 신규 파일: `src/app/api/aliexpress/search/route.ts` — 기존 `api/coupang/search`와 동일한 구조. ND 필터 관련 영문 키워드(1행)와 카메라 가방/삼각대/메모리카드(2행) 두 그룹으로 검색 후 무작위 선정/셔플. UI 로케일(en/ja/es)에 따라 `target_currency`/`target_language`를 각각 USD/EN, JPY/JA, EUR/ES로 매핑(한국어는 쿠팡으로 라우팅되므로 대상 아님). API 키 미설정 시 조용히 빈 배열 반환, API 오류는 서버 로그에만 기록해 화면에는 안내 문구로 자연스럽게 폴백
- 신규 파일: `src/components/aliexpress-gear-cards.tsx` — 기존 `coupang-gear-cards.tsx`와 동일한 로딩 스켈레톤/빈 상태/에러 상태 UX. 상품 가격은 `통화코드 가격` 형식으로 표시, 링크는 `nofollow sponsored noopener noreferrer` 처리
- 수정: `src/lib/affiliate.ts` — 미구현 아마존 스텁(`amazonForCountry`/`amazonForLocale`) 제거. `resolveAffiliateProvider`가 한국(geo 또는 로케일 기준)은 `"coupang"`, 그 외 전부 `"aliexpress"`를 반환하도록 변경. 로컬 개발 환경에서는 `geo-country` 쿠키가 없으므로 UI 언어 스위처(en/ja/es ↔ ko)를 바꾸는 것만으로 두 경험을 미리 볼 수 있음을 JSDoc에 명시
- 수정: `src/components/gear-recommendation.tsx` — `provider === "aliexpress"` 분기 추가
- 수정: `.env.example` — `ALIEXPRESS_APP_KEY`/`ALIEXPRESS_APP_SECRET`/`ALIEXPRESS_TRACKING_ID` 안내 항목 추가(값은 비워둠, 실제 값은 기존 쿠팡 키와 동일하게 `.env.local`에만 보관하며 git에는 절대 커밋하지 않음)
- 보안: 실제 App Key/Secret/트래킹ID(Exiflens)는 사용자 컴퓨터의 `.env.local`에만 직접 기록했으며, 이 저장소는 Public이므로 커밋 대상에서 항상 제외됨. 이번 작업의 push 스크립트도 `.env.local`을 포함하지 않도록 범위를 한정
- 광고 코드(GA4/AdSense/ads.txt) 미변경
- 검증: `npx tsc --noEmit`, 변경/신규 파일 전체 `npx eslint` 통과. `npm run build` 정상 완료(`/api/aliexpress/search` 라우트 정상 포함, 정적 페이지 수 변동 없음). 실시간 API 호출(사인된 실제 요청)은 클라우드 샌드박스에서 보안상 차단되어 있어, 로컬 개발 서버(`ExifLens 실행.command`) 실행 후 언어 스위처를 en/ja/es로 전환해 실제 상품 노출 여부를 사용자가 직접 확인 필요

## 2026-09-05 — 홈페이지 H1/부제 타겟 키워드 보강 (SEO 개선 5일차)

- 배경: 구글 서치 콘솔 분석(2026-08-31, Gemini 분석 의뢰) 결과 노출은 급증하지만 클릭률이 낮은 문제에 대응해 하루 한 항목씩 안전한 개선을 적용 중(SEO_TASKS.md 5일차). 홈페이지 H1이 브랜드명("ExifLens")만 있고 `EXIF viewer`, `Extract EXIF online`, `Photo metadata checker` 같은 타겟 키워드가 부족하다는 지적에 따라 4개 언어 모두 H1/부제 문구를 보강
- 수정: `messages/{en,ko,ja,es}.json`의 `Home.title`/`Home.subtitle` — 브랜드명("ExifLens")은 그대로 유지하고, 부제 형태로 핵심 키워드를 각 언어의 자연스러운 표현으로 추가. 직역이 아닌 개별 언어별 문구로 작성했으며 키워드 스터핑 없이 실제 도구 기능(EXIF 추출, ND 필터 계산)을 정확히 설명하는 범위 안에서 보강
  - en: "ExifLens — Free Online EXIF Viewer & Photo Metadata Checker" / "Drop a photo to extract EXIF metadata online instantly, then calculate your ND filter long exposure in one click."
  - ko: "ExifLens — 무료 온라인 EXIF 뷰어 & 사진 메타데이터 확인" / "사진을 올리면 온라인에서 바로 EXIF 정보를 추출하고, 클릭 한 번으로 ND 필터 장노출 시간을 계산하세요."
  - ja: "ExifLens — 無料オンラインEXIFビューア＆写真メタデータチェッカー" / "写真をアップロードするだけでオンラインでEXIF情報を即座に抽出。ワンクリックでNDフィルターの長時間露光を計算します。"
  - es: "ExifLens — Visor EXIF Gratis en Línea y Verificador de Metadatos de Fotos" / "Sube una foto para extraer su EXIF en línea al instante y calcula tu exposición larga con filtro ND en un clic."
- `src/app/[locale]/page.tsx`의 H1/부제 JSX 구조와 `<head>` 메타데이터(`layout.tsx`의 하드코딩된 영문 title)는 변경하지 않음 — 과도한 확장을 피하고 이번 항목의 범위를 문구 보강으로 한정
- 참고: 한국어 H1에 `break-keep`(word-break: keep-all) 유틸리티 클래스를 시도했으나, 모바일 뷰포트에서 일본어(`EXIF`와 한자·가나가 섞인 구간에 공백이 없어 줄바꿈 지점을 찾지 못함)에서 텍스트가 화면 밖으로 잘려나가는(overflow) 부작용이 확인되어 적용하지 않고 원래 상태(기본 word-break)로 되돌림. 한국어에서 "메타데이터"가 두 줄에 걸쳐 나뉘는 것은 미관상 아쉽지만 레이아웃이 깨지지는 않으므로, 4개 언어 모두에 안전한 기본 동작을 유지
- 광고 코드(GA4/AdSense/ads.txt) 미변경 — 애드센스 심사 진행 중이므로 이번 항목에서도 손대지 않음
- 검증: `npx tsc --noEmit`, `npx eslint src/app/[locale]/page.tsx` 통과. `npm run build` 정상 완료(143개 정적 페이지 유지, 텍스트만 변경되었으므로 페이지 수 변동 없음이 정상). `npm run start` + Playwright(헤드리스 크로미움)로 4개 언어(en/ko/ja/es) 모두 모바일(390×844)·데스크톱(1440×900) 뷰포트에서 홈페이지 스크린샷을 확인 — 어느 언어에서도 텍스트 잘림(overflow)이나 레이아웃 깨짐 없음을 확인

## 2026-09-04 — 가이드 글 내 메인 도구 CTA 배너 추가 (SEO 개선 4일차)

- 배경: 구글 서치 콘솔 분석(2026-08-31, Gemini 분석 의뢰) 결과 노출은 급증하지만 클릭률이 낮은 문제에 대응해 하루 한 항목씩 안전한 개선을 적용 중(SEO_TASKS.md 4일차). 가이드 글을 읽는 방문자가 메인 EXIF 분석 도구(홈페이지)로 자연스럽게 유도되도록 CTA 배너를 추가
- 신규 파일: `src/components/guide-tool-cta.tsx` — 가이드 콘텐츠와 무관한 템플릿 컴포넌트라 전체 가이드/전체 언어에 한 번에 적용 가능. 기존 `cross-link-flydronemap.tsx`와 동일한 `border-border bg-card` 카드 스타일 및 `Button`(shadcn) 컴포넌트를 그대로 재사용, 새 디자인 시스템을 만들지 않음. `@/i18n/navigation`의 `Link`로 홈(`/`)으로 연결
- 수정: `src/app/[locale]/guides/[slug]/page.tsx` — 글 제목/날짜 바로 아래(본문 상단)와 본문 하단(관련 가이드 섹션 위) 두 곳에 `<GuideToolCta locale={locale} />` 배치
- 수정: `messages/{en,ko,ja,es}.json` — `Guides` 네임스페이스에 `ctaBannerText`(배너 문구), `ctaBannerButton`(버튼 라벨) 키 추가. 4개 언어 모두 자연스러운 표현으로 개별 작성(직역 금지 원칙 준수)
- 광고 코드(GA4/AdSense/ads.txt) 미변경 — 애드센스 심사 진행 중이므로 이번 항목에서도 손대지 않음
- 검증: 변경/신규 파일 대상 `npx eslint`, `npx tsc --noEmit` 통과. `npm run build` 정상 완료(기존 143개 정적 페이지 유지, 신규 라우트 없음 — 기존 페이지에 컴포넌트만 추가되었으므로 페이지 수 변동 없음이 정상). `npm run start` + Playwright(헤드리스 크로미움)로 en/ko 두 언어의 실제 가이드 상세 페이지를 스크린샷 확인 — 배너가 광고 영역과 겹치지 않고 자연스럽게 배치됨, 한국어 줄바꿈도 레이아웃 깨짐 없음 확인

## 2026-09-03 — Contact(문의) 페이지 신규 추가 (애드센스 재검토 대비)

- 배경: 애드센스 심사에서 "가치가 별로 없는 콘텐츠" 사유로 반려됨에 따라 원인을 실제 데이터로 점검. 발행 가이드 글 수(언어별 24개, 총 96개)와 평균 분량(영문 기준 약 4,700자)은 이미 일반적인 최소 기준을 충분히 넘고 있었고, 저장소 최초 커밋일(2026-08-24)로 볼 때 사이트가 아직 10일밖에 안 된 신생 도메인이라는 점이 더 유력한 원인으로 파악됨. 다만 Privacy/Terms/About/Disclosure 페이지는 이미 있었지만 독립된 Contact(문의) 페이지가 없었던 점은 실제 개선 여지로 확인되어 이번에 보완
- 신규 파일: `src/app/[locale]/contact/page.tsx` — 기존 About/Privacy/Terms와 동일하게 `LegalPage` 공통 컴포넌트 + next-intl 번역 네임스페이스(`Contact`)를 사용하는 4개 언어(en/ko/ja/es) 지원 페이지. 이메일 문의처(skysmoga@gmail.com), 버그 제보/기능 제안, 비즈니스·제휴 문의 3개 섹션으로 구성
- 수정: `messages/{en,ko,ja,es}.json` — `Contact` 네임스페이스(제목+3개 섹션) 및 `Footer.contact` 라벨 추가
- 수정: `src/components/site-footer.tsx` — 푸터 내비게이션에 Contact 링크 추가 (Privacy/Terms/Disclosure 옆)
- 수정: `src/app/sitemap.ts` — `STATIC_PATHS`에 `/contact` 추가해 사이트맵에도 4개 언어 전부 반영
- 검증: 변경/신규 파일 대상 `npx eslint`, `npx tsc --noEmit` 통과. `npm run build` 정상 완료(139 → 143개 정적 페이지로 정확히 +4, en/ko/ja/es 4개 언어의 `/contact.html`이 모두 생성된 것을 직접 확인)

## 2026-09-03 — 자주 쓰는 스크립트 3종에 구분용 아이콘 적용

- 배경: 여러 스크립트를 함께 사용하다 보니 Finder에서 어떤 스크립트인지 구분이 어려워, 기존 이미지 관리 push 스크립트(카메라 아이콘)에 이어 나머지 상시 스크립트에도 목적을 바로 알 수 있는 아이콘을 적용
- `ExifLens 실행.command`: 사이트에서 실제로 쓰는 로고(`src/app/icon.png`, 조리개/셔터 모양)를 그대로 아이콘으로 적용
- `automation/publish-guide.command`: 알람시계 모양 아이콘 신규 제작·적용 (`automation/assets/publish-guide-icon.png`) — 예약/자동 발행 성격을 표현
- `automation/apply-seo-task.command`: 돋보기 + 상승 막대그래프 모양 아이콘 신규 제작·적용 (`automation/assets/seo-task-icon.png`) — SEO 검색·분석 성격을 표현
- 세 아이콘 모두 512x512 캔버스에서 그림 자체의 bounding box 중심이 정확히 캔버스 중앙(256,256)에 오도록 프로그래밍적으로 재정렬해 생성 — 기존 카메라 아이콘 작업 때 발생했던 상하 쏠림 문제 재발 방지
- 아이콘 적용은 각 스크립트 실행 시 AppleScriptObjC(`NSWorkspace setIcon:forFile:`)로 매번 재적용되며, 이미 적용돼 있어도 무해하게 재실행됨 — 저장소를 새로 클론해 처음 실행하는 경우에도 자동으로 아이콘이 붙음
- 대상에서 제외: `이미지변경사항_Push.command`(기존 카메라 아이콘 유지, 변경 없음)
- 검증: 세 스크립트 모두 `bash -n` 문법 검사 통과, 아이콘 이미지는 픽셀 bbox 중심 좌표를 코드로 계산해 정중앙(256,256) 정렬을 수치로 확인. 실제 Finder 아이콘 반영 여부는 클라우드 샌드박스에서 직접 확인이 불가능한 영역이라 사용자 환경에서 실행 후 확인 필요

## 2026-09-03 — Chrome 탭 종료 시 개발 서버 터미널 자동 종료 (SSE 기반)

- 배경: `localhost:3000/ko` 탭을 닫아도 `npm run dev`를 실행 중인 터미널 창이 함께 꺼지지 않아, 여러 작업을 동시에 진행할 때 어떤 터미널이 어떤 작업인지 헷갈리는 문제 개선 요청
- 최초에는 브라우저→서버 heartbeat(주기적 ping) 방식을 검토했으나, 이 경우 탭을 닫아도 서버가 "연결 끊김"을 확인하기까지 수 초의 지연이 발생함 — 예전에는 탭을 닫으면 터미널이 거의 동시에 꺼졌다는 피드백에 따라 지연이 큰 heartbeat 방식 대신 아래의 즉시 감지 방식으로 재설계
- 신규 파일: `src/app/api/dev/watch/route.ts` — Server-Sent Events(SSE) 연결을 유지하는 라우트. Next.js Route Handler가 요청의 `AbortSignal`(`request.signal`)로 브라우저 연결 종료를 즉시(이벤트 기반, polling 아님) 감지. 탭을 새로고침할 때(브라우저가 짧게 재연결)와 실제로 탭을 닫을 때를 구분하기 위해 마지막 연결이 끊긴 뒤 700ms만 대기했다가 재연결이 없으면 개발 서버 프로세스를 특수 종료 코드(42)로 종료(`process.exit(42)`). NODE_ENV=development가 아니면 403.
- 신규 파일: `src/components/dev/dev-server-watch.tsx` — 클라이언트에서 `EventSource`로 위 SSE 라우트에 연결만 유지하는 컴포넌트(화면에는 아무것도 렌더링하지 않음)
- 수정: `src/app/[locale]/layout.tsx` — `NODE_ENV === "development"`일 때만 `<DevServerWatch />`를 body에 조건부 렌더링(프로덕션 빌드에는 포함되지 않음, 정적 산출물에서 확인 완료)
- 수정: `scripts/dev-open.mjs` — `next dev` 자식 프로세스가 종료 코드 42로 끝나면(macOS 한정) `tty`를 확인해 현재 명령을 실행 중인 Terminal 창만 찾아 3초 뒤 자동으로 닫는 로직 추가(기존 이미지 도구용 스크립트와 동일한 detached osascript 패턴 재사용 — macOS의 "정말 종료하시겠습니까?" 확인 다이얼로그 없이 조용히 닫힘)
- 수정: `.gitignore` — 빌드 정리 단계 EPERM 문제 회피용으로 `.next` 대신 이름을 바꿔 남기는 `.next.stale.*/` 패턴을 무시 목록에 추가(FlyDroneMap과 동일한 선례 적용, 실수로 git에 올라가지 않도록)
- 안전장치: 위 기능은 전부 로컬 개발 환경 전용이며, NODE_ENV 가드와 프로덕션 빌드 트리쉐이킹으로 exifnd.com 실제 서비스에는 전혀 노출되지 않음
- 검증: 변경/신규 파일 대상 `npx eslint`, `npx tsc --noEmit` 통과, `npm run build` 정상 완료(139/139 정적 페이지, 프로덕션 산출물에 해당 코드 미포함 확인). 다만 실제 macOS Terminal 창 종료 동작 자체는 클라우드 샌드박스에서 직접 실행/검증이 불가능한 영역이라 사용자 환경에서의 실사용 확인이 필요함

## 2026-09-03 — SEO 3일차: 노출 상위 가이드 2개 영어 타이틀/메타 디스크립션 개선

- 배경: 구글 서치 콘솔 분석(2026-08-31) 결과 확인된 "노출 급증, 클릭률 저조" 문제 개선을 위한 SEO_TASKS.md 3일차 항목 진행
- 서치 콘솔 노출 상위 영어(en) 가이드 2건의 frontmatter title/description을 클릭을 유도하는 문구로 개선(과장·클릭베이트 없이 실제 본문 내용에 맞춰 작성)
  - content/guides/en/wide-angle-vs-telephoto-focal-length.mdx: "Wide-Angle vs. Telephoto: How Focal Length Changes Your Photos" → "Wide-Angle vs. Telephoto: The Complete Focal Length Guide (14mm-200mm+)", description을 질문형으로 변경
  - content/guides/en/understanding-metering-modes.mdx: "Understanding Metering Modes: Matrix, Center-Weighted, and Spot" → "Matrix vs. Center-Weighted vs. Spot Metering: Which Should You Use?", description을 질문형으로 변경
- generateMetadata가 frontmatter를 그대로 읽어 `<title>`/`<meta description>`에 반영하는 기존 구조를 그대로 사용, 코드 변경 없음
- 다국어(ko/ja/es) 확대는 이번 항목 범위 밖(추후 별도 논의)
- 검증: npx tsc --noEmit 통과, npm run build 정상 완료, 빌드 산출물(.next/server/app/en/guides/*.html)에서 새 title/description이 실제로 반영됨을 확인

## 2026-09-02 — 개발자 이미지 관리 도구: 직접 업로드 + 검색 재시도 시 새 결과

- 직접 촬영/보유한 사진을 Unsplash 검색 없이 그대로 대표 이미지로 적용할 수 있는 업로드 기능 추가 (src/app/api/dev/guide-image-upload/route.ts, 패널 하단 파일 선택 UI) - jpg/jpeg/png/webp, 최대 15MB, 저작자 표기(imageCredit/imageCreditUrl)는 붙지 않음(기존 값이 있었다면 제거)
- 같은 검색어로 "검색"(적용 후에는 "다른 사진") 버튼을 다시 누르면 Unsplash 검색 결과의 다음 페이지를 보여주도록 변경 - 마음에 드는 사진이 없을 때 같은 사진만 반복해서 보이지 않고 계속 새 후보를 확인 가능. 검색어를 바꾸면 1페이지부터 다시 시작
- src/lib/dev/guide-image-tool.ts: frontmatter 갱신 로직을 writeGuideImageFrontmatter로 통합해 Unsplash 적용/직접 업로드가 동일한 방식으로 처리되도록 정리, 확장자가 바뀌어도 이전 이미지 파일이 남지 않도록 적용 전 {slug}.* 파일 정리 로직 추가
- 검증: 대상 파일 npx eslint / npx tsc --noEmit 통과, npm run build 정상 완료(신규 업로드 라우트 등록 확인)

## 2026-09-02 — 개발자 이미지 관리 도구로 대표 이미지 10건 재검색/교체

- 새로 추가한 로컬 전용 이미지 관리 패널을 사용해, 서로 다른 글에 동일한 사진이 중복 사용되던 문제(avoiding-camera-shake-long-exposure / portrait-photography-camera-settings / raw-vs-jpeg-which-should-you-shoot)를 포함해 총 10개 글의 대표 이미지를 검색어를 바꿔가며 재선택
- 이전 소급 적용 단계에서 검색 결과가 없어 이미지가 비어 있던 understanding-exif-iso-shutter-aperture 에도 이번에 이미지 신규 적용
- 대상: gps-data-in-photos-privacy, nd-filter-types-explained, panning-shot-technique, understanding-depth-of-field, white-balance-explained, wide-angle-vs-telephoto-focal-length 포함 (4개 언어 mdx의 image/imageCredit/imageCreditUrl 및 해당 webp 파일 갱신)

## 2026-09-02 — 개발자 전용 가이드 이미지 관리 도구 추가 (상시 도구)

- 배경: 가이드 아티클에 자동 첨부된 Unsplash 대표 이미지가 서로 다른 글에 동일한 사진으로 중복되거나, 주제와 맞지 않는 사진이 붙는 경우를 스크립트 재실행 없이 바로 고칠 수 있어야 한다는 요구로 추가
- 로컬 개발 서버(localhost, NODE_ENV=development)에서만 가이드 상세 페이지 우측 하단에 뜨는 플로팅 패널("🛠 이미지 관리 (DEV)") — 프로덕션(exifnd.com)에는 노출되지 않으며, 프로덕션 빌드 시 정적 HTML에서도 제거됨을 확인
- 검색어 입력 → Unsplash 후보 이미지 9장을 썸네일로 표시 → 원하는 사진을 클릭하면 그때 고화질 다운로드 + download_location 트래킹 호출 + 해당 글의 webp 및 4개 언어(en/ja/ko/es) mdx frontmatter(image/imageCredit/imageCreditUrl)를 즉시 갱신
- 신규 파일: src/lib/dev/guide-image-tool.ts(검색/적용 로직), src/app/api/dev/guide-image-search·guide-image-apply/route.ts(둘 다 NODE_ENV 가드로 프로덕션에서 403), src/components/dev/guide-image-dev-panel.tsx(패널 UI), src/app/[locale]/guides/[slug]/page.tsx에 조건부 렌더링 연결
- Unsplash API 키를 automation/.env뿐 아니라 .env.local(Next.js 표준 로딩 경로)에도 동일하게 등록 (기존과 동일한 키, git 추적 제외)
- 이 도구는 로컬 파일(webp, mdx)만 수정하며 git add/commit/push는 하지 않음 - 적용 후에는 기존 push 스크립트로 별도 커밋 필요
- 1회성 작업이 아니라 사이트를 운영하는 동안 계속 사용할 상시 개발자 도구로, 발행 자동화 스크립트처럼 자체 삭제되지 않음
- 검증: 대상 파일 npx eslint / npx tsc --noEmit 통과, npm run build 정상 완료 및 프로덕션 산출물에 패널 미포함 확인. 실제 Unsplash API 호출은 샌드박스에 외부 네트워크가 없어 이번 검증에서는 진행하지 못했음 - 실제 로컬 환경(사용자 Mac)에서 첫 사용 시 동작 확인 필요

## 2026-09-02 — 더블클릭 Push 스크립트 추가 ("변경사항 Push.command")

- Claude가 로컬에 커밋한 변경사항을 push할 때마다 터미널에 직접 명령어를 입력해야 했던 불편 해소
- publish-guide.command와 동일한 방식(더블클릭 실행, 완료 후 터미널 창 자동 종료)으로 동작
- 이미 커밋된 것만 push하며, 커밋되지 않은 변경사항이 있으면 경고만 하고 자동으로 커밋하지 않음(의도치 않은 커밋 방지)
- push할 새 커밋이 없으면 안내 후 바로 종료

## 2026-09-02 — 구글 디스커버 노출 대비 2~4단계: 가이드 아티클 Unsplash 대표 이미지 자동 첨부

- (2단계) Unsplash API 키를 automation/.env 에 저장 (기존 발급 이력 재사용, git 추적 제외 - .gitignore의 .env* 패턴에 이미 포함)
- (3단계) automation/attach-guide-image.py 신규 추가: 발행 시 영문 mdx의 tags(앞 2개)를 검색어로 Unsplash에서 가로 1600px webp 이미지를 검색·다운로드해 public/guides/images/{slug}.webp 에 저장하고, 4개 언어 mdx frontmatter에 image/imageCredit/imageCreditUrl 자동 삽입
  - Unsplash API 가이드라인 준수: 이미지 사용 시 download_location 트래킹 엔드포인트 호출, 저작자 표기(사진작가명+링크, UTM 파라미터) 정보 함께 저장
  - 네트워크 오류/키 없음/검색 결과 없음 등 실패 시에도 예외 없이 조용히 건너뛰고 텍스트만으로 발행 계속 (일일 자동 발행 파이프라인이 이미지 때문에 중단되지 않도록)
  - automation/publish-guide.command 에 호출 지점 추가 (콘텐츠 반영 직후, git add 이전)
- (4단계) src/lib/guides.ts GuideFrontmatter에 image/imageCredit/imageCreditUrl 필드 추가, 가이드 상세 페이지(src/app/[locale]/guides/[slug]/page.tsx)에 대표 이미지 렌더링(next/image, 16:9) + "Photo by X on Unsplash" 저작자 표기 링크 추가, openGraph.images/twitter.images에도 연결
- 구글 디스커버 노출 필수 조건 중 "고화질 대표 이미지" 충족을 위한 작업 (1단계 robots 메타태그는 앞선 커밋에서 이미 반영)
- 검증: 대상 파일 npx eslint, npx tsc --noEmit 통과. Unsplash API 실제 호출 테스트는 이 샌드박스에 외부 네트워크가 없어 진행하지 못했음 - 첫 자동 발행 시 실제 동작 확인 필요
- 기존에 이미 발행된 과거 아티클(이미지 없음)에 대한 소급 적용은 별도 단계로 진행 예정 (이번 커밋 범위 아님)

## 2026-09-02 — 구글 디스커버 노출 대비 1단계: robots 메타태그에 max-image-preview:large 추가

- 구글 디스커버(Discover) 노출 필수 조건 중 하나인 large 이미지 미리보기 허용 메타태그를 사이트 전역 metadata에 추가
- `src/app/[locale]/layout.tsx`의 루트 generateMetadata에 `robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }` 추가 (다른 페이지들은 자체 robots 설정이 없어 이 레이아웃 값을 그대로 상속)
- 디스커버 노출을 위한 후속 작업(가이드 아티클 대표 이미지 자동 첨부 등)이 진행 중이며, 이번 커밋은 그 1단계
- 기존 색인/광고 관련 설정은 변경 없음

## 2026-09-02 — SEO 개선 2일차: WebApplication 구조화 데이터 범위를 실제 도구 페이지로 한정

- 서치 콘솔 노출 급증 대비 클릭률 저조 문제 개선 작업의 2일차 항목(안전한 것부터 하루 하나씩 적용, 2026-08-31 승인)
- 기존에는 `WebApplication` JSON-LD가 `src/app/[locale]/layout.tsx`의 `<head>`에서 전체 페이지(약관/개인정보처리방침/가이드 글 등 포함)에 동일하게 삽입되어, 실제 도구가 아닌 페이지에도 부정확한 구조화 데이터가 노출되던 문제 해결
- `layout.tsx`에서 전역 `webApplicationJsonLd` 스크립트 삽입 제거(GA4/AdSense 등 광고 관련 스크립트는 그대로 유지, 손대지 않음)
- 실제 도구 페이지인 홈(`/`)과 프레임 생성기(`/frame`) 각각의 본문 최상단에 `webApplicationJsonLd`를 직접 삽입(FAQ 페이지가 이미 쓰던 body 내 JSON-LD 패턴과 동일). 프레임 생성기 페이지는 `url`만 `${SITE_URL}/${locale}/frame`로 재정의
- 다른 페이지(terms/privacy/about/disclosure/guides)는 변경 없음
- 검증: `npx tsc --noEmit`, 대상 파일 `eslint`, `npm run build` 모두 통과. `npm run start` + Playwright(헤드리스 크로미움)로 `/en`·`/en/frame`에는 `WebApplication` 스크립트가 올바른 url로 존재하고, `/en/terms`에는 구조화 데이터가 없으며, `/en/guides`에는 1일차에 추가한 `BreadcrumbList`만 남아 있음을 실제 렌더링으로 확인

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

## 2026-10-02 — 가이드 자동 발행: 스톡사진 등록 전 EXIF 제거 도구 활용법

- 가이드 자동 발행 예약 작업(scheduled task, 매일 KST 06:00)이 주제 큐(`automation/guide-topics-queue.json`) 순서 45번을 선정해 4개 언어(en/ko/ja/es)로 작성.
- **발행 주제**: "스톡사진 등록 전 EXIF 제거 도구 활용법"(영문: Using the EXIF Remover Before Stock Photo Submission) — Adobe Stock·Shutterstock 등 스톡 에이전시의 공식 기여자 가이드라인이 메타데이터 처리 방침을 전혀 문서화하지 않는다는 점을 짚고, [EXIF 제거 도구](/tools/exif-remover)의 "GPS 위치만 제거" 옵션으로 저작권/캡션 IPTC 정보는 보존한 채 GPS 좌표만 지우는 선택적 제거가 스톡 등록에 더 적합한 이유, 20개 배치 처리·ZIP 다운로드 활용법, 메타데이터 제거가 재압축 없이 이뤄져 기술 심사(초점/노이즈/압축 아티팩트)에 영향을 주지 않는다는 점, HEIC/ProRAW 변환 필요성을 다룸. 카테고리: "EXIF 활용 & 공유".
- **이번 실행에서 1건만 발행한 이유(중요)**: 예약 작업 프롬프트는 2026-09-23부터 하루 2건(서로 다른 주제, 각각 완전한 분량) 발행을 요청하고 있으나, 이번 실행 중 저장소에 이미 영구 설치된 `automation/publish-guide.command`를 직접 읽어 확인한 결과, 이 스크립트는 `ls guide-*-en.mdx | head -n1`로 폴더에서 **가장 먼저 매칭되는 영문 파일 1개만** 처리하고, 해당 슬러그의 파일만 `git add`/커밋한 뒤 그 슬러그의 파일만 삭제하도록 되어 있음(2026-09-23 변경 이력에도 이 스크립트 자체의 다중 슬러그 처리 로직 추가는 기록되어 있지 않음). 두 주제의 mdx 8개 + 두 주제 모두 `published: true`로 갱신된 큐 json을 한 zip에 넣어 전달하면, 사용자가 더블클릭을 한 번만 할 경우 그 중 1개 주제의 콘텐츠만 실제로 저장소에 커밋되는 반면 큐 파일은 두 주제 모두 발행 완료로 덮어써져 커밋되므로, 커밋되지 않은 나머지 1개 주제가 "발행 완료"로 영구 표시되어 다시는 선택되지 않는 콘텐츠 손실 위험이 있음. 이를 피하기 위해 이번 실행은 안전하게 주제 1건만 선정·작성·검증해 전달함.
- 큐 파일 갱신: 순서 45(`exif-remover-stock-photo-submission`)만 `published: true`, `publishedDate: "2026-10-02"`로 갱신. 순서 46(`crop-factor-calculator-lens-choice`, "크롭팩터 계산기로 크롭바디용 렌즈 선택하는 법")은 그대로 미발행 상태로 유지되어 다음 발행 대상으로 남아 있음.
- **검증**: `npm install` 후 `npm run build` 성공(exit code 0). 4개 언어 mdx 전부 굵게 표시(`**`) 뒤 괄호+조사 결합 패턴 없음을 확인. 큐 json은 파이썬 `json.load`로 유효성 확인.
- **다음 단계(사용자 확인 필요)**: `automation/publish-guide.command`가 폴더 안 첫 번째 영문 파일 1개만 처리하는 구조라, 향후 진짜 "하루 2건"을 안전하게 처리하려면 (a) 스크립트에 모든 `guide-*-en.mdx`를 순회하는 루프를 추가하거나, (b) 매일 전달되는 zip에 2개 주제가 들어있을 때 압축 해제 후 스크립트를 두 번 double-click(1차 실행 후 창이 닫히면 남은 콘텐츠로 다시 한 번 실행)하는 방식을 명확히 안내받아야 함. 이번 실행은 (b)의 불확실성을 피하기 위해 1건만 발행함 — 다음 실행부터 2건 체제를 재개하려면 둘 중 하나를 확정해 주시기 바랍니다.

## 2026-10-01 — 가이드 아티클 자동 발행: RAW/JPEG 용량 비교법 + EXIF 제거 도구 SNS 프라이버시 활용법 (예약 작업, 1일 2건)

- 신규 가이드 2건을 각각 4개 언어(en/ja/ko/es)로 독립적으로 작성해 발행.
- 1건: "저장용량 계산기로 RAW와 JPEG 용량 차이 비교하는 법"(order 43, slug: storage-calculator-raw-vs-jpeg) — 계산기의 형식 프리셋 실제 기준값(JPEG 8MB/RAW 압축 30MB/RAW 무압축 65MB)을 근거로, 압축·무압축 RAW의 용량 차이가 화질이 아니라 압축 알고리즘 적용 여부에서 온다는 점을 설명. 웨딩 촬영 2,000장 예시로 형식별 총 용량(16GB/60GB/130GB)과 128GB 카드 한 장으로 무압축 RAW는 하루 분량도 못 담는다는 구체적 계산 포함. 연속 촬영 시 파일 크기가 버퍼 소진 속도에 미치는 영향, RAW+JPEG 동시 저장 시 '직접 입력' 필드로 정확히 계산하는 법(38MB)까지 다룸. 기존에 발행된 여행용 저장공간 가이드(storage-calculator-trip-planning)와 겹치지 않도록 형식 선택 자체의 기술적 원리와 연속 촬영 버퍼 이슈에 집중. 카테고리는 기존에 없어 새로 신설: "저장 & 백업"(Storage & Backup / 保存とバックアップ / Almacenamiento y copias de seguridad).
- 2건: "EXIF 제거 도구로 SNS 업로드 전 위치정보 지우는 법"(order 44, slug: exif-remover-social-media-privacy) — 실제 도구 옵션(GPS만 제거 vs 전체 제거, JPEG 한정 적용과 XMP 별도 저장 caveat, IPTC/저작권 정보 유지 옵션, 최대 20장 일괄 처리+ZIP 다운로드, 메타데이터 영역만 바이트 단위로 제거해 화질 손상이 없는 원리, HEIC/TIFF 미지원과 JPEG 변환 필요성)을 중심으로 실전 가이드 작성. 기존에 발행된 GPS 프라이버시 개념 가이드(gps-data-in-photos-privacy)와 겹치지 않도록 중고거래·부동산 매물 사진처럼 플랫폼이 메타데이터를 자동 제거하지 않는 구체적 위험 상황과 도구 옵션 활용법에 집중. 카테고리: 기존 "EXIF 활용 & 공유"(EXIF & Sharing / EXIF活用と共有 / EXIF y compartir) 재사용.
- automation/guide-topics-queue.json 갱신: order 43, 44 두 항목 모두 published: true, publishedDate: "2026-10-01"(KST 기준)로 반영. 총 130개 주제 중 미발행 86개 남음(경고 기준 10개보다 충분히 여유 있음).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일). 발행 패키지에는 두 슬러그의 mdx 파일을 함께 넣었으므로, publish-guide.command를 두 번 실행(더블클릭)하면 각 실행이 guide-*-en.mdx 중 하나씩을 처리하며 두 건 모두 정상적으로 커밋·이미지 첨부됨(첫 실행 후 창이 닫히면 남은 두 번째 주제 파일이 automation 폴더에 그대로 남아 있으므로 다시 더블클릭).
- 빌드 검증: 클론 저장소에서 `npm run build` 성공(396개 페이지 생성, 컴파일 성공). 추가로 실제 사이트가 가이드 렌더링에 쓰는 MDX 컴파일 파이프라인(@mdx-js/mdx evaluate + gray-matter, remark-gfm, rehype-slug/autolink)으로 신규 8개 mdx 파일 전체를 직접 컴파일 테스트해 프런트매터·본문 파싱 오류가 없음을 확인(가이드 상세 페이지가 동적 라우트라 빌드 시 프리렌더되지 않는 점을 감안한 별도 검증).

## 2026-09-30 — 가이드 아티클 자동 발행: 웨딩앨범 인쇄해상도 확인법 + 여행 촬영 메모리카드 계획법 (예약 작업, 1일 2건)

- 신규 가이드 2건을 각각 4개 언어(en/ja/ko/es)로 독립적으로 작성해 발행.
- 1건: "인쇄해상도 계산기로 웨딩앨범 인화 해상도 확인하는 법"(order 41, slug: print-resolution-calculator-album) — 포스터 인화와 달리 앨범은 한 번에 수십 장을 같은 기준으로 통과시켜야 한다는 점, 스프레드(양면 펼침) 사진은 페이지 1장이 아니라 펼침 전체 치수로 계산해야 한다는 흔한 실수(12×12인치 앨범 예시로 4000px 크롭본이 스프레드 전체에서는 약 1.8배 업스케일이 필요해지는 구체적 계산 포함), 정사각형 크롭이 3:2 센서 사진의 픽셀을 얼마나 깎아먹는지, 인쇄소 블리드(재단 여유분) 0.125~0.25인치를 트림 사이즈에 더해 계산해야 하는 이유까지 정리. 기존에 발행된 포스터 인화 가이드(print-resolution-calculator-poster)와 겹치지 않도록 앨범 특유의 스프레드/블리드/정사각 크롭 이슈에 집중.
- 2건: "저장용량 계산기로 여행 촬영 메모리카드 분량 계획하기"(order 42, slug: storage-calculator-trip-planning) — 저장용량 계산기의 일별 촬영 모드(하루 평균 매수 × 여행 일수)로 총 촬영 매수를 미리 확인하는 법, RAW/JPEG 선택에 따른 용량 차이(약 3배, 300장×7일 기준 RAW 63GB vs JPEG 17GB 구체 예시), 백업 사본까지 포함한 총 용량 계산(백업 1벌 추가 시 63GB→126GB), 같은 총 용량이라도 카드를 여러 장으로 나눠 담는 것이 분실·손상 위험을 줄이는 이유, 숙소 와이파이 업로드 속도(10Mbps 예시로 63GB 업로드 약 14시간) 확인까지 정리. 기존에 발행된 타임랩스 저장공간 가이드(timelapse-calculator-storage-planning)와 겹치지 않도록 다일(多日) 여행 계획·백업 전략·카드 분산에 집중.
- 카테고리: 1건은 기존 "인쇄 & 출력"(Printing & Output / 印刷と出力 / Impresión y salida), 2건은 기존 "장르별 촬영 가이드"(Photography Genres / ジャンル別撮影ガイド / Guías por género fotográfico) 카테고리를 각각 재사용.
- automation/guide-topics-queue.json 갱신: order 41, 42 두 항목 모두 published: true, publishedDate: "2026-09-30"(KST 기준)로 반영. 총 130개 주제 중 미발행 88개 남음(경고 기준 10개보다 충분히 여유 있음).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일). 발행 패키지에는 두 슬러그의 mdx 파일을 순서대로 넣었으므로, publish-guide.command를 두 번 실행(더블클릭)하면 각 실행이 guide-*-en.mdx 중 하나씩을 처리하며 두 건 모두 정상적으로 커밋·이미지 첨부됨.

## 2026-09-29

- 새 가이드 발행: "브라케팅 계산기로 HDR 노출 스탑 간격 정하는 법" (Setting HDR Exposure Stop Intervals with the Bracketing Calculator) — en/ja/ko/es 4개 언어
- 새 가이드 발행: "인쇄해상도 계산기로 대형 포스터 인화 전 확인할 것" (What to Check Before Printing a Large Poster with the Print Resolution Calculator) — en/ja/ko/es 4개 언어

## 2026-09-28

- 새 가이드 2건 발행 (2 new guides published):
  - "별사진 계산기로 NPF 룰 기반 노출값 정하는 법" / "Setting Exposure with the Astro Calculator's NPF Rule" (슬러그: astro-calculator-npf-rule)
  - "별사진 계산기로 은하수 촬영 시간대 미리 계획하기" / "Planning Milky Way Shoot Timing with the Astro Calculator" (슬러그: astro-calculator-milky-way-planning)
  - 4개 언어(en/ja/ko/es) 전부 작성, 카테고리: 장르별 촬영 가이드 / Photography Genres

## 2026-09-27 — "타임랩스 계산기로 촬영 간격과 총 촬영시간 계산하는 법", "타임랩스 계산기로 필요한 저장공간 미리 확인하는 법" 가이드 자동 발행 (주간 한도 복구 후 캐치업)

- 타임랩스 계산기(/tools/timelapse-calculator) 활용법 2편. 간격·촬영매수·총 촬영시간이 하나의 반비례 공식으로 묶여 있음을 실제 수치(24fps 10초 클립=240프레임, 2시간 예산이면 30초 간격 등)로 설명하고, RAW/JPEG 파일 크기 차이(약 3배)로 8~12시간 촬영 시 필요한 저장공간(예: 1,440장 RAW≈49GB)을 미리 계산하는 방법을 다룸.
- 클라우드 자동발행 파이프라인으로 생성, 빌드 검증 완료. 주간 사용 한도 도달로 지연된 09-25~09-27 발행분 캐치업.

## 2026-09-26 — "노출 계산기로 야간 사진 셔터스피드 빠르게 정하는 법", "ND필터 장노출 계산기로 셔터스피드 역산하는 법" 가이드 자동 발행 (주간 한도 복구 후 캐치업)

- 노출 계산기(/tools/exposure-stops-calculator)로 야간 촬영 시 조리개·셔터·ISO 트레이드오프를 실제 스톱 수치(f/2.8→f/8 시 약 3스톱, 손각대 전환 시 필요한 ISO가 물리적 한계를 초과하는 경우 등)로 미리 계산하는 법과, ND필터 장노출 계산을 목표 노출시간에서 거꾸로 기준 셔터스피드를 역산해 필터를 끼우기 전에 필터·빛 불일치를 미리 잡아내는 법을 다룸.
- 클라우드 자동발행 파이프라인으로 생성, 빌드 검증 완료. 주간 사용 한도 도달로 지연된 09-25~09-27 발행분 캐치업.

## 2026-09-25 — "심도 계산기로 인물사진 배경 흐림 정확히 맞추는 법", "심도 계산기로 풍경사진 전체 초점 맞추는 법" 가이드 자동 발행 (주간 한도 복구 후 캐치업)

- 심도(DoF) 계산기(/tools/dof-calculator) 활용법 2편. 인물사진 편은 초점거리가 심도 공식에 제곱으로 작용해 조리개보다 배경흐림에 더 큰 영향을 준다는 점을 50mm/85mm 실측 비교(약 17cm vs 6cm)로 설명하고, 풍경사진 편은 무한대 초점의 함정과 과초점거리 활용법을 24mm f/11(과초점거리 약 1.77m) 등 구체적 수치로 설명함.
- 클라우드 자동발행 파이프라인으로 생성, 빌드 검증 완료. 주간 사용 한도 도달로 지연된 09-25~09-27 발행분 캐치업.

## 2026-09-24 — 가이드 아티클 자동 발행: 노출 보정(EV) 활용법 + 백버튼 포커스 설정법 (예약 작업, 1일 2건)

- 신규 가이드 2건을 각각 4개 언어(en/ja/ko/es)로 독립적으로 작성해 발행.
- 1건: "노출 보정(EV) 활용법"(order 29, slug: using-exposure-compensation) — 반사식 노출계가 18% 회색을 가정해 노출을 계산하는 원리, 눈밭·흰 웨딩드레스처럼 밝은 장면에서 +1~+2스톱, 턱시도·어두운 배경처럼 어두운 장면에서 -1스톱 안팎으로 보정해야 하는 이유와 실제 셔터스피드 수치 예시, 측광 모드별로 필요한 보정량이 달라지는 이유, 히스토그램으로 보정값을 검증하는 법, M 모드에서 보정 다이얼이 안 먹는다는 흔한 오해(Auto ISO 필요)까지 정리. ExifLens 노출 계산기(/tools/exposure-stops-calculator)로 스탑 값을 직접 확인하도록 자연스럽게 연결.
- 2건: "백버튼 포커스 설정법"(order 30, slug: back-button-focus-explained) — 셔터 반누름이 초점과 촬영을 동시에 처리해 생기는 문제, 초점을 AF-ON 등 뒷면 버튼으로 옮기는 설정 방법, 장애물을 통과하는 움직이는 피사체·삼각대 재구도 같은 실전 시나리오, 흔한 실수(뒷면 버튼을 누르지 않고 촬영), AF-C와 결합해 쓰는 법까지 정리. 초점 모드 비교 가이드(/guides/focus-modes-af-s-vs-af-c-vs-mf)로 연결되는 내부 링크 포함.
- 카테고리: 두 주제 모두 기존 "카메라 기초 & 노출"(Camera Basics & Exposure / カメラ基礎と露出 / Fundamentos de cámara y exposición) 카테고리를 재사용.
- automation/guide-topics-queue.json 갱신: order 29, 30 두 항목 모두 published: true, publishedDate: "2026-09-24"(KST 기준)로 반영. 총 130개 주제 중 미발행 100개 남음(경고 기준 10개보다 충분히 여유 있음).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일). 발행 패키지에는 두 슬러그의 mdx 파일을 순서대로 넣었으므로, publish-guide.command를 두 번 실행(더블클릭)하면 각 실행이 guide-*-en.mdx 중 하나씩을 처리하며 두 건 모두 정상적으로 커밋·이미지 첨부됨.

## 2026-09-23 — 가이드 아티클 자동 발행: 스튜디오 조명 기초 (예약 작업)

- 신규 가이드 "스튜디오 조명 기초"(order 28, slug: studio-lighting-basics, 4개 언어: en/ja/ko/es) 발행. 키/필/백라이트 3점 조명의 역할 분담부터, 역제곱 법칙으로 조명 거리 변화에 따른 노출 변화를 계산하는 법(1m→2m 시 광량 1/4·약 2스톱 언더, 1m→50cm 시 광량 4배·약 2스톱 오버), 라이트 비율(1:1 평면적인 뷰티 룩 vs 4:1 예시 f/11·f/5.6의 드라마틱한 인물)로 입체감을 조절하는 계산, 소프트박스와 엄브렐러의 광질·그림자 경계 차이, 피사체-배경 간 1.5~2m 이격으로 실루엣 분리하는 법, 조명 각도 실수(너구리 눈 효과)와 캐치라이트 확인 습관까지 실전 체크리스트로 정리.
- 카테고리: 기존 "조명 & 플래시"(en: "Lighting & Flash", ja: "照明とフラッシュ", es: "Iluminación y flash") 카테고리를 그대로 재사용 — 전날(2026-09-22) 플래시 동조 속도 가이드 발행 시 이미 예정했던 대로 같은 카테고리에 배치.
- `automation/guide-topics-queue.json`에서 해당 항목(order 28)을 published: true로 갱신 (publishedDate: 2026-09-23, KST 기준).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 빌드 검증(`npm run build`) 통과 여부는 아래 참고.
- 남은 미발행 주제: 2개 (order 29~30).


## 2026-09-22 — 가이드 아티클 자동 발행: 플래시 동조 속도 이해하기 (예약 작업)

- 신규 가이드 "플래시 동조 속도 이해하기"(order 27, slug: flash-sync-speed-explained, 4개 언어: en/ja/ko/es) 발행. 포컬플레인 셔터의 앞커튼/뒷커튼 구조 때문에 동조 속도(보통 1/200~1/250초)라는 물리적 상한이 생기는 원리부터, 이를 넘겨 촬영했을 때 셔터 속도별로 프레임의 얼마나 많은 영역이 검은 띠로 가려지는지(1/500초 40~50%, 1/1000초 70% 이상), 하이스피드싱크(HSS)로 우회할 때 감수해야 하는 광량 손실(약 2스톱), 써니 16 법칙을 이용한 야외 대낮 필플래시 실전 계산(f/16→f/2.8 개방 시 필요 셔터 1/3200초, 동조 속도 1/250초와의 차이 약 3.7스톱을 ND8 필터 또는 HSS로 해결하는 두 가지 방법), 프론트커튼/리어커튼 동조 차이, 카메라별 동조 속도 편차와 리프셔터 예외, 라디오 트리거 레이턴시로 인한 실전 실수까지 실전 체크리스트로 정리.
- 카테고리: 기존 카테고리 중 적합한 것이 없어 신규 카테고리 "조명 & 플래시"(en: "Lighting & Flash", ja: "照明とフラッシュ", es: "Iluminación y flash")를 새로 생성해 4개 언어에 동일하게 적용. (다음 순번인 order 28 "스튜디오 조명 기초"도 같은 카테고리에 속할 예정이라 신규 카테고리 신설이 합리적이라 판단)
- `automation/guide-topics-queue.json`에서 해당 항목(order 27)을 published: true로 갱신 (publishedDate: 2026-09-22, KST 기준).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 빌드 검증(`npm run build`) 통과: Turbopack 컴파일 성공, TypeScript 통과, 222/222 페이지 정상 생성. (AliExpress/Coupang API 키 미설정으로 인한 gear-recommendation-ssr 초기 fetch 실패 로그는 샌드박스 환경 특유의 무해한 경고이며 이번 작업과 무관)
- 남은 미발행 주제: 3개 (order 28~30).

## 2026-09-21 — 가이드 아티클 자동 발행: 저조도 노이즈 최소화 설정 (예약 작업)

- 신규 가이드 "저조도 노이즈 최소화 설정"(order 26, slug: low-light-noise-reduction-settings, 4개 언어: en/ja/ko/es) 발행. 카메라의 "고감도 노이즈 감소"(이미지 처리)와 "장노출 노이즈 감소"(다크 프레임 추가 촬영)가 서로 다른 원리로 작동한다는 점부터, 스타트레일처럼 연속 촬영·합성이 목적일 때 장노출 노이즈 감소를 꺼야 하는 이유(촬영 시간 2배), ISO 3200·f/2.8·1/15초 손 촬영 시나리오에서 ETTR로 신호 대비 노이즈 비율을 개선하는 방법, 후보정에서 색상 노이즈와 휘도 노이즈를 구분해 슬라이더를 다루는 요령, 여러 장을 평균 내는 스태킹으로 노이즈를 제곱근 비율로 줄이는 기법까지 실전 체크리스트로 정리.
- 카테고리: 기존 "카메라 기초 & 노출"(en: "Camera Basics & Exposure", ja: "カメラ基礎と露出", es: "Fundamentos de cámara y exposición") 카테고리를 그대로 재사용.
- `automation/guide-topics-queue.json`에서 해당 항목(order 26)을 published: true로 갱신 (publishedDate: 2026-09-21, KST 기준).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 남은 미발행 주제: 4개 (order 27~30).

## 2026-09-20 — 가이드 아티클 자동 발행: 파노라마 스티칭 촬영 설정 (예약 작업)

- 신규 가이드 "파노라마 스티칭 촬영 설정"(order 25, slug: panorama-photography-settings, 4개 언어: en/ja/ko/es) 발행. 파노라마 촬영에서 이음매가 어긋나거나 하늘에 색 얼룩이 생기는 원인을 촬영 단계 설정에서 짚고, 노출·화이트밸런스 완전 수동 고정 이유, 오버랩 비율(30% 안팎) 및 24mm 세로 촬영 기준 필요 프레임 수(약 10장) 계산 예시, 노달 포인트(무시차점)와 파노라마 헤드로 시차 고스팅을 막는 방법, 조리개(f/8~f/11)로 회절과 심도 균형 잡기, 편광필터가 넓은 화각에서 하늘 밴딩을 유발하는 이유(기존 "ND필터 vs 편광필터(CPL) 차이" 가이드로 내부 링크), 세로 촬영이 유리한 이유, PTGui/Hugin 등 후반 스티칭 소프트웨어 선택 기준까지 실전 체크리스트로 정리.
- 카테고리: 기존 "장르별 촬영 가이드"(en: "Photography Genres", ja: "ジャンル別撮影ガイド", es: "Guías por género fotográfico") 카테고리를 그대로 재사용.
- `automation/guide-topics-queue.json`에서 해당 항목(order 25)을 published: true로 갱신 (publishedDate: 2026-09-20, KST 기준).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 남은 미발행 주제: 5개 (order 26~30).

## 2026-09-19 — 가이드 아티클 자동 발행: 매크로 포커스 스태킹 기법 (예약 작업)

- 신규 가이드 "매크로 포커스 스태킹 기법"(4개 언어: en/ja/ko/es) 발행. 매크로 촬영에서 조리개를 조여도 심도가 부족할 때 초점 위치를 달리해 여러 장을 촬영·합성하는 포커스 스태킹 기법을 다룸 — 조리개 선택(회절보다 촬영 장수 확보 우선), 스텝 간격·필요 장수 계산 예시, 포커싱 레일/카메라 내장 포커스 브라케팅, 지속광 vs 플래시, 흔들림·피사체 움직임 대응, Helicon Focus 등 합성 소프트웨어 활용까지 실전 체크리스트 포함.
- 카테고리: 기존 "장르별 촬영 가이드"(Photography Genres / ジャンル別撮影ガイド / Guías por género fotográfico) 재사용.
- `automation/guide-topics-queue.json`에서 해당 주제를 published: true로 갱신 (publishedDate: 2026-09-19, KST 기준).
- 검증: `npm run build` 정상 완료(전체 페이지 정상 생성, 신규 가이드 4개 언어 페이지 포함).

## 2026-09-18 — 가이드 아티클 자동 발행: 타임랩스 촬영 설정 (인터벌미터/노출 램핑)

- 예약 작업(매일 오전 6시 KST)으로 신규 가이드 아티클 1건을 4개 언어(en/ja/ko/es)로 작성.
- 주제: "릴리즈/인터벌미터로 타임랩스 설정하기"(order 23, slug: timelapse-camera-settings) — 내장/외장 인터벌미터 차이, 완성 영상 fps·재생시간에서 촬영 간격을 역산하는 방법(예: 24fps 10초 클립=240프레임, 2시간 촬영 시 인터벌 30초), 완전 수동 노출 고정이 필요한 이유와 플리커 발생 원리, 낮 시간대 180도 셔터 법칙과 ND 필터(ND8~ND64)로 스트로빙을 막는 방법, 일출·일몰을 가로지르는 홀리그레일 타임랩스의 수동/자동 노출 램핑(LRTimelapse 등), 배터리·저장공간 실전 계산(10초 인터벌 4시간=1,440프레임 기준), 리모트 릴리즈·미러업·전자식 셔터를 활용한 흔들림 방지, 실전 체크리스트로 마무리.
- 카테고리: 기존 "장르별 촬영 가이드"(en: Photography Genres / ja: ジャンル別撮影ガイド / es: Guías por género fotográfico) 카테고리를 그대로 재사용 (야간·도심·야생동물 등 특정 촬영 기법 가이드와 동일 계열).
- automation/guide-topics-queue.json 갱신: order 23 항목 published: true, publishedDate: "2026-09-18"로 반영.
- 검증: 클론 저장소에서 npm run build 전체 빌드 성공 확인 (신규 가이드 포함 전체 페이지 정상 생성, 에러 없음).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 남은 미발행 주제: 7개 (order 24~30: focus-stacking-for-macro-photography, panorama-photography-settings, low-light-noise-reduction-settings, flash-sync-speed-explained, studio-lighting-basics, using-exposure-compensation, back-button-focus-explained) — 순서대로 진행 예정, 큐 파일 참고.

## 2026-09-17 — 가이드 아티클 자동 발행: 삼각대 선택 가이드 (How to Choose a Tripod)

- 예약 작업(매일 오전 6시 KST)으로 신규 가이드 아티클 1건을 4개 언어(en/ja/ko/es)로 작성.
- 주제: "삼각대 선택 가이드"(order 22, slug: how-to-choose-a-tripod) — 하중 지지력, 다리 재질(알루미늄 vs 카본), 다리 섹션 수, 헤드 방식(볼헤드 vs 팬틸트), 센터 컬럼 트레이드오프 등 실전 구매 기준을 구체적 수치와 함께 정리하고, 촬영 목적별(여행/풍경·장노출/실내) 추천 조합과 실전 체크리스트로 마무리.
- 카테고리: 기존 4개 카테고리(카메라 기초 & 노출 / 장르별 촬영 가이드 / ND 필터 & 장노출 / EXIF 활용 & 공유) 중 적합한 것이 없어 신규 카테고리 "장비 & 액세서리"(en: Gear & Accessories / ja: 機材とアクセサリー / es: Equipo y accesorios) 신설.
- automation/guide-topics-queue.json 갱신: order 22 항목 published: true, publishedDate: "2026-09-17"로 반영.
- 검증: 클론 저장소에서 npm run build 전체 빌드 성공 확인(신규 가이드 포함 152개 가이드 상세 페이지 정상 생성).
- 대표 이미지(image/imageCredit/imageCreditUrl)는 이번 자동 발행 단계에서는 첨부하지 않음 — automation/publish-guide.command 실행 시 attach-guide-image.py가 Unsplash에서 자동으로 가져와 4개 언어 mdx에 삽입함(기존 동작 방식과 동일).
- 남은 미발행 주제: 8개 (timelapse-camera-settings, focus-stacking-for-macro-photography, panorama-photography-settings, low-light-noise-reduction-settings, flash-sync-speed-explained, studio-lighting-basics, using-exposure-compensation, back-button-focus-explained) — 순서대로 진행 예정, 큐 파일 참고.

## 2026-09-16 — 가이드 아티클 자동 발행: "단렌즈 vs 줌렌즈 선택 가이드"

- 배경: 가이드 아티클 매일 자동 발행 예약 작업(order 21)에 따라 신규 가이드 1편을 4개 언어(en/ja/ko/es)로 작성.
- 추가: `content/guides/{en,ja,ko,es}/prime-lens-vs-zoom-lens.mdx` — 단렌즈와 줌렌즈의 구조적 차이(고정 vs 가변 초점거리), 개방 조리개 밝기 차이에 따른 저조도 성능 실측 비교(50mm f/1.8 vs 24-70mm f/2.8, 약 2스탑 차이로 셔터스피드 4배/ISO 4분의 1 차이), 최대개방 해상력·비네팅·왜곡 비교와 "단렌즈가 무조건 더 선명하다"는 통념에 대한 균형 잡힌 반박(고급 줌렌즈의 발전 반영), 무게 비교(50mm f/1.8 약 160g vs 24-70mm f/2.8 800g대, 단렌즈 여러 대 합산 시 체감 차이 변화), 줌렌즈가 유리한 현장 대응 시나리오(결혼식·행사·스포츠), 상황별 선택 기준, 실전 체크리스트를 포함. 카테고리는 기존 "카메라 기초 & 노출"(en: "Camera Basics & Exposure", ja: "カメラ基礎と露出", es: "Fundamentos de cámara y exposición") 카테고리를 그대로 재사용.
- 수정: `automation/guide-topics-queue.json` — order 21 항목(`prime-lens-vs-zoom-lens`)을 `published: true`, `publishedDate: "2026-09-16"`로 갱신.
- 검증: `npm run build` 전체 빌드 통과 (신규 슬러그 4개 언어 페이지 모두 정상 생성 확인, 에러 없음).


## 2026-09-15 — 가이드 아티클 자동 발행: "미러리스 vs DSLR 차이점"

- 배경: 가이드 아티클 매일 자동 발행 예약 작업(order 20)에 따라 신규 가이드 1편을 4개 언어(en/ja/ko/es)로 작성.
- 추가: `content/guides/{en,ja,ko,es}/mirrorless-vs-dslr-explained.mdx` — 미러리스와 DSLR의 근본 구조 차이(OVF vs EVF), 자동초점 커버리지 차이(DSLR 중앙 약 40% vs 미러리스 온센서 AF 90%+), 연사 속도와 뷰파인더 블랙아웃 유무(미러리스 초당 20장+ 블랙아웃 프리 vs DSLR 초당 10장 안팎), 크기·무게(풀프레임 DSLR 약 800g vs 미러리스 약 600g대) 및 CIPA 배터리 수명 실측 수치(미러리스 300~400장 vs DSLR 800~1200장), "미러리스가 무조건 상위호환"이라는 흔한 오해에 대한 균형 잡힌 반박, 상황별 선택 기준, 실전 체크리스트를 포함. 카테고리는 기존 "카메라 기초 & 노출"(en: "Camera Basics & Exposure", ja: "カメラ基礎と露出", es: "Fundamentos de cámara y exposición") 카테고리를 그대로 재사용.
- 수정: `automation/guide-topics-queue.json` — order 20 항목(`mirrorless-vs-dslr-explained`)을 `published: true`, `publishedDate: "2026-09-15"`로 갱신.
- 검증: `npm run build` 전체 빌드 통과 (신규 슬러그 4개 언어 페이지 모두 정상 생성 확인, 에러 없음).

## 2026-09-14 — 가이드 아티클 자동 발행: 필터 스태킹(중첩) 시 주의사항

- 배경: 가이드 아티클 매일 자동 발행 예약 작업(order 19)에 따라 신규 가이드 1편을 4개 언어(en/ja/ko/es)로 작성.
- 추가: `content/guides/{en,ja,ko,es}/filter-stacking-guide.mdx` — ND·CPL·그라데이션 ND를 동시에 겹쳐 쓸 때 발생하는 비네팅(82mm 슬림 필터 2장 기준 24mm 이하에서 발생하는 등 실측 수치 포함), 스태킹 순서(CPL을 가장 바깥쪽에 배치)와 나사산 궁합, 저가형 필터 조합에서 누적되는 색 캐스트·고스트/플레어 문제, 100mm 사각 필터 홀더·마그네틱 시스템 선택 기준, 실전 체크리스트를 포함. 카테고리는 기존 "ND 필터 & 장노출"(en: "ND Filters & Long Exposure", ja: "NDフィルターと長秒露光", es: "Filtros ND y exposición larga") 카테고리를 그대로 재사용.
- 수정: `automation/guide-topics-queue.json` — order 19 항목(`filter-stacking-guide`)을 `published: true`, `publishedDate: "2026-09-14"`로 갱신.
- 검증: `npm run build` 전체 빌드 통과 (신규 슬러그 4개 언어 페이지 모두 정상 생성 확인).

## 2026-09-13

- 새 가이드 발행: "그라데이션 ND필터 완벽 사용법: 스탑 선택부터 포지셔닝까지" (Graduated ND Filter Guide) — en/ja/ko/es 4개 언어
  - 카테고리: ND 필터 & 장노출 (ND Filters & Long Exposure / NDフィルターと長秒露光 / Filtros ND y exposición larga)

## 2026-09-12 (추가) — 가이드 아티클 자동 발행: "ND필터 vs 편광필터(CPL) 차이"

- 배경: 가이드 아티클 매일 자동 발행 예약 작업(order 17)에 따라 신규 가이드 1편을 4개 언어(en/ja/ko/es)로 작성.
- 추가: `content/guides/{en,ja,ko,es}/nd-filter-vs-polarizer-filter.mdx` — ND필터와 편광필터(CPL)의 역할 차이, 실전 노출 수치 예시(f/8·ISO100 기준 셔터스피드 비교 등), 시나리오별 선택 기준, 두 필터를 함께 쓸 때의 광각 렌즈 밴딩·비네팅 주의사항, 실전 체크리스트를 포함. 카테고리는 기존 "ND 필터 & 장노출"(en: "ND Filters & Long Exposure", ja: "NDフィルターと長秒露光", es: "Filtros ND y exposición larga") 카테고리를 그대로 재사용.
- 수정: `automation/guide-topics-queue.json` — order 17 항목(`nd-filter-vs-polarizer-filter`)을 `published: true`, `publishedDate: "2026-09-12"`로 갱신.
- 검증: `npm run build` 전체 빌드 통과 (신규 슬러그 4개 언어 페이지 모두 정상 생성 확인).

## 2026-09-11 — 가이드 아티클 자동 발행: 다이나믹 레인지 이해하기

- 예약 작업(매일 오전 6시 KST)으로 새 가이드 아티클 1건 발행: "다이나믹 레인지란? 계조 손실 없이 담을 수 있는 밝기 범위 완벽 이해" (slug: `understanding-dynamic-range`, order 16).
- 4개 언어(en/ja/ko/es) 모두 작성 완료. 다이나믹 레인지의 정의(포화점~노이즈 바닥, 스톱 단위), ISO에 따른 다이나믹 레인지 변화와 ISO 불변(ISO-invariant) 구간, 노을 풍경 실측 예시(약 12스톱 차이)와 ETTR(노출을 오른쪽으로 밀기) 기법, 화소수·카메라 하이라이트 보정 기능(액티브 D-라이팅/D-레인지 옵티마이저)과 실제 다이나믹 레인지의 차이, 노출 브라케팅 및 HDR 합성 활용법을 다룸.
- 카테고리는 기존 "카메라 기초 & 노출"(각 언어별 대응 카테고리: Camera Basics & Exposure / カメラ基礎と露出 / Fundamentos de cámara y exposición) 재사용.
- `automation/guide-topics-queue.json`의 해당 항목을 `published: true`, `publishedDate: 2026-09-11`로 갱신.
- `npm run build` 검증 통과.
- 애드센스 검수와는 무관한 콘텐츠 추가 작업.

### 2026-09-10
- 가이드 아티클 자동 발행: "크롭바디 vs 풀프레임: 센서 크기와 크롭팩터가 실제로 바꾸는 것들" (sensor-size-and-crop-factor-explained) — en/ja/ko/es 4개 언어 발행, 카테고리: 카메라 기초 & 노출 (기존 카테고리 재사용)

## 2026-09-09 — 가이드 아티클 자동 발행: 손떨림 보정(IBIS/렌즈 손떨림방지) 이해하기

- 예약 작업(매일 오전 6시 KST)으로 새 가이드 아티클 1건 발행: "손떨림 보정(IBIS·렌즈 손떨림방지) 이해하기" (slug: `image-stabilization-explained`, order 14).
- 4개 언어(en/ja/ko/es) 모두 작성 완료. 카테고리는 기존 "카메라 기초 & 노출"(각 언어별 대응 카테고리) 재사용.
- `automation/guide-topics-queue.json`의 해당 항목을 `published: true`, `publishedDate: 2026-09-09`로 갱신.
- `npm run build` 검증 통과.

## 2026-09-08 — 가이드 아티클 자동 발행: "sRGB vs Adobe RGB 색공간 차이"

- New guide article published in all 4 languages (en/ja/ko/es): "Color Space: sRGB vs Adobe RGB" (sRGB vs Adobe RGB 색공간 차이) — covers what a color space/gamut actually is (sRGB ~35.9% vs Adobe RGB ~52.1% of the CIE 1931 visible spectrum, biggest gap in green/cyan), why the camera's color space setting barely matters for RAW but is baked directly into camera JPEGs, a real print-vs-web scenario (Adobe RGB for large-format prints where saturated greens/oranges fall outside sRGB's gamut, sRGB for Instagram/blogs/messaging apps that strip or force-convert profiles), the common mistake of not checking the export color space and delivering one file for both print and web, and practical camera/Lightroom export settings. Filed under the "Camera Basics & Exposure" category (재사용: 기존 "카메라 기초 & 노출" / "Camera Basics & Exposure" / "カメラ基礎と露出" / "Fundamentos de cámara y exposición" 카테고리를 4개 언어 모두 그대로 재사용).
- `automation/guide-topics-queue.json`의 order 13 항목(color-space-srgb-vs-adobe-rgb)을 published: true, publishedDate: "2026-09-08"으로 갱신
- `npm run build` 정상 완료 확인
- 애드센스 검수와는 무관한 콘텐츠 추가 작업

## 2026-09-07 — 가이드 아티클 자동 발행: "하이퍼포컬 디스턴스 계산법"

- New guide article published in all 4 languages (en/ja/ko/es): "Hyperfocal Distance Explained" (하이퍼포컬 디스턴스 계산법) — covers what hyperfocal distance is and why focusing at infinity wastes half the depth of field, the formula H = f² / (N × c) + f with a worked full-frame vs. APS-C example (24mm f/11 full frame ≈ 1.77m vs. equivalent 16mm f/11 APS-C ≈ 1.18m), a real riverside-landscape scenario, the common mistakes of focusing at infinity or zooming in on live view for one subject, and practical field methods (lens DOF scale, calculator apps, adding a stop of margin). Filed under the "Camera Basics & Exposure" category (재사용: 기존 "카메라 기초 & 노출" / "Camera Basics & Exposure" / "カメラ基礎と露出" / "Fundamentos de cámara y exposición" 카테고리를 4개 언어 모두 그대로 재사용).
- `automation/guide-topics-queue.json`의 order 12 항목(hyperfocal-distance-explained)을 published: true, publishedDate: "2026-09-07"으로 갱신
- `npm run build` 정상 완료 확인
- 애드센스 검수와는 무관한 콘텐츠 추가 작업

## 2026-09-06 — 가이드 아티클 자동 발행: "회절 현상과 최적 조리개값"

- New guide article published in all 4 languages (en/ja/ko/es): "Diffraction & Optimal Aperture" (회절 현상과 최적 조리개값) — covers why diffraction happens (light bending through the aperture opening as a wave), how sensor pixel pitch (not the lens) determines the practical diffraction limit for a given body, a real landscape scenario comparing f/11 vs. f/16 with hyperfocal distance, the common "smaller aperture is always safer" mistake, and how to tell diffraction softness apart from camera shake or missed focus. Filed under the "Camera Basics & Exposure" category (재사용: 기존 "카메라 기초 & 노출" / "Camera Basics & Exposure" / "カメラ基礎と露出" / "Fundamentos de cámara y exposición" 카테고리를 4개 언어 모두 그대로 재사용).
- `automation/guide-topics-queue.json`의 order 11 항목(diffraction-and-optimal-aperture)을 published: true, publishedDate: "2026-09-06"으로 갱신
- `npm run build` 정상 완료 확인
- 애드센스 검수와는 무관한 콘텐츠 추가 작업

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