import { NextRequest } from "next/server";

// 개발자 전용 - 로컬(NODE_ENV=development)에서만 동작. 브라우저 탭이 열려있는
// 동안 이 SSE(Server-Sent Events) 연결을 계속 유지하다가, 탭이 실제로
// 닫혀서(새로고침이 아니라) 마지막 연결까지 끊기면 개발 서버 프로세스 전체를
// 종료(exit code 42)한다 - scripts/dev-open.mjs가 이 종료 코드를 보고
// 터미널 창까지 자동으로 닫는다.
//
// 새로고침 시에도 연결이 잠깐 끊기지만, 새 페이지가 곧바로 새 연결을 열기
// 때문에 아래 CLOSE_DEBOUNCE_MS 안에 activeConnections가 다시 올라가면
// 종료가 취소된다.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CLOSE_DEBOUNCE_MS = 700;

let activeConnections = 0;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not available", { status: 403 });
  }

  activeConnections += 1;
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"));

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(ping);
        }
      }, 15000);

      const onAbort = () => {
        clearInterval(ping);
        activeConnections = Math.max(0, activeConnections - 1);

        if (activeConnections === 0) {
          closeTimer = setTimeout(() => {
            console.log(
              "\n[dev-watch] 마지막 브라우저 탭이 닫혀 개발 서버를 종료합니다.\n",
            );
            process.exit(42);
          }, CLOSE_DEBOUNCE_MS);
        }

        try {
          controller.close();
        } catch {
          // 이미 닫힌 컨트롤러에 close를 다시 호출하면 던지는 예외 - 무시해도 안전함
        }
      };

      req.signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
