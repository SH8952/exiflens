import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Basic browser-protection headers. A Content-Security-Policy is intentionally
// NOT set here: AdSense, GA4 and the map embed load scripts/frames from many
// third-party hosts, and a CSP that is too strict would silently block them.
// Permissions-Policy is also left unset (the golden-hour calculator uses the
// browser's geolocation).
const securityHeaders = [
  // Don't let browsers guess a file's type from its content.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only this site itself may embed its pages in a frame (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Same as the browsers' modern default: full URL for same-site requests,
  // origin only for cross-site requests, nothing when downgrading to http.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
