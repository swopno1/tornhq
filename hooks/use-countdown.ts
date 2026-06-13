"use client";

import { useState, useEffect } from "react";

/** Counts down from a Unix timestamp (seconds) to now. Returns seconds remaining. */
export function useCountdown(targetUnix: number | null | undefined): number {
  const calc = () =>
    targetUnix ? Math.max(0, Math.floor(targetUnix - Date.now() / 1000)) : 0;

  const [seconds, setSeconds] = useState(calc);

  useEffect(() => {
    setSeconds(calc());
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUnix]);

  return seconds;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "Ready";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
