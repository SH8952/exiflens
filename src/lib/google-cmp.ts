/**
 * Google 인증 CMP(애드센스 "개인정보 보호 및 메시지"의 유럽 규정 메시지) 감지.
 *
 * 구글 CMP가 게시되면 페이지에 IAB TCF 표준 신호(`window.__tcfapi` 함수 또는
 * `__tcfapiLocator` iframe)가 생긴다. 이 신호가 보이면 사이트가 직접 만든 동의 배너는
 * 띄우지 않아 두 메시지가 겹치지 않게 한다. 신호가 끝내 오지 않으면(구글 메시지 미게시,
 * 광고 차단 등) "absent"로 확정해 기존 직접 만든 배너가 그대로 동작한다.
 *
 * 구글 스크립트(adsbygoogle.js)는 afterInteractive로 늦게 로드되므로, 판정까지
 * CMP_WAIT_MS 동안 "pending"으로 두고 짧은 간격으로 확인한다.
 * "absent"로 확정한 뒤에도 느린 간격(LATE_POLL_MS)으로 계속 확인해, 구글 CMP가 뒤늦게
 * 나타나면 즉시 "present"로 바꿔 직접 만든 배너를 닫는다(느린 네트워크에서의 중복 방지).
 * "present"가 되면 확인을 멈춘다.
 * 상태는 모듈 전역 하나이며 useSyncExternalStore로 읽는다(서버·최초 렌더는 "pending").
 */
export type CmpState = "pending" | "present" | "absent";

export const CMP_WAIT_MS = 1500;
const POLL_MS = 150;
const LATE_POLL_MS = 500;

let state: CmpState = "pending";
let startedAt = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let pinged = false;
const listeners = new Set<() => void>();

type TcfApi = (
  command: string,
  version: number,
  callback: (data: { cmpStatus?: string } | null, success: boolean) => void,
) => void;

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer(interval: number) {
  stopTimer();
  timer = setInterval(check, interval);
}

function setState(next: CmpState) {
  if (state === next) return;
  state = next;
  if (next === "present") {
    stopTimer();
  } else if (next === "absent" && listeners.size > 0) {
    // 확정 후에도 느린 간격으로 계속 확인한다.
    startTimer(LATE_POLL_MS);
  }
  for (const l of listeners) l();
}

function check() {
  if (state === "present") return;
  try {
    // 구글 CMP가 만드는 TCF API 위치 확인용 iframe
    if (document.querySelector('iframe[name="__tcfapiLocator"]')) {
      setState("present");
      return;
    }
    const api = (window as unknown as { __tcfapi?: TcfApi }).__tcfapi;
    if (typeof api === "function" && !pinged) {
      pinged = true;
      api("ping", 2, (data, success) => {
        // 오류 상태가 아니면 CMP가 살아 있는 것으로 본다.
        if (success && data && data.cmpStatus !== "error") setState("present");
        else pinged = false; // 다음 확인 때 다시 시도
      });
    }
  } catch {
    // 감지 실패는 "신호 없음"과 같게 취급
  }
  if (state === "pending" && Date.now() - startedAt >= CMP_WAIT_MS) setState("absent");
}

export function subscribeCmp(callback: () => void) {
  listeners.add(callback);
  if (state !== "present" && !timer) {
    if (state === "pending") {
      startedAt = Date.now();
      pinged = false;
      startTimer(POLL_MS);
      check();
    } else {
      startTimer(LATE_POLL_MS);
    }
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) stopTimer();
  };
}

export function getCmpSnapshot(): CmpState {
  return state;
}

export function getCmpServerSnapshot(): CmpState {
  return "pending";
}
