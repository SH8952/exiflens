import { BlogPhoto } from "@/components/blog-photo";
import type { BlogPhotoData } from "@/components/blog-photo-pair";

/**
 * 블로그 본문 사진 한 쌍(서로 다른 두 장) — 좌우에 나란히 보여주고, 각 사진 아래에 그 사진의 EXIF 캡션을 붙인다(2026-10-19).
 * `BlogPhotoPair`(같은 사진의 보정 A/B 비교)와 달리 A/B 라벨이 없고 사진마다 캡션이 있다.
 * 각 사진은 기존 `BlogPhoto`(클릭하면 사진 크기 팝업으로 원본 보기)를 그대로 사용하며,
 * 모바일에서도 좌우 배치가 유지되도록 항상 2열이다. 가로·세로 사진이 섞여도 세로 가운데 정렬.
 */
export type BlogPhotoDuoItem = BlogPhotoData & { caption: string };

export function BlogPhotoDuo({
  a,
  b,
}: {
  a: BlogPhotoDuoItem;
  b: BlogPhotoDuoItem;
}) {
  return (
    <div className="not-prose my-6">
      <div className="grid grid-cols-2 items-center gap-2 sm:gap-4">
        {[a, b].map(({ caption, ...photo }) => (
          <figure key={photo.src} className="m-0 min-w-0">
            <BlogPhoto {...photo} />
            <figcaption className="mt-1.5 text-center text-xs italic text-muted-foreground sm:text-sm">
              {caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-center text-xs italic text-muted-foreground">
        (사진을 클릭하면 원본 크기로 볼 수 있습니다)
      </p>
    </div>
  );
}
