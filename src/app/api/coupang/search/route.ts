import { NextResponse } from "next/server";
import {
  CoupangApiError,
  CoupangConfigError,
  searchCoupangProducts,
  type CoupangProduct,
} from "@/lib/coupang";

// Whitelisted keywords only — the Coupang Open API allows just 10 calls per
// hour for this account, and Next.js's fetch cache (see src/lib/coupang.ts)
// dedupes calls by exact keyword for its revalidate window. Accepting
// arbitrary free-text from the client would let each unique query burn a
// call and bypass the cache, so we only ever search for one of these fixed,
// ND-filter-relevant terms.
const FILTER_KEYWORDS: Record<string, string> = {
  nd4: "ND4 카메라 필터",
  nd8: "ND8 카메라 필터",
  nd64: "ND64 카메라 필터",
  nd1000: "ND1000 카메라 필터",
  nd32000: "가변 ND 카메라 필터",
  custom: "ND 필터 카메라",
};

// Camera-accessory keywords shown alongside the ND-filter results. One is
// picked at random per request; combined with the 6 filter keywords above,
// the worst case is 6 + 3 = 9 distinct cached Coupang searches within any
// rolling hour — still under the account's 10 calls/hour limit.
const ACCESSORY_KEYWORDS = ["카메라 가방", "카메라 삼각대", "카메라 메모리카드"];

// How many products each half of the grid shows, and how large a pool we
// pull from Coupang (capped at the API's own max of 10) so we can show a
// different random subset on every request without any extra API calls —
// the underlying Coupang fetch for a given keyword is still cached for the
// revalidate window in src/lib/coupang.ts, so this pool is reused across
// every visitor during that window at no extra API cost.
const RESULTS_PER_SECTION = 5;
const POOL_SIZE = 10;

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "";
  const filterKeyword = FILTER_KEYWORDS[filter];

  if (!filterKeyword) {
    return NextResponse.json(
      { error: "unknown filter", allowed: Object.keys(FILTER_KEYWORDS) },
      { status: 400 },
    );
  }

  const accessoryKeyword =
    ACCESSORY_KEYWORDS[Math.floor(Math.random() * ACCESSORY_KEYWORDS.length)];

  const [filterResult, accessoryResult] = await Promise.allSettled([
    searchCoupangProducts(filterKeyword, POOL_SIZE),
    searchCoupangProducts(accessoryKeyword, POOL_SIZE),
  ]);

  // A config error (missing API keys) affects every call identically, so
  // one is enough to tell the UI to hide the section quietly rather than
  // show a scary error — matches the previous single-call behavior.
  const configMissing = [filterResult, accessoryResult].some(
    (r) => r.status === "rejected" && r.reason instanceof CoupangConfigError,
  );
  if (configMissing) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  for (const result of [filterResult, accessoryResult]) {
    if (result.status === "rejected") {
      if (result.reason instanceof CoupangApiError) {
        console.error("[coupang] API error:", result.reason.message);
      } else {
        console.error("[coupang] unexpected error:", result.reason);
      }
    }
  }

  const filterPool: CoupangProduct[] =
    filterResult.status === "fulfilled" ? filterResult.value : [];
  const accessoryPool: CoupangProduct[] =
    accessoryResult.status === "fulfilled" ? accessoryResult.value : [];

  // First half: ND-filter products for the selected filter. Second half:
  // camera accessories from a randomly chosen category. Returned as one
  // flat list — the client grid wraps every RESULTS_PER_SECTION items onto
  // its own row, so no section heading or visual divider is needed.
  const products = [
    ...pickRandom(filterPool, RESULTS_PER_SECTION),
    ...pickRandom(accessoryPool, RESULTS_PER_SECTION),
  ];

  if (products.length === 0) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  return NextResponse.json(
    { products },
    // No response caching here: the underlying Coupang fetch (see
    // src/lib/coupang.ts) is already cached per keyword, so re-running this
    // handler on every request costs no extra API calls — it just
    // re-shuffles which items from the cached pool are shown.
    { headers: { "Cache-Control": "no-store" } },
  );
}
