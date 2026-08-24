"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_INPUT_ACCEPT } from "@/lib/exif";
import { useExifStore } from "@/store/exif-store";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { Button } from "@/components/ui/button";

export function ExifUploader() {
  const t = useTranslations("Home");
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const status = useExifStore((s) => s.status);
  const fileName = useExifStore((s) => s.fileName);
  const errorMessage = useExifStore((s) => s.errorMessage);
  const reset = useExifStore((s) => s.reset);
  const { handleFile } = usePhotoUpload();

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
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-10 text-center transition-colors",
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
