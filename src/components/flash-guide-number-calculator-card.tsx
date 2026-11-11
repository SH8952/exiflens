"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSharePublish } from "@/lib/use-share-publish";
import {
  parseBoundedNumber,
  parseNumberChoice,
  parseStringChoice,
  readSharedParams,
} from "@/lib/shared-params";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APERTURE_STOPS,
  ISO_STOPS,
  formatAperture,
  formatIso,
} from "@/lib/exposure-calculator";
import {
  REFERENCE_ISO,
  calculateApertureFromGuideNumber,
  calculateDistanceFromGuideNumber,
  calculateGuideNumberAtIso,
  formatDistance,
  formatGuideNumber,
  type DistanceUnit,
} from "@/lib/flash-guide-number-calculator";

type SolveFor = "aperture" | "distance";

export function FlashGuideNumberCalculatorCard() {
  const t = useTranslations("FlashGuideNumberCalculator");

  const [guideNumber, setGuideNumber] = React.useState(30);
  const [unit, setUnit] = React.useState<DistanceUnit>("m");
  const [iso, setIso] = React.useState(100);
  const [solveFor, setSolveFor] = React.useState<SolveFor>("distance");
  const [aperture, setAperture] = React.useState(8);
  const [distance, setDistance] = React.useState(5);

  // 공유 링크로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와 첫 화면을 맞추기 위해
  // 마운트 직후 한 번만 읽고, 허용 범위·목록 밖의 값은 무시한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const q = readSharedParams();
    if (!q) return;
    const g = parseBoundedNumber(q.get("g"), 1, 1000);
    const u = parseStringChoice(q.get("u"), ["m", "ft"] as const);
    const i = parseNumberChoice(q.get("i"), ISO_STOPS);
    const sv = parseStringChoice(q.get("sv"), ["aperture", "distance"] as const);
    const a = parseNumberChoice(q.get("a"), APERTURE_STOPS);
    const d = parseBoundedNumber(q.get("d"), 0.1, 10000);
    if (g !== null) setGuideNumber(g);
    if (u !== null) setUnit(u);
    if (i !== null) setIso(i);
    if (sv !== null) setSolveFor(sv);
    if (a !== null) setAperture(a);
    if (d !== null) setDistance(d);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const adjustedGuideNumber = calculateGuideNumberAtIso(guideNumber, REFERENCE_ISO, iso);

  const resultDistance =
    solveFor === "distance" && adjustedGuideNumber !== null
      ? calculateDistanceFromGuideNumber(adjustedGuideNumber, aperture)
      : null;

  const resultAperture =
    solveFor === "aperture" && adjustedGuideNumber !== null
      ? calculateApertureFromGuideNumber(adjustedGuideNumber, distance)
      : null;

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const shareQuery = new URLSearchParams({
    g: String(guideNumber),
    u: unit,
    i: String(iso),
    sv: solveFor,
    a: String(aperture),
    d: String(distance),
  }).toString();
  const shareText =
    adjustedGuideNumber !== null && (resultDistance !== null || resultAperture !== null)
      ? t("shareText", {
          guide: formatGuideNumber(guideNumber, unit),
          iso: formatIso(iso),
          input:
            solveFor === "distance"
              ? formatAperture(aperture)
              : formatDistance(distance, unit),
          label:
            resultDistance !== null ? t("maxDistanceLabel") : t("requiredApertureLabel"),
          result:
            resultDistance !== null
              ? formatDistance(resultDistance, unit)
              : resultAperture !== null
                ? formatAperture(resultAperture)
                : "",
        })
      : null;
  useSharePublish("/tools/flash-guide-number-calculator", shareQuery, shareText);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("guideNumberLabel")}</span>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={guideNumber}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setGuideNumber(next);
              }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("unitLabel")}</span>
            <Select value={unit} onValueChange={(value) => setUnit(value as DistanceUnit)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m">{t("unitMeters")}</SelectItem>
                <SelectItem value="ft">{t("unitFeet")}</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{t("guideNumberHint")}</p>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("isoLabel")}</span>
          <Select value={String(iso)} onValueChange={(value) => setIso(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ISO_STOPS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {formatIso(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("solveForLabel")}</span>
          <Select value={solveFor} onValueChange={(value) => setSolveFor(value as SolveFor)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">{t("solveForDistance")}</SelectItem>
              <SelectItem value="aperture">{t("solveForAperture")}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {solveFor === "distance" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("apertureLabel")}</span>
            <Select value={String(aperture)} onValueChange={(value) => setAperture(Number(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APERTURE_STOPS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {formatAperture(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("distanceLabel")}</span>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={distance}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setDistance(next);
              }}
            />
          </label>
        )}

        {adjustedGuideNumber !== null &&
        (resultDistance !== null || resultAperture !== null) ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("adjustedGuideNumberLabel", { iso: formatIso(iso) })}
              </span>
              <span className="font-medium">
                {formatGuideNumber(adjustedGuideNumber, unit)}
              </span>
            </div>
            {resultDistance !== null ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("maxDistanceLabel")}</span>
                <span className="text-lg font-semibold text-primary">
                  {formatDistance(resultDistance, unit)}
                </span>
              </div>
            ) : null}
            {resultAperture !== null ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("requiredApertureLabel")}</span>
                <span className="text-lg font-semibold text-primary">
                  {formatAperture(resultAperture)}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
      </div>
    </div>
  );
}
