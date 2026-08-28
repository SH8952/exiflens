import { NextResponse } from "next/server";
import {
  CoupangApiError,
  CoupangConfigError,
  searchCoupangProducts,
  type CoupangProduct,
} from "@/lib/coupang";

// Row 1 (ND filter section): well-known filter brand names plus one generic
// "가변 ND" search, so results span multiple manufacturers instead of being
// dominated by whichever single brand ranks highest for one generic
// keyword. Only ROW1_DISPLAY_COUNT of these are shown per visit, so the
// exact line-up (which brand/keyword is included) also varies.
const ROW1_KEYWORDS = [
  "에이치앤와이 nd",
  "겐코 nd",
  "니시 nd",
  "벤로 nd",
  "슈나이더크로이츠나흐 nd",
  "가변nd",
];
const ROW1_DISPLAY_COUNT = 5;
// Per keyword, how many of its top results we pool from so a different
// product from the same brand/keyword can show up on different visits.
const ROW1_POOL_SIZE = 5;

// Row 2 (camera accessories): all three categories are always queried and
// mixed together (rather than picking a single category per visit), so
// every visit shows a blend of bags/tripods/memory cards rather than one
// category monopolizing the row.
const ACCESSORY_KEYWORDS = ["카메라 가방", "카메라 삼각대", "카메라 메모리카드"];
const ACCESSORY_DISPLAY_COUNT = 5;
const ACCESSORY_POOL_SIZE = 10;

// Total distinct keywords across both rows: 6 (row 1) + 3 (row 2) = 9,
// still under the Coupang Open API's 10 calls/hour account limit — each
// keyword's underlying fetch is cached (see src/lib/coupang.ts), so
// re-running this handler on every request re-shuffles the display without
// costing any extra API calls.

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(0, count));
}

/**
 * Splits `total` into `parts` non-negative integers that sum to `total`,
 * giving every part at least 1 (when total >= parts) and randomly
 * distributing the remainder — e.g. for 3 parts summing to 5, produces
 * something like [2, 2, 1] or [3, 1, 1], never fewer than 1 per part.
 */
function randomDistribution(total: number, parts: number): number[] {
  const counts = new Array(parts).fill(0);
  let remaining = total;
  for (let i = 0; i < parts && remaining > 0; i++) {
    counts[i] = 1;
    remaining--;
  }
  while (remaining > 0) {
    const i = Math.floor(Math.random() * parts);
    counts[i]++;
    remaining--;
  }
  return counts;
}

export async function GET() {
  const [row1Settled, accessorySettled] = await Promise.all([
    Promise.allSettled(
      ROW1_KEYWORDS.map((keyword) => searchCoupangProducts(keyword, ROW1_POOL_SIZE)),
    ),
    Promise.allSettled(
      ACCESSORY_KEYWORDS.map((keyword) =>
        searchCoupangProducts(keyword, ACCESSORY_POOL_SIZE),
      ),
    ),
  ]);

  // A config error (missing API keys) affects every call identically, so
  // one is enough to tell the UI to hide the section quietly rather than
  // show a scary error.
  const anyConfigMissing = [...row1Settled, ...accessorySettled].some(
    (r) => r.status === "rejected" && r.reason instanceof CoupangConfigError,
  );
  if (anyConfigMissing) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  for (const result of [...row1Settled, ...accessorySettled]) {
    if (result.status === "rejected") {
      if (result.reason instanceof CoupangApiError) {
        console.error("[coupang] API error:", result.reason.message);
      } else {
        console.error("[coupang] unexpected error:", result.reason);
      }
    }
  }

  const row1Pools: CoupangProduct[][] = row1Settled.map((r) =>
    r.status === "fulfilled" ? r.value : [],
  );
  const accessoryPools: CoupangProduct[][] = accessorySettled.map((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  // Row 1: randomly keep ROW1_DISPLAY_COUNT of the available keyword pools
  // (dropping the rest for this visit), then pick one random product from
  // each kept pool.
  const availableRow1Indexes = row1Pools
    .map((pool, i) => (pool.length > 0 ? i : -1))
    .filter((i) => i >= 0);
  const chosenRow1Indexes = pickRandom(
    availableRow1Indexes,
    Math.min(ROW1_DISPLAY_COUNT, availableRow1Indexes.length),
  );
  const row1Products = chosenRow1Indexes
    .map((i) => pickRandom(row1Pools[i], 1)[0])
    .filter((p): p is CoupangProduct => Boolean(p));

  // Row 2: split ACCESSORY_DISPLAY_COUNT across the three categories with a
  // random-but-balanced distribution, then pick that many random products
  // from each category's pool.
  const distribution = randomDistribution(ACCESSORY_DISPLAY_COUNT, accessoryPools.length);
  const accessoryProducts = accessoryPools.flatMap((pool, i) =>
    pickRandom(pool, distribution[i]),
  );

  // Combine, then shuffle within each row so brand/category groupings
  // aren't visually clustered in a fixed order.
  const products = [
    ...pickRandom(row1Products, row1Products.length),
    ...pickRandom(accessoryProducts, accessoryProducts.length),
  ];

  if (products.length === 0) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  return NextResponse.json(
    { products },
    // No response caching here: the underlying Coupang fetch (see
    // src/lib/coupang.ts) is already cached per keyword, so re-running this
    // handler on every request costs no extra API calls — it just
    // re-shuffles which items from the cached pools are shown.
    { headers: { "Cache-Control": "no-store" } },
  );
}
