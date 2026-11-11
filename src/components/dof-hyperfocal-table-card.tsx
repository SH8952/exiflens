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
  APERTURE_PRESETS,
  DEFAULT_APERTURE,
  DEFAULT_FOCAL_LENGTH_MM,
  MAX_CUSTOM_COC_MM,
  MIN_CUSTOM_COC_MM,
  SENSOR_PRESETS,
  calculateDof,
  formatDistanceMeters,
  type SensorPresetId,
} from "@/lib/dof-calculator";

/**
 * Fixed subject-distance rows for the DoF table, matching the "table"
 * search intent (a page listing every value at once) rather than the
 * single-value /tools/dof-calculator. Reuses calculateDof() as-is — no
 * new depth-of-field math, just iterating it over a preset list of
 * distances and apertures instead of one manual input each.
 */
const TABLE_SUBJECT_DISTANCES_M = [0.5, 1, 2, 3, 5, 10, 20, 50, 100];

export function DofHyperfocalTableCard() {
  const t = useTranslations("DofHyperfocalTable");

  const [focalLength, setFocalLength] = React.useState(
    DEFAULT_FOCAL_LENGTH_MM,
  );
  const [aperture, setAperture] = React.useState(DEFAULT_APERTURE);
  const [sensorId, setSensorId] = React.useState<SensorPresetId>("full-frame");
  const [customCoc, setCustomCoc] = React.useState(0.03);

  // 공유 링크로 들어온 경우 입력값을 채운다. 서버 렌더링 결과(기본값)와 첫 화면을 맞추기 위해
  // 마운트 직후 한 번만 읽고, 허용 범위·목록 밖의 값은 무시한다.
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
    if (f !== null) setFocalLength(f);
    if (a !== null) setAperture(a);
    if (s !== null) setSensorId(s);
    if (c !== null) setCustomCoc(c);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const sensor =
    SENSOR_PRESETS.find((s) => s.id === sensorId) ?? SENSOR_PRESETS[0];
  const coc = sensor.circleOfConfusionMm ?? customCoc;

  // Hyperfocal distance depends only on focal length, aperture, and CoC —
  // not on subject distance — so any positive placeholder distance works
  // here purely to satisfy calculateDof()'s signature.
  const hyperfocalRows = APERTURE_PRESETS.map((f) => ({
    aperture: f,
    result: calculateDof(focalLength, f, coc, 1),
  }));

  // 페이지 하단 공유 버튼이 쓸 현재 입력값(링크)과 결과 요약(문구)을 올린다.
  const hyperfocalResult = calculateDof(focalLength, aperture, coc, 1);
  const shareQuery = new URLSearchParams({
    f: String(focalLength),
    a: String(aperture),
    s: sensorId,
    ...(sensorId === "custom" ? { c: String(customCoc) } : {}),
  }).toString();
  const shareText = hyperfocalResult
    ? t("shareText", {
        focal: focalLength,
        aperture,
        sensor: sensorId === "custom" ? t("customSensor") : sensor.label,
        hyperfocal: formatDistanceMeters(hyperfocalResult.hyperfocalMeters),
      })
    : null;
  useSharePublish("/tools/dof-hyperfocal-table", shareQuery, shareText);

  const dofRows = TABLE_SUBJECT_DISTANCES_M.map((distance) => ({
    distance,
    result: calculateDof(focalLength, aperture, coc, distance),
  }));

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
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("hyperfocalTableTitle")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("hyperfocalTableSubtitle")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-3">{t("aperture")}</th>
                <th className="py-1.5">{t("hyperfocal")}</th>
              </tr>
            </thead>
            <tbody>
              {hyperfocalRows.map((row) => (
                <tr
                  key={row.aperture}
                  className={
                    row.aperture === aperture
                      ? "bg-primary/10 font-medium"
                      : "border-b border-border/60"
                  }
                >
                  <td className="py-1.5 pr-3">f/{row.aperture}</td>
                  <td className="py-1.5">
                    {row.result
                      ? formatDistanceMeters(row.result.hyperfocalMeters)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("dofTableTitle")}</h3>
        <p className="text-xs text-muted-foreground">{t("dofTableSubtitle")}</p>

        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-3">{t("subjectDistance")}</th>
                <th className="py-1.5 pr-3">{t("nearLimit")}</th>
                <th className="py-1.5 pr-3">{t("farLimit")}</th>
                <th className="py-1.5">{t("totalDof")}</th>
              </tr>
            </thead>
            <tbody>
              {dofRows.map((row) => (
                <tr key={row.distance} className="border-b border-border/60">
                  <td className="py-1.5 pr-3">
                    {formatDistanceMeters(row.distance)}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.result
                      ? formatDistanceMeters(row.result.nearLimitMeters)
                      : "—"}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.result
                      ? row.result.farLimitMeters === null
                        ? t("infinity")
                        : formatDistanceMeters(row.result.farLimitMeters)
                      : "—"}
                  </td>
                  <td className="py-1.5">
                    {row.result
                      ? row.result.totalDofMeters === null
                        ? t("infinity")
                        : formatDistanceMeters(row.result.totalDofMeters)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
