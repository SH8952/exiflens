import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const DEV_EXCLUDE_COOKIE = "dev_exclude";
const DEV_EXCLUDE_TOKEN = process.env.DEV_EXCLUDE_TOKEN;

/**
 * Wraps next-intl's locale-routing middleware to also forward the
 * visitor's real country (set by Vercel's edge network as the
 * `x-vercel-ip-country` request header) into a short-lived cookie.
 *
 * This is the "geo" half of the locale+geo affiliate mix described to the
 * user: the UI language (`/ko`, `/en`, ...) is the default signal for which
 * affiliate program to show (see src/lib/affiliate.ts), and this cookie
 * lets us override that guess with the visitor's actual location when
 * Vercel provides one. Locally (or off Vercel) the header is absent, the
 * cookie is never set, and resolution falls back to locale alone.
 */
export default function proxy(request: NextRequest) {
  let response = intlMiddleware(request);

  // next-intl redirects prefix-less URLs (/blog/x -> /en/blog/x) with 307
  // (temporary), which lets search engines keep indexing the prefix-less URL
  // as canonical. The move is permanent, so answer 308 instead. The bare root
  // "/" is left alone (it keeps next-intl's default behaviour).
  const redirectTarget = response.headers.get("location");
  if (
    response.status === 307 &&
    redirectTarget &&
    request.nextUrl.pathname !== "/"
  ) {
    const permanent = NextResponse.redirect(redirectTarget, 308);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "location") return;
      if (key.toLowerCase() === "set-cookie") permanent.headers.append(key, value);
      else permanent.headers.set(key, value);
    });
    response = permanent;
  }

  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    response.cookies.set("geo-country", country, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }


  // Developer-exclusion cookie: visiting the site once with
  // "?dev=<DEV_EXCLUDE_TOKEN>" sets a ~1 year cookie that the visitor
  // counter API (src/app/api/visitor-count/route.ts) and the GA4 inline
  // script (src/app/[locale]/layout.tsx) both check to skip counting this
  // visitor. Cookie-based (not IP-based) so it works from any network,
  // including a mobile bookmark accessed away from home.
  if (
    DEV_EXCLUDE_TOKEN &&
    request.nextUrl.searchParams.get("dev") === DEV_EXCLUDE_TOKEN
  ) {
    response.cookies.set(DEV_EXCLUDE_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
