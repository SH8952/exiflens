"use client";

import type { MouseEvent } from "react";

/**
 * 블로그 본문 사진 — 프레임이 입혀진 사진을 보여주고, 클릭하면 프레임 없는 큰 사진을
 * 사진 크기에 맞춘 별도 창(팝업)으로 연다(2026-10-02). 팝업 안의 사진을 다시 클릭하면
 * 창이 닫힌다(`/blog/viewer.html`). 팝업이 막히면 새 탭으로 연다. 링크(href)는 그대로
 * 남아 있어 JS 없이도, 가운데 클릭/새 탭 열기로도 큰 사진을 볼 수 있다.
 */
export function BlogPhoto({
  src,
  full,
  alt,
  width,
  height,
  fullWidth,
  fullHeight,
}: {
  src: string;
  full: string;
  alt: string;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
}) {
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    // 수정 키(새 탭/창으로 열기)는 브라우저 기본 동작에 맡긴다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();

    const maxW = Math.floor(window.screen.availWidth * 0.9);
    const maxH = Math.floor(window.screen.availHeight * 0.9);
    const scale = Math.min(1, maxW / fullWidth, maxH / fullHeight);
    const w = Math.round(fullWidth * scale);
    const h = Math.round(fullHeight * scale);
    const left = Math.max(0, Math.round((window.screen.availWidth - w) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - h) / 2));

    const popup = window.open(
      `/blog/viewer.html?src=${encodeURIComponent(full)}`,
      "blog-photo-viewer",
      `popup=yes,width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no`,
    );
    if (popup) {
      popup.focus();
    } else {
      window.open(full, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      href={full}
      target="_blank"
      rel="noopener noreferrer"
      onClick={open}
      className="block cursor-zoom-in"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="mx-auto"
      />
    </a>
  );
}
