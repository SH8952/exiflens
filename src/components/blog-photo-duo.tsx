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
  stack = false,
}: {
  a: BlogPhotoDuoItem;
  b: BlogPhotoDuoItem;
  /** true면 좌우가 아니라 위아래로 한 장씩 배치(가로·세로 사진이 섞일 때). 세로 사진은 폭을 줄여 너무 커지지 않게 한다. */
  stack?: boolean;
}) {
  return (
    <div className="not-prose my-6">
      <div
        className={
          stack
            ? "flex flex-col items-center gap-6"
            : "grid grid-cols-2 items-center gap-2 sm:gap-4"
        }
      >
        {[a, b].map(({ caption, ...photo }) => (
          <figure
            key={photo.src}
            className={
              stack
                ? `m-0 w-full min-w-0 ${photo.height > photo.width ? "max-w-sm" : ""}`
                : "m-0 min-w-0"
            }
          >
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
