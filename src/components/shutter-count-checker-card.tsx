"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkShutterCount,
  ShutterCountParseError,
  SHUTTER_COUNT_FILE_ACCEPT,
  type ShutterCountResult,
} from "@/lib/shutter-count-checker";

type Status = "idle" | "analyzing" | "done" | "error";

export function ShutterCountCheckerCard() {
  const t = useTranslations("ShutterCountChecker");

  const [status, setStatus] = React.useState<Status>("idle");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ShutterCountResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setStatus("analyzing");
    setResult(null);
    setErrorMessage(null);
    try {
      const r = await checkShutterCount(file);
      setResult(r);
      setStatus("done");
    } catch (err) {
      setErrorMessage(
        err instanceof ShutterCountParseError ? err.message : t("genericError"),
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setFileName(null);
    setResult(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">{t("privacyNote")}</p>

      <div className="flex flex-col gap-3 text-sm">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-8 text-center transition-colors hover:border-primary/50"
        >
          <input
            ref={inputRef}
            type="file"
            accept={SHUTTER_COUNT_FILE_ACCEPT}
            aria-label={t("uploadLabel")}
            className="sr-only"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
            }}
          />
          {status === "analyzing" ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </>
          ) : (
            <>
              <UploadCloud className="size-8 text-muted-foreground" />
              <p className="text-base font-medium">{t("uploadLabel")}</p>
              <p className="max-w-md text-xs text-muted-foreground">{t("uploadHint")}</p>
            </>
          )}
        </div>

        {status === "error" && errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {status === "done" && result ? (
          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-primary/10 px-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("fileLabel")}</span>
              <span className="max-w-[60%] truncate font-medium">{fileName}</span>
            </div>
            {result.cameraModel ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("cameraLabel")}</span>
                <span className="font-medium">{result.cameraModel}</span>
              </div>
            ) : null}
            {result.supported ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("shutterCountLabel")}</span>
                <span className="text-lg font-semibold text-primary">
                  {result.shutterCount.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{result.reason}</p>
            )}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="size-4" />
                {t("resetButton")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border border-border px-3 py-3 text-xs text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">{t("supportTableTitle")}</p>
        <ul className="flex flex-col gap-1">
          <li>{t("supportNikon")}</li>
          <li>{t("supportOthers")}</li>
        </ul>
      </div>
    </div>
  );
}
