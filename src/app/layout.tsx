import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ExifLens",
  // 네이버 서치어드바이저(웹마스터도구) 사이트 소유확인용 태그.
  verification: {
    other: {
      "naver-site-verification": "41aa56845f79f6d6fdd62e20459d9ee00d4b2a1f",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
