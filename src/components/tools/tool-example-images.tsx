import Image from "next/image";
import { cn } from "@/lib/utils";
import { getToolImages, type ToolImageMeta } from "@/lib/tool-images";

type Props = {
  slug: string;
  leftAlt: string;
  rightAlt: string;
};

/**
 * Common "example photo" template shared by every calculator tool page:
 * two side-by-side illustrative photos placed between the page's intro
 * text and the calculator card (e.g. a near-focus vs. far-focus example
 * for the DoF calculator). Images are sourced via Unsplash through the
 * developer image tool (`src/components/dev/tool-image-dev-panel.tsx`)
 * and stored per slug/position in `src/data/tool-images.json`.
 *
 * Renders nothing if neither slot has an image yet, so adding this to a
 * new tool page is always safe before its photos are picked. If only one
 * side is set, that single photo is shown full-width instead of leaving
 * an empty column.
 */
export function ToolExampleImages({ slug, leftAlt, rightAlt }: Props) {
  const images = getToolImages(slug);
  const entries: { meta: ToolImageMeta; alt: string }[] = [];
  if (images.left) entries.push({ meta: images.left, alt: leftAlt });
  if (images.right) entries.push({ meta: images.right, alt: rightAlt });

  if (entries.length === 0) return null;

  return (
    <div className={cn("grid gap-4", entries.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
      {entries.map((entry, i) => (
        <ExampleImage key={i} meta={entry.meta} alt={entry.alt} />
      ))}
    </div>
  );
}

function ExampleImage({ meta, alt }: { meta: ToolImageMeta; alt: string }) {
  return (
    <figure className="flex flex-col gap-1.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
        <Image
          src={meta.image}
          alt={alt}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {meta.imageCredit && meta.imageCreditUrl ? (
        <figcaption className="text-xs text-muted-foreground">
          Photo by{" "}
          <a
            href={meta.imageCreditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            {meta.imageCredit}
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com/?utm_source=ExifLens&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Unsplash
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
