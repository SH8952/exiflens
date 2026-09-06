import { NextRequest, NextResponse } from "next/server";
import {
  AliexpressApiError,
  AliexpressConfigError,
  searchAliexpressProducts,
  type AliexpressProduct,
} from "@/lib/aliexpress";
import { getBlockedProductIds } from "@/lib/aliexpress-blocklist";

// Row 1 (ND filter section). 2026-09-06: 사용자가 직접 지정한 ND 필터
// 제조사 브랜드명 기반 키워드로 전면 교체(기존 "ND1000 filter" 같은 범용
// 문구는 결과 정확도는 준수했지만, 브랜드 지정으로 상품 신뢰도를 더 높이기
// 위함). 브랜드별로 결과가 갈리므로 5개 브랜드 = 5개 키워드, 키워드당 1개씩
// 노출(ROW1_DISPLAY_COUNT=5)해 다양한 브랜드가 골고루 보이도록 유지.
const ROW1_KEYWORDS = ["nisi nd", "benro nd", "neewer nd", "haida nd", "freewell nd"];
const ROW1_DISPLAY_COUNT = 5;
const ROW1_POOL_SIZE = 5;

// Row 2 (camera accessories). 2026-09-06: 사용자가 직접 지정한 액세서리
// 제조사 브랜드명 기반 키워드로 전면 교체(기존 "camera bag" 같은 범용
// 문구는 알리익스프레스 자체 연관도 판정이 느슨해 무관 상품까지 끌어오는
// 문제가 있었음 — 브랜드명 검색은 그 자체로도 관련도가 높지만,
// BLACKLIST_TITLE_WORDS 2차 필터는 안전장치로 계속 유지).
const ACCESSORY_KEYWORDS = ["smallrig", "tilta", "ulanzi", "falcam", "lexar", "telesin"];
const ACCESSORY_DISPLAY_COUNT = 5;
const ACCESSORY_POOL_SIZE = 10;

// 2026-09-06: 사용자가 실제 화면에서 캡처한, 관계없는 상품(로봇 장난감,
// 폰 케이스, 완구용 카메라, 범용 메모리스틱 등)이 함께 노출되던 문제 대응.
// 키워드를 구체화하는 것만으로는 알리익스프레스 자체 검색 연관도 로직을
// 완전히 통제할 수 없어, 응답으로 받은 상품 제목을 한 번 더 걸러내는
// 두 번째 안전장치. 새로 걸러야 할 패턴(제목에 공통으로 나타나는 단어)이
// 보이면 이 목록만 추가하면 됨. 특정 상품 하나만 정밀하게 차단하려면(패턴이
// 아니라 개별 상품인 경우) src/lib/aliexpress-blocklist.ts의 productId 기반
// 차단 목록을 대신 사용 — 개발 서버에서 상품 카드를 클릭해 선택 후 "Ads
// Block" 버튼으로 등록할 수 있음(src/components/aliexpress-gear-cards.tsx).
// 참고: 상품 제목은 target_language(en/ja/es)에 따라 언어가 달라지므로,
// 새 항목을 걸러야 할 때는 스크린샷에 보인 언어 그대로의 단어/구문을 그대로
// 추가하면 됨(영문으로 번역해서 넣지 않아도 됨) — 필요하면 다른 언어 버전도
// 함께 추가해 안전망을 넓힐 수 있음.
const BLACKLIST_TITLE_WORDS = [
  "robot",
  "companion",
  "plush",
  "doll",
  "toy",
  "kids camera",
  "instant print",
  "phone case",
  "iphone",
  "samsung galaxy",
  "smart watch",
  "earbuds",
  "headphone",
  "bluetooth speaker",
  // 2026-09-06 추가(사용자 캡처 화면 기준, es 로케일에서 노출됨): 우물
  // 굴착 장비, 보트 모터 트림/틸트 스위치 — 카메라 액세서리 키워드와
  // 완전히 무관한 상품
  "perforación de pozos",
  "water well drilling",
  "trim y tilt",
  "trim and tilt",
];

function isRelevantProduct(product: AliexpressProduct, blockedIds: Set<string>): boolean {
  if (blockedIds.has(product.productId)) return false;
  const title = product.productName.toLowerCase();
  return !BLACKLIST_TITLE_WORDS.some((word) => title.includes(word));
}

// UI locale -> AliExpress target_currency / target_language. AliExpress
// pricing/localization is independent from Coupang's (which is Korea-only,
// see src/app/api/coupang/search/route.ts), so this only covers the
// locales that resolve to the "aliexpress" provider (everything except ko
// — see src/lib/affiliate.ts).
const LOCALE_TO_ALIEXPRESS: Record<string, { currency: string; language: string }> = {
  en: { currency: "USD", language: "EN" },
  ja: { currency: "JPY", language: "JA" },
  es: { currency: "EUR", language: "ES" },
};
const DEFAULT_ALIEXPRESS_LOCALE = { currency: "USD", language: "EN" };

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(0, count));
}

