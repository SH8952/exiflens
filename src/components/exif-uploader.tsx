"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_INPUT_ACCEPT } from "@/lib/exif";
import { useExifStore } from "@/store/exif-store";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { usePhotoPreviewUrl } from "@/hooks/use-photo-preview-url";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ExifUploader() {
  const t = useTranslations("Home");
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const status = useExifStore((s) => s.status);
  const fileName = useExifStore((s) => s.fileName);
  const imageUrl = useExifStore((s) => s.imageUrl);
  const file = useExifStore((s) => s.file);
  const errorMessage = useExifStore((s) => s.errorMessage);
  const reset = useExifStore((s) => s.reset);
  const { handleFile } = usePhotoUpload();
  const previewUrl = usePhotoPreviewUrl(file, imageUrl, fileName);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <section aria-label="EXIF uploader" className="flex flex-col gap-2">
      {/* Only shown once a photo is uploaded — nudges people toward the EXIF
          Frame Generator with the photo they already have, instead of
          leaving it to the header nav link alone (2026-08-31, 석한 요청). */}
      {status === "success" ? (
        <div className="flex justify-end">
          <Button asChild variant="secondary" size="sm">
            <Link href="/frame">{t("goToFrameButton")}</Link>
          </Button>
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          status === "success" && "border-primary/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          className="sr-only"
          onChange={onInputChange}
        />

        {status === "loading" ? (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </>
        ) : status === "success" ? (
          previewUrl ? (
            <>
              {/* A blob: object URL, not a static/remote asset — next/image's
                  optimizer doesn't apply here, so a plain <img> matches how
                  the Frame Generator itself loads photos. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={fileName ?? ""}
                className="max-h-[320px] w-full rounded-lg object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/55 px-4 py-2 text-left text-white">
                <span className="truncate text-sm">{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-white hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <X className="size-4" />
                  {t("uploaderReset")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="size-8 text-primary" />
              <p className="text-base font-medium">{fileName}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
              >
                <X className="size-4" />
                {t("uploaderReset")}
              </Button>
            </>
          )
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-base font-medium">{t("uploaderTitle")}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {t("uploaderHint")}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              {t("uploaderButton")}
            </Button>
          </>
        )}
      </div>

      {status === "error" && errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
