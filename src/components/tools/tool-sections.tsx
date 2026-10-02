import { Link } from "@/i18n/navigation";

export type ToolSection = {
  heading: string;
  body?: string[];
  list?: string[];
};

export type ToolRelated = {
  heading: string;
  items: { slug: string; title: string }[];
};

/**
 * 도구 페이지의 "설명" 영역에서 aboutBody 아래에 이어지는 심화 섹션들.
 * 각 도구의 messages 네임스페이스에 `sections`(와 선택적으로 `related`)를
 * 두고, 페이지에서 <article> 안에 이 컴포넌트를 넣어 렌더링한다.
 * 서버 컴포넌트이므로 JS 실행 없이도 초기 HTML에 텍스트가 포함된다.
 */
export function ToolSections({
  sections,
  related,
}: {
  sections?: ToolSection[];
  related?: ToolRelated;
}) {
  return (
    <>
      {(sections ?? []).map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {section.heading}
          </h3>
          {(section.body ?? []).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {section.list && section.list.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {section.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      {related && related.items.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {related.heading}
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {related.items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}`}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
