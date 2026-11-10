"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { publishShareState } from "@/lib/share-state";
import {
  parseBoundedNumber,
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
  APERTURE_PRESETS,
  DEFAULT_APERTURE,
  DEFAULT_FOCAL_LENGTH_MM,
  DEFAULT_SUBJECT_DISTANCE_M,
  MAX_CUSTOM_COC_MM,
  MIN_CUSTOM_COC_MM,
  SENSOR_PRESETS,
  calculateDof,
  formatDistanceMeters,
  type SensorPresetId,
} from "@/lib/dof-calculator";

export function DofCalculatorCard() {
  const t = useTranslations("DofCalculator");

  const [focalLength, setFocalLength] = React.useState(
    DEFAULT_FOCAL_LENGTH_MM,
  );
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [sensorId, setSensorId] = React.useState<SensorPresetId>("full-frame");
  const [customCoc, setCustomCoc] = React.useState(0.03);
  const [subjectDistance, setSubjectDistance] = React.useState(
    DEFAULT_SUBJECT_DISTANCE_M,
  );

  // 공유 링크(?f=&a=&s=&c=&d=)로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와
  // 첫 화면을 맞추기 위해 마운트 직후에 한 번만 읽는다. 허용 범위 밖의 값은 무시한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const q = readSharedParams();
    if (!q) return;
    const f = parseBoundedNumber(q.get("f"), 1, 2000);
    const a = parseNumberChoice(q.get("a"), APERTURE_PRESETS);
    const s = parseStringChoice(
      q.get("s"),
      SENSOR_PRESETS.map((p) => p.id),
    );
    const c = parseBoundedNumber(q.get("c"), MIN_CUSTOM_COC_MM, MAX_CUSTOM_COC_MM);
    const d = parseBoundedNumber(q.get("d"), 0.1, 100000);
    if (f !== null) setFocalLength(f);
    if (a !== null) setAperture(a);
    if (s !== null) setSensorId(s);
    if (c !== null) setCustomCoc(c);
    if (d !== null) setSubjectDistance(d);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const sensor =
    SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const coc = sensor.circleOfConfusionMm ?? customCoc;

  const result = calculateDof(focalLength, aperture, coc, subjectDistance);

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const shareQuery = new URLSearchParams({
    f: String(focalLength),
    a: String(aperture),
    s: sensorId,
    ...(sensorId === "custom" ? { c: String(customCoc) } : {}),
    d: String(subjectDistance),
  }).toString();
  const shareText = result
    ? t("shareText", {
        focal: focalLength,
        aperture,
        sensor: sensorId === "custom" ? t("customSensor") : sensor.label,
        distance: subjectDistance,
        dof:
          result.totalDofMeters === null
            ? t("infinity")
            : formatDistanceMeters(result.totalDofMeters),
      })
    : null;
  React.useEffect(() => {
    publishShareState(
      "/tools/dof-calculator",
      shareText === null ? null : { query: shareQuery, text: shareText },
    );
  }, [shareQuery, shareText]);
  React.useEffect(
    () => () => publishShareState("/tools/dof-calculator", null),
    [],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("focalLength")}</span>
          <Input
            type="number"
            min={1}
            max={2000}
            value={focalLength}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setFocalLength(next);
            }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("aperture")}</span>
          <Select
            value={String(aperture)}
            onValueChange={(value) => setAperture(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APERTURE_PRESETS.map((f) => (
                <SelectItem key={f} value={String(f)}>
                  f/{f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("sensor")}</span>
          <Select
            value={sensorId}
            onValueChange={(value) => setSensorId(value as SensorPresetId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENSOR_PRESETS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id === "custom" ? t("customSensor") : s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {sensorId === "custom" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">
              {t("customCocLabel")}
            </span>
            <Input
              type="number"
              step={0.001}
              min={MIN_CUSTOM_COC_MM}
              max={MAX_CUSTOM_COC_MM}
              value={customCoc}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) {
                  setCustomCoc(
                    Math.min(MAX_CUSTOM_COC_MM, Math.max(MIN_CUSTOM_COC_MM, next)),
                  );
                }
              }}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">
            {t("subjectDistance")}
          </span>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={subjectDistance}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setSubjectDistance(next);
            }}
          />
        </label>

        {result ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <Row
              label={t("hyperfocal")}
              value={formatDistanceMeters(result.hyperfocalMeters)}
            />
            <Row
              label={t("nearLimit")}
              value={formatDistanceMeters(result.nearLimitMeters)}
            />
            <Row
              label={t("farLimit")}
              value={
                result.farLimitMeters === null
                  ? t("infinity")
                  : formatDistanceMeters(result.farLimitMeters)
              }
            />
            <Row
              label={t("totalDof")}
              value={
                result.totalDofMeters === null
                  ? t("infinity")
                  : formatDistanceMeters(result.totalDofMeters)
              }
              emphasize
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("invalidInput")}</p>
        )}
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
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={emphasize ? "text-lg font-semibold text-primary" : "font-medium"}
      >
        {value}
      </span>
    </div>
  );
}
