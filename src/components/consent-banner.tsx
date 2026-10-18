"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { loadClarity } from "@/lib/clarity";
import { needsConsentBanner } from "@/lib/consent";

const STORAGE_KEY = "consent-choice";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateConsent(granted: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const state = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

type StoredChoice = "accepted" | "rejected" | "pending";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): StoredChoice {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // 시크릿 모드 등으로 접근 불가 - "선택 없음"으로 간주해 배너를 노출
  }
  return "pending";
}

// 서버 렌더링 및 클라이언트 최초 하이드레이션 시에는 로컬스토리지에 접근할
// 수 없으므로 항상 "pending"으로 렌더 - 하이드레이션 후 실제 값으로 자동
// 재동기화된다(useSyncExternalStore의 표준 동작, gear-recommendation.tsx의
// document.cookie 읽기와 동일한 패턴).
function getServerSnapshot(): StoredChoice {
  return "pending";
}

// 방문자 국가: src/proxy.ts가 Vercel의 x-vercel-ip-country 헤더 값을 geo-country
// 쿠키로 심어 준다(페이지 응답과 같은 응답에 실리므로 첫 방문에도 하이드레이션 전에
// 브라우저에 저장된다). 이전에는 서버(레이아웃)가 헤더를 직접 읽었으나, 그러면 모든
// 페이지가 요청마다 렌더링되어 CPU를 쓰므로 브라우저에서 읽는 방식으로 옮겼다.
// 판정 함수(needsConsentBanner)와 "국가 미확인 = 동의 필요" 규칙은 그대로다.
const GEO_NOT_READY = "__server__";

function subscribeGeo() {
  return () => {};
}

function getGeoSnapshot(): string {
  try {
    const m = document.cookie.match(/(?:^|; )geo-country=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
}

// 서버 렌더링·최초 하이드레이션 중에는 국가를 알 수 없으므로 "아직 모름" 표시.
// 이 상태에서는 배너도 Clarity도 건드리지 않는다(국가 확인 전에 추적이 시작되는 것 방지).
function getGeoServerSnapshot(): string {
  return GEO_NOT_READY;
}

function saveChoice(choice: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // 저장 실패해도 이번 방문 동작에는 지장 없음
  }
  for (const listener of listeners) listener();
}

/**
 * Google Consent Mode v2용 쿠키 동의 배너.
 *
 * 방문자의 국가는 proxy가 심어 둔 geo-country 쿠키를 브라우저에서 읽어 판단한다 — EEA/영국/스위스가
 * 아니면 애초에 gtag의 consent 기본값이 "거부"로 설정되지 않으므로(레이아웃의
 * GA4 inline script의 `region` 옵션 참고) 이 배너도 띄우지 않는다.
 *
 * 선택 상태는 useSyncExternalStore로 로컬스토리지를 읽어 관리한다(setState를
 * 이펙트 안에서 직접 호출하지 않기 위함 — eslint `react-hooks/set-state-in-effect`
 * 규칙 및 서버/클라이언트 하이드레이션 불일치 방지 목적, gear-recommendation.tsx의
 * document.cookie 읽기와 동일한 패턴). "동의"를 누르면 gtag consent를 전부
 * granted로 업데이트, "거부"를 누르면 기본값(denied)을 그대로 유지한 채 배너만
 * 닫는다. 선택은 로컬스토리지에 저장해 다음 방문부터는 다시 묻지 않는다.
 */
export function ConsentBanner() {
  const t = useTranslations("Consent");
  const geo = React.useSyncExternalStore(subscribeGeo, getGeoSnapshot, getGeoServerSnapshot);
  const geoReady = geo !== GEO_NOT_READY;
  const needsConsent = needsConsentBanner(geo || null);
  const choice = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  React.useEffect(() => {
    if (choice === "accepted") {
      updateConsent(true);
    }
    // "rejected"는 기본값(denied)과 동일한 상태이므로 별도 업데이트 불필요.
  }, [choice]);

  // Microsoft Clarity: 동의가 필요한 지역(EEA·영국·스위스, 국가 미확인 포함)은
  // "동의" 후에만, 그 외 지역은 즉시 로드하되 "거부" 선택은 어디서든 존중한다.
  React.useEffect(() => {
    if (!geoReady) return;
    const allowed = needsConsent ? choice === "accepted" : choice !== "rejected";
    if (allowed) loadClarity(choice === "accepted");
  }, [geoReady, needsConsent, choice]);

  if (!geoReady || !needsConsent || choice !== "pending") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("message")}</p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => saveChoice("rejected")}>
            {t("reject")}
          </Button>
          <Button type="button" size="sm" onClick={() => saveChoice("accepted")}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
