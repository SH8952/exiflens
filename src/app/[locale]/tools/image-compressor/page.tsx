import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isToolAccessible } from "@/lib/tools-roster";
import {
  ImageToolPage,
  buildImageToolMetadata,
} from "@/components/image-tools/image-tool-page";
import { ImageCompressorCard } from "@/components/image-tools/image-compressor-card";

const SLUG = "image-compressor";
const NAMESPACE = "ImageCompressor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildImageToolMetadata(locale, SLUG, NAMESPACE);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 숨김(hidden) 도구는 운영 환경에서 404 — 공개 전에는 주소로도 접근할 수 없다.
  if (!isToolAccessible(SLUG)) notFound();
  setRequestLocale(locale);
  return (
    <ImageToolPage locale={locale} slug={SLUG} namespace={NAMESPACE}>
      <ImageCompressorCard />
    </ImageToolPage>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