// 2026-09-06 수정: 기존에는 각 키워드 풀의 실제 재고(capacities)를 고려하지
// 않고 무작위로 배분해서, 특정 키워드의 검색 결과가 적을 때(예: 재고가
// 2개뿐인데 3개를 배정) 그 초과분이 그냥 버려져 총 노출 개수가
// ACCESSORY_DISPLAY_COUNT(5개)보다 적게 뜨는 문제가 있었음(사용자가 "5개
// 중 4개만 뜬다"고 제보). capacities로 각 풀의 남은 여유만큼만 배정하고,
// 여유가 없는 풀은 배정 대상에서 제외해 다른 풀로 넘기도록 수정 — 전체
// 재고 합이 total 이상이면 항상 total개를 채움.
function randomDistribution(total: number, capacities: number[]): number[] {
  const counts = new Array(capacities.length).fill(0);
  let remaining = total;
  while (remaining > 0) {
    const available = counts
      .map((count, i) => (count < capacities[i] ? i : -1))
      .filter((i) => i >= 0);
    if (available.length === 0) break;
    const i = available[Math.floor(Math.random() * available.length)];
    counts[i]++;
    remaining--;
  }
  return counts;
}

// 2026-09-06: 한때 "Test 상태 앱의 요청 빈도 제한"으로 추정해 이 7건을
// 0.3초 간격 순차 요청으로 바꿨었으나, 같은 시점에 .env.local의 App
// Secret 오탈자도 함께 고쳐져서 실제로 어느 쪽이 원인이었는지 확정할 수
// 없었음. 자격증명이 이미 정상인 상태이므로 원래의 동시 요청 방식으로
// 되돌려 실제로 문제가 재발하는지 확인 중 — 재발하면 다시 순차로 바꿀 것.
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "";
  const target = LOCALE_TO_ALIEXPRESS[locale] ?? DEFAULT_ALIEXPRESS_LOCALE;

  const [row1Settled, accessorySettled] = await Promise.all([
    Promise.allSettled(
      ROW1_KEYWORDS.map((keyword) =>
        searchAliexpressProducts(keyword, ROW1_POOL_SIZE, {
          targetCurrency: target.currency,
          targetLanguage: target.language,
        }),
      ),
    ),
    Promise.allSettled(
      ACCESSORY_KEYWORDS.map((keyword) =>
        searchAliexpressProducts(keyword, ACCESSORY_POOL_SIZE, {
          targetCurrency: target.currency,
          targetLanguage: target.language,
        }),
      ),
    ),
  ]);

  const anyConfigMissing = [...row1Settled, ...accessorySettled].some(
    (r) => r.status === "rejected" && r.reason instanceof AliexpressConfigError,
  );
  if (anyConfigMissing) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  for (const result of [...row1Settled, ...accessorySettled]) {
    if (result.status === "rejected") {
      if (result.reason instanceof AliexpressApiError) {
        console.error("[aliexpress] API error:", result.reason.message);
      } else {
        console.error("[aliexpress] unexpected error:", result.reason);
      }
    }
  }

  const blockedIds = getBlockedProductIds();
  const row1Pools: AliexpressProduct[][] = row1Settled.map((r) =>
    r.status === "fulfilled" ? r.value.filter((p) => isRelevantProduct(p, blockedIds)) : [],
  );
  const accessoryPools: AliexpressProduct[][] = accessorySettled.map((r) =>
    r.status === "fulfilled" ? r.value.filter((p) => isRelevantProduct(p, blockedIds)) : [],
  );

  const availableRow1Indexes = row1Pools
    .map((pool, i) => (pool.length > 0 ? i : -1))
    .filter((i) => i >= 0);
  const chosenRow1Indexes = pickRandom(
    availableRow1Indexes,
    Math.min(ROW1_DISPLAY_COUNT, availableRow1Indexes.length),
  );
  const row1Products = chosenRow1Indexes
    .map((i) => pickRandom(row1Pools[i], 1)[0])
    .filter((p): p is AliexpressProduct => Boolean(p));

  const distribution = randomDistribution(
    ACCESSORY_DISPLAY_COUNT,
    accessoryPools.map((pool) => pool.length),
  );
  const accessoryProducts = accessoryPools.flatMap((pool, i) =>
    pickRandom(pool, distribution[i]),
  );

  const products = [
    ...pickRandom(row1Products, row1Products.length),
    ...pickRandom(accessoryProducts, accessoryProducts.length),
  ];

  if (products.length === 0) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
}
