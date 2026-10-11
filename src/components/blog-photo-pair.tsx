import { BlogPhoto } from "@/components/blog-photo";

/**
 * 블로그 본문 사진 한 쌍(보정 A / 보정 B) — 같은 사진을 서로 다른 보정으로 좌우에 나란히 보여준다(2026-10-11).
 * 각 사진은 기존 `BlogPhoto`(클릭하면 사진 크기 팝업으로 원본 보기)를 그대로 사용한다.
 * 모바일에서도 좌우 비교가 유지되도록 항상 2열로 배치한다.
 */
export type BlogPhotoData = {
  src: string;
  full: string;
  alt: string;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
};

export function BlogPhotoPair({ a, b }: { a: BlogPhotoData; b: BlogPhotoData }) {
  const items: { label: string; photo: BlogPhotoData }[] = [
    { label: "A", photo: a },
    { label: "B", photo: b },
  ];
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-2 sm:gap-4">
      {items.map(({ label, photo }) => (
        <figure key={label} className="m-0 min-w-0">
          <BlogPhoto {...photo} />
          <figcaption className="mt-1.5 text-center text-sm font-medium text-muted-foreground">
            {label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
