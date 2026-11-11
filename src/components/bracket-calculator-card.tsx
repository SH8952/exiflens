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
  DEFAULT_APERTURE,
  DEFAULT_ISO,
  DEFAULT_SHUTTER_SPEED_SECONDS,
  ISO_STOPS,
  SHUTTER_SPEED_STOPS_SECONDS,
  formatAperture,
  formatIso,
  formatShutterSpeed,
  type ExposureParam,
} from "@/lib/exposure-calculator";
import {
  BRACKET_FRAME_COUNT_OPTIONS,
  BRACKET_STEP_STOPS_OPTIONS,
  DEFAULT_BRACKET_FRAME_COUNT,
  DEFAULT_BRACKET_PARAM,
  DEFAULT_BRACKET_STEP_STOPS,
  DEFAULT_OVERHEAD_SECONDS_PER_SHOT,
  calculateBracketPlan,
  formatShootingTimeSeconds,
  formatStepStops,
  formatStopsOffset,
} from "@/lib/bracket-calculator";

const BRACKET_PARAMS: ExposureParam[] = ["shutterSpeed", "aperture", "iso"];

export function BracketCalculatorCard() {
  const t = useTranslations("BracketCalculator");

  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [shutterSpeedSeconds, setShutterSpeedSeconds] = React.useState(
    DEFAULT_SHUTTER_SPEED_SECONDS,
  );
  const [iso, setIso] = React.useState(DEFAULT_ISO);
  const [bracketParam, setBracketParam] = React.useState<ExposureParam>(DEFAULT_BRACKET_PARAM);
  const [stepStops, setStepStops] = React.useState(DEFAULT_BRACKET_STEP_STOPS);
  const [frameCount, setFrameCount] = React.useState(DEFAULT_BRACKET_FRAME_COUNT);
  const [overheadSecondsPerShot, setOverheadSecondsPerShot] = React.useState(
    DEFAULT_OVERHEAD_SECONDS_PER_SHOT,
  );

  // 공유 링크로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와 첫 화면을 맞추기 위해
  // 마운트 직후 한 번만 읽고, 허용 범위·목록 밖의 값은 무시한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const q = readSharedParams();
    if (!q) return;
    const a = parseNumberChoice(q.get("a"), APERTURE_STOPS);
    const s = parseNumberChoice(q.get("s"), SHUTTER_SPEED_STOPS_SECONDS);
    const i = parseNumberChoice(q.get("i"), ISO_STOPS);
    const bp = parseStringChoice(q.get("bp"), BRACKET_PARAMS);
    const st = parseNumberChoice(q.get("st"), BRACKET_STEP_STOPS_OPTIONS);
    const fc = parseNumberChoice(q.get("fc"), BRACKET_FRAME_COUNT_OPTIONS);
    const o = parseBoundedNumber(q.get("o"), 0, 600);
    if (a !== null) setAperture(a);
    if (s !== null) setShutterSpeedSeconds(s);
    if (i !== null) setIso(i);
    if (bp !== null) setBracketParam(bp);
    if (st !== null) setStepStops(st);
    if (fc !== null) setFrameCount(fc);
    if (o !== null) setOverheadSecondsPerShot(o);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const plan = calculateBracketPlan({
    baselineAperture: aperture,
    baselineShutterSpeedSeconds: shutterSpeedSeconds,
    baselineIso: iso,
    bracketParam,
    stepStops,
    frameCount,
    overheadSecondsPerShot,
  });

  const paramLabel = (param: ExposureParam) =>
    param === "aperture" ? t("aperture") : param === "shutterSpeed" ? t("shutterSpeed") : t("iso");

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const shareQuery = new URLSearchParams({
    a: String(aperture),
    s: String(shutterSpeedSeconds),
    i: String(iso),
    bp: bracketParam,
    st: String(stepStops),
    fc: String(frameCount),
    o: String(overheadSecondsPerShot),
  }).toString();
  const shareText = plan
    ? t("shareText", {
        baseline: `${formatAperture(aperture)} · ${formatShutterSpeed(shutterSpeedSeconds)} · ${formatIso(iso)}`,
        param: paramLabel(bracketParam),
        step: formatStepStops(stepStops),
        count: frameCount,
        time: formatShootingTimeSeconds(plan.totalShootingTimeSeconds),
      })
    : null;
  useSharePublish("/tools/bracketing-calculator", shareQuery, shareText);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("baselineTitle")}
        </h3>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("aperture")}</span>
          <Select value={String(aperture)} onValueChange={(value) => setAperture(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APERTURE_STOPS.map((f) => (
                <SelectItem key={f} value={String(f)}>
                  {formatAperture(f)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("shutterSpeed")}</span>
          <Select
            value={String(shutterSpeedSeconds)}
            onValueChange={(value) => setShutterSpeedSeconds(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHUTTER_SPEED_STOPS_SECONDS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {formatShutterSpeed(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("iso")}</span>
          <Select value={String(iso)} onValueChange={(value) => setIso(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ISO_STOPS.map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {formatIso(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("bracketParamLabel")}</span>
          <Select
            value={bracketParam}
            onValueChange={(value) => setBracketParam(value as ExposureParam)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRACKET_PARAMS.map((param) => (
                <SelectItem key={param} value={param}>
                  {paramLabel(param)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("stepLabel")}</span>
          <Select value={String(stepStops)} onValueChange={(value) => setStepStops(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRACKET_STEP_STOPS_OPTIONS.map((step) => (
                <SelectItem key={step} value={String(step)}>
                  {t("stepOption", { step: formatStepStops(step) })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("frameCountLabel")}</span>
          <Select
            value={String(frameCount)}
            onValueChange={(value) => setFrameCount(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRACKET_FRAME_COUNT_OPTIONS.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {t("frameCountOption", { count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {plan ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("resultsTitle")}
            </h3>
            {plan.frames.map((frame) => (
              <div
                key={frame.offsetStops}
                className="flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <span className="shrink-0 font-medium">
                  {formatStopsOffset(frame.offsetStops)}
                  {frame.offsetStops === 0 ? ` (${t("baselineFrameTag")})` : ""}
                </span>
                <span className="text-right text-muted-foreground">
                  <span className={bracketParam === "aperture" ? "font-semibold text-primary" : ""}>
                    {formatAperture(frame.aperture)}
                  </span>
                  {" · "}
                  <span className={bracketParam === "shutterSpeed" ? "font-semibold text-primary" : ""}>
                    {formatShutterSpeed(frame.shutterSpeedSeconds)}
                  </span>
                  {" · "}
                  <span className={bracketParam === "iso" ? "font-semibold text-primary" : ""}>
                    {formatIso(frame.iso)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}

        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border px-3 py-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("advancedTitle")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("advancedSubtitle")}</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("overheadLabel")}</span>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={overheadSecondsPerShot}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setOverheadSecondsPerShot(next);
              }}
            />
          </label>

          {plan ? (
            <div className="flex flex-col gap-2">
              <Row
                label={t("totalShootingTimeLabel")}
                value={formatShootingTimeSeconds(plan.totalShootingTimeSeconds)}
                emphasize
              />
              <Row
                label={t("totalSpreadLabel")}
                value={t("totalSpreadValue", { stops: formatStepStops(plan.totalSpreadStops) })}
              />
              <div>
                <span className="text-xs font-semibold text-foreground">
                  {t("dynamicRangeTitle")}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.dynamicRangeCategory === "standard"
                    ? t("dynamicRangeStandard")
                    : plan.dynamicRangeCategory === "highContrast"
                      ? t("dynamicRangeHighContrast")
                      : t("dynamicRangeExtreme")}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
