# 구글 애드센스 승인 심사 통과율 극대화 전략 및 구현 가이드

---

## 1. 필수의무 정적 페이지 (Policy Pages)
애드센스 심사팀이 사이트를 검수할 때 가장 먼저 확인하는 기본 요건입니다. 푸터(Footer) 영역에 반드시 해당 링크들을 노출해야 합니다.

- **Privacy Policy (개인정보처리방침):** 
  - "당사는 쿠키 및 구글 애드센스, 제휴 마케팅 링크를 통해 유저 데이터를 활용할 수 있습니다" 문구 포함 (글로벌 타겟이므로 영어 작성 권장).
- **Terms of Service (이용약관):** 서비스 이용 및 콘텐츠 저작권 관련 약관.
- **About Us (사이트/개발자 소개):** 서비스 목적, 제공하는 도구의 가치, 연락처(Contact Email) 명시.
- **Affiliate Disclosure (제휴 마케팅 고지문):** 
  - 쿠팡 파트너스 및 아마존 어필리에이트 승인 규정에 따른 수수료 지급 가능성 명시.

---

## 2. 가치 있는 텍스트 콘텐츠 확보 (Low Value Content 방지)
구글 크롤러는 JavaScript로 구동되는 웹 애플리케이션(계산기, 프레임 생성기) 자체를 '텍스트 콘텐츠'로 인식하지 못하므로 풍부한 텍스트 가이드(블로그 글)가 필수입니다.

- **가이드/블로그 섹션 추가 (`/guides` 또는 `/blog` 경로):**
  - 최소 **15~20개 이상의 정성스러운 글로벌 검색용 아티클** 작성 및 발행.
  - **주제 예시:**
    1. *How to Choose the Right ND Filter for Long Exposure Photography*
    2. *Understanding EXIF Data: ISO, Shutter Speed, and Aperture Explained*
    3. *Best Camera Settings for Landscape and Waterflow Photography*
    4. *How to Add Professional EXIF Watermark/Frame to Your Photos*
- **글당 분량:** 최소 1,000~1,500단어 이상의 유용하고 전문적인 텍스트 콘텐츠.
- **메인 페이지 하단 설명 텍스트:** 툴 UI 아래쪽에 "EXIF 분석기 및 ND 필터 계산기 사용법", "자주 묻는 질문(FAQ)" 텍스트 영역 구축.

---

## 3. SEO 및 기술적 품질 (Technical Quality)
- **Google Search Console 인덱싱:** `sitemap.xml` 및 `robots.txt` 제출 후 주요 페이지 정상 수집 확인.
- **모바일 반응형 & 속도 최적화:** Google PageSpeed Insights 점수 모바일 기준 80점 이상 유지.
- **i18n 메타데이터:** `/en`, `/ko` 등 언어별 URL이 올바른 `canonical` 태그 및 `hreflang` 태그를 가리키도록 설정.

---

## 4. 애드센스 심사 신청 전 최종 체크리스트

| 점검 항목 | 통과 기준 | 비고 |
| :--- | :--- | :--- |
| **도메인 연결** | 서브도메인이 아닌 **루트 도메인**(`exiflens.com`) 신청 | Vercel 기본 주소(`.vercel.app`)로 신청 불가 |
| **콘텐츠 수** | 최소 15~20개 이상의 텍스트 가이드 글 작성 완료 | 저품질/자동생성 글 지양 |
| **404 에러 / 깨진 링크** | 메뉴/푸터의 모든 버튼 및 링크 정상 작동 | 빈 페이지 존재 시 즉시 거절 |
| **광고 코드 위치** | `pub-` 태그가 `<head>` 영역에 정확히 삽입되어 있는지 | Next.js `Script` 컴포넌트 활용 |
| **제휴 링크 조절** | 승인 받기 전까지는 제휴 마케팅 링크 수 최소화 | 광고 과다 사이트로 오인 방지 |

---

## 5. 클로드(Claude) 전달용 SEO & 애드센스 최적화 프롬프트 (Phase 6)

```text
Please optimize our ExifLens web service to meet Google AdSense approval requirements and maximize SEO scores.

Requirements:
1. Static Policy Pages Setup:
   - Create route pages for `/privacy`, `/terms`, `/about`, and `/disclosure` (Affiliate disclosure).
   - Ensure these links are naturally rendered in the site Footer component.

2. SEO & Content Architecture:
   - Build a `/guides` blog directory using MDX or JSON file routing to render long-form articles.
   - Implement dynamic `sitemap.ts` and `robots.ts` in Next.js App Router.
   - Add Schema.org structured data (WebApplication, HowTo, Article) to improve Google Rich Snippets.
   - Ensure all language paths (/en, /ko, etc.) render correct `canonical` and `hreflang` meta tags.

3. Main Page Text Content (For Google Crawler):
   - Below the EXIF Frame Generator and ND Calculator UI, add a dedicated text section featuring "How to Use ExifLens", "ND Filter Long Exposure Chart", and an "FAQ Section" with collapsible accordions.

4. AdSense Integration:
   - Include Google AdSense script integration snippet safely in `app/[locale]/layout.tsx` using Next.js `<Script>` component with strategy `afterInteractive`.
```
