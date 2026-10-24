import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight per-IP request limiter for the public API routes.
 *
 * Why in-memory (not Redis): the Upstash Redis instance is shared by the
 * visitor counter and the Coupang/AliExpress result caches, so every check
 * done there would spend extra Redis commands and could itself be abused to
 * burn the free-tier quota. This limiter keeps a small fixed-window counter
 * in the server instance's own memory instead — zero extra Redis cost.
 *
 * Trade-off: each serverless instance keeps its own counters, so the real
 * limit across instances can be somewhat higher than the configured number.
 * That is acceptable here: the goal is to stop loops/floods from a single
 * client, not to enforce an exact quota. The limits below are deliberately
 * generous so shared IPs (offices, schools, mobile carrier NAT) are not hit.
 *
 * Skipped entirely in `next dev`, so local development is never throttled.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

function clientIp(request: NextRequest): string {
  // On Vercel these headers are set by the platform edge (not client-controlled).
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns a 429 response when the caller exceeded `limit` requests within
 * `windowMs`, or `null` when the request may proceed.
 *
 * The 429 body is `{ products: [] }`-shaped on purpose for the gear-card
 * routes (see `emptyBody`), so the existing client code treats it exactly
 * like "no products available" and hides/keeps the section quietly.
 */
export function rateLimit(
  request: NextRequest,
  bucketName: string,
  limit: number,
  windowMs = 60_000,
  emptyBody: Record<string, unknown> = {},
): NextResponse | null {
  if (process.env.NODE_ENV === "development") return null;

  const now = Date.now();
  if (buckets.size > MAX_TRACKED_KEYS) sweepExpired(now);
  // Still too large after sweeping expired entries (a flood of distinct
  // addresses): drop everything rather than grow without bound.
  if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();

  const key = `${bucketName}:${clientIp(request)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(emptyBody, {
    status: 429,
    headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" },
  });
}
