"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSharePublish } from "@/lib/use-share-publish";
import {
  parseNumberChoice,
  parseStringChoice,
  readSharedParams,
} from "@/lib/shared-params";
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
  calculateExposureCompensation,
  formatAperture,
  formatExposureValue,
  formatIso,
  formatShutterSpeed,
  type ExposureParam,
} from "@/lib/exposure-calculator";

const PARAMS: ExposureParam[] = ["aperture", "shutterSpeed", "iso"];

function presetsFor(param: ExposureParam): number[] {
  if (param === "aperture") return APERTURE_STOPS;
  if (param === "shutterSpeed") return SHUTTER_SPEED_STOPS_SECONDS;
  return ISO_STOPS;
}

export function ExposureCalculatorCard() {
  const t = useTranslations("ExposureCalculator");

  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [shutterSpeed, setShutterSpeed] = React.useState(
    DEFAULT_SHUTTER_SPEED_SECONDS,
  );
  const [iso, setIso] = React.useState(DEFAULT_ISO);

  const [changedParam, setChangedParam] = React.useState<ExposureParam>("shutterSpeed");
  const [newValue, setNewValue] = React.useState<number>(1 / 500);
  const [compensateParamChoice, setCompensateParamChoice] = React.useState<ExposureParam>("aperture");

  // 공유 링크로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와 첫 화면을 맞추기 위해
  // 마운트 직후 한 번만 읽고, 허용 범위·목록 밖의 값은 무시한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const q = readSharedParams();
    if (!q) return;
    const a = parseNumberChoice(q.get("a"), APERTURE_STOPS);
    const s = parseNumberChoice(q.get("s"), SHUTTER_SPEED_STOPS_SECONDS);
    const i = parseNumberChoice(q.get("i"), ISO_STOPS);
    const cp = parseStringChoice(q.get("cp"), PARAMS);
    const nv = cp !== null ? parseNumberChoice(q.get("nv"), presetsFor(cp)) : null;
    const cc = parseStringChoice(q.get("cc"), PARAMS);
    if (a !== null) setAperture(a);
    if (s !== null) setShutterSpeed(s);
    if (i !== null) setIso(i);
    if (cp !== null && nv !== null) {
      setChangedParam(cp);
      setNewValue(nv);
      if (cc !== null && cc !== cp) setCompensateParamChoice(cc);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const compensateOptions = PARAMS.filter((p) => p !== changedParam);
  // Derived during render rather than synced via an effect: whenever the
  // previously chosen compensate parameter is no longer valid (because it
  // now matches changedParam), fall back to the first remaining option.
  const compensateParam = compensateOptions.includes(compensateParamChoice)
    ? compensateParamChoice
    : compensateOptions[0];

  const baseline = {
    aperture,
    shutterSpeedSeconds: shutterSpeed,
    iso,
  };

  const result = calculateExposureCompensation({
    baseline,
    changedParam,
    newValue,
    compensateParam,
  });

  const paramLabel = (p: ExposureParam) =>
    p === "aperture" ? t("aperture") : p === "shutterSpeed" ? t("shutterSpeed") : t("iso");

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const shareQuery = new URLSearchParams({
    a: String(aperture),
    s: String(shutterSpeed),
    i: String(iso),
    cp: changedParam,
    nv: String(newValue),
    cc: compensateParam,
  }).toString();
  const shareText = result
    ? t("shareText", {
        baseline: `${formatAperture(aperture)} · ${formatShutterSpeed(shutterSpeed)} · ${formatIso(iso)}`,
        changed: paramLabel(changedParam),
        newValue: formatExposureValue(changedParam, newValue),
        compensate: paramLabel(compensateParam),
        compValue: formatExposureValue(compensateParam, result.compensateValue),
      })
    : null;
  useSharePublish("/tools/exposure-stops-calculator", shareQuery, shareText);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>

      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("baselineTitle")}
          </span>

          <ParamSelect
            label={t("aperture")}
            value={aperture}
            onChange={setAperture}
            options={APERTURE_STOPS}
            format={formatAperture}
          />
          <ParamSelect
            label={t("shutterSpeed")}
            value={shutterSpeed}
            onChange={setShutterSpeed}
            options={SHUTTER_SPEED_STOPS_SECONDS}
            format={formatShutterSpeed}
          />
          <ParamSelect
            label={t("iso")}
            value={iso}
            onChange={setIso}
            options={ISO_STOPS}
            format={formatIso}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("changeLabel")}</span>
            <Select
              value={changedParam}
              onValueChange={(value) => {
                const p = value as ExposureParam;
                setChangedParam(p);
                setNewValue(presetsFor(p)[Math.floor(presetsFor(p).length / 2)]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARAMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {paramLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <ParamSelect
            label={t("newValueLabel")}
            value={newValue}
            onChange={setNewValue}
            options={presetsFor(changedParam)}
            format={(v) => formatExposureValue(changedParam, v)}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">{t("compensateLabel")}</span>
            <Select
              value={compensateParam}
              onValueChange={(value) => setCompensateParamChoice(value as ExposureParam)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {compensateOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {paramLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {result ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row
              label={t("heldFixedLabel", { param: paramLabel(result.fixedParam) })}
              value={formatExposureValue(result.fixedParam, result.fixedValue)}
            />
            <Row
              label={t("newValueForLabel", { param: paramLabel(compensateParam) })}
              value={formatExposureValue(compensateParam, result.compensateValue)}
              emphasize
            />
            <Row
              label={t("stopsChangedLabel")}
              value={`${result.stopsChanged.toFixed(2)} ${t("stopsUnit")}`}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
      </div>
    </div>
  );
}

function ParamSelect({
  label,
  value,
  onChange,
  options,
  format,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: number[];
  format: (value: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {format(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}
      >
        {value}
      </span>
    </div>
  );
}
