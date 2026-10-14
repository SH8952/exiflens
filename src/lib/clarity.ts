/**
 * Microsoft Clarity(무료 세션 녹화·히트맵) 로더.
 *
 * - 로드 여부/시점은 consent-banner.tsx가 결정한다(EEA·영국·스위스는 "동의" 후에만,
 *   그 외 지역은 즉시, 어느 지역이든 "거부"를 선택했다면 로드하지 않음).
 * - 운영자 본인 방문(dev_exclude=1 쿠키)과 로컬 개발 호스트는 GA4와 동일하게 제외한다.
 * - 사진에서 추출된 데이터가 표시되는 도구 영역에는 data-clarity-mask="True"를
 *   붙여 녹화 화면에서도 가려지도록 한다.
 */
export const CLARITY_PROJECT_ID = "yxt95ftmoi";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

function isExcluded(): boolean {
  if (LOCAL_HOSTS.includes(window.location.hostname)) return true;
  return /(?:^|; )dev_exclude=1(?:;|$)/.test(document.cookie);
}

export function loadClarity(granted: boolean): void {
  if (typeof window === "undefined" || isExcluded()) return;

  if (typeof window.clarity !== "function") {
    const stub: ClarityFn = function (...args: unknown[]) {
      (stub.q = stub.q || []).push(args);
    };
    window.clarity = stub;
  }

  if (!document.getElementById("clarity-script")) {
    const script = document.createElement("script");
    script.id = "clarity-script";
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    document.head.appendChild(script);
  }

  if (granted) {
    window.clarity("consentv2", { ad_Storage: "granted", analytics_Storage: "granted" });
  }
}
