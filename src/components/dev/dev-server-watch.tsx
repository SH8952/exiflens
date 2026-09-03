"use client";

/**
 * 개발자 전용 - 로컬 개발 서버(localhost)에서만 렌더링됨(NODE_ENV 체크는
 * 이 컴포넌트를 사용하는 레이아웃 쪽에서 처리, 이 컴포넌트 자체는 항상
 * 렌더링을 시도하므로 프로덕션에 직접 렌더링하지 않음).
 *
 * 마운트되는 즉시 /api/dev/watch로 SSE(Server-Sent Events) 연결을 열어
 * 유지한다. 브라우저 탭이 실제로 닫히면 이 연결이 끊기고, 서버(route.ts)가
 * 그걸 감지해 개발 서버 프로세스를 종료한다 - 새로고침은 연결이 잠깐
 * 끊겼다가 곧바로 새로 열리므로 정상적으로 무시됨.
 *
 * 사이트 운영 기간 내내 계속 쓰는 상시 개발자 도구이므로 임의로 삭제하지 않는다.
 */
import { useEffect } from "react";

export function DevServerWatch() {
  useEffect(() => {
    const source = new EventSource("/api/dev/watch");
    return () => {
      source.close();
    };
  }, []);

  return null;
}
