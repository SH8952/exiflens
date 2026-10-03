import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { ALL_TOOLS } from "@/lib/tools-roster";

type Messages = Record<string, unknown>;

/**
 * 숨김(hidden) 도구의 문구는 운영 환경에서 메시지에서 뺀다.
 * next-intl은 모든 메시지를 각 페이지의 HTML(클라이언트 데이터)에 함께 실어 보내므로,
 * 아직 공개하지 않은 도구의 이름·설명·FAQ가 다른 페이지 소스에 그대로 노출되는 것을 막는다.
 * 개발 환경(`npm run dev`)에서는 확인을 위해 그대로 둔다.
 */
function withoutHiddenTools(messages: Messages): Messages {
  if (process.env.NODE_ENV === "development") return messages;
  const hidden = ALL_TOOLS.filter((tool) => tool.status === "hidden");
  if (hidden.length === 0) return messages;

  const next: Messages = { ...messages };
  const hub = next.ToolsHub as Messages | undefined;
  const hubTools = hub?.tools as Messages | undefined;
  if (hub && hubTools) {
    const tools = { ...hubTools };
    for (const tool of hidden) delete tools[tool.slug];
    next.ToolsHub = { ...hub, tools };
  }
  for (const tool of hidden) {
    if (tool.faqNamespace) delete next[tool.faqNamespace];
  }
  return next;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default as Messages;

  return {
    locale,
    messages: withoutHiddenTools(messages),
  };
});
