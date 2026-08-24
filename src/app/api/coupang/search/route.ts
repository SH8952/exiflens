import { NextResponse } from "next/server";
import {
  CoupangApiError,
  CoupangConfigError,
  searchCoupangProducts,
} from "@/lib/coupang";

// Whitelisted keywords only — the Coupang Open API allows just 10 calls per
// hour for this account, and Next.js's fetch cache dedupes calls by exact
// URL. Accepting arbitrary free-text from the client would let each unique
// query burn a call and bypass the cache, so we only ever search for one of
// these fixed, ND-filter-relevant terms.
const FILTER_KEYWORDS: Record<string, string> = {
  nd4: "ND4 카메라 필터",
  nd8: "ND8 카메라 필터",
  nd64: "ND64 카메라 필터",
  nd1000: "ND1000 카메라 필터",
  nd32000: "ND32000 카메라 필터",
  custom: "ND 필터 카메라",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "";
  const keyword = FILTER_KEYWORDS[filter];

  if (!keyword) {
    return NextResponse.json(
      { error: "unknown filter", allowed: Object.keys(FILTER_KEYWORDS) },
      { status: 400 },
    );
  }

  try {
    const products = await searchCoupangProducts(keyword, 4);
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (error) {
    if (error instanceof CoupangConfigError) {
      // Not configured (e.g. local dev without keys) — fail quietly so the
      // UI can just hide the section rather than show a scary error.
      return NextResponse.json({ products: [] }, { status: 200 });
    }
    if (error instanceof CoupangApiError) {
      console.error("[coupang] API error:", error.message);
      return NextResponse.json({ products: [], error: "upstream" }, { status: 502 });
    }
    console.error("[coupang] unexpected error:", error);
    return NextResponse.json({ products: [], error: "unknown" }, { status: 500 });
  }
}
