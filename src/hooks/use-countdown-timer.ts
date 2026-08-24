"use client";

import * as React from "react";
import { playCompletionBeep } from "@/lib/beep";

export type CountdownStatus = "idle" | "running" | "done";

export function useCountdownTimer(durationSeconds: number) {
  const [status, setStatus] = React.useState<CountdownStatus>("idle");
  const [runningRemaining, setRunningRemaining] = React.useState(0);
  const endTimeRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const clearTimer = React.useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = React.useCallback(() => {
    if (endTimeRef.current === null) return;
    const remaining = (endTimeRef.current - Date.now()) / 1000;
    if (remaining <= 0) {
      setRunningRemaining(0);
      setStatus("done");
      clearTimer();
      playCompletionBeep();
    } else {
      setRunningRemaining(remaining);
    }
  }, [clearTimer]);

  const start = React.useCallback(() => {
    clearTimer();
    endTimeRef.current = Date.now() + durationSeconds * 1000;
    setRunningRemaining(durationSeconds);
    setStatus("running");
    intervalRef.current = setInterval(tick, 200);
  }, [durationSeconds, clearTimer, tick]);

  const reset = React.useCallback(() => {
    clearTimer();
    endTimeRef.current = null;
    setStatus("idle");
  }, [clearTimer]);

  React.useEffect(() => clearTimer, [clearTimer]);

  // While idle, the countdown simply mirrors the latest calculated
  // duration (no state needed — it's derived straight from the prop).
  const remainingSeconds = status === "idle" ? durationSeconds : runningRemaining;

  return { status, remainingSeconds, start, reset };
}
