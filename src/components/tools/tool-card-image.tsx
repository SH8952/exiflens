import Image from "next/image";
import { getToolCardImage } from "@/lib/tool-images";

/**
 * 도구 목록(/tools)·홈 "사진 도구" 카드 상단 썸네일. 도구 페이지 예시 이미지를
 * 재사용하며(새 이미지 없음), 이미지가 없는 도구는 아무것도 그리지 않아 기존
 * 텍스트 카드 그대로 보인다. alt에는 호출하는 쪽이 도구 이름을 넘긴다(검색엔진·스크린리더용).
 * 부모 카드에 `group`·`overflow-hidden`이 있어야 호버 확대·모서리 처리가 맞는다.
 */
export function ToolCardImage({
  slug,
  alt,
  sizes,
  priority = false,
}: {
  slug: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const src = getToolCardImage(slug);
  if (!src) return null;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted max-sm:aspect-[2/1]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
