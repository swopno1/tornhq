"use client";

import { useCountdown, formatDuration } from "@/hooks/use-countdown";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TornBar } from "@/lib/torn-api";

type BarColor = "cyan" | "amber" | "green" | "red";

const colorMap: Record<BarColor, { bar: string; glow: string; label: string }> = {
  cyan:  { bar: "bg-neon-cyan",  glow: "shadow-[0_0_8px_oklch(0.75_0.15_200)]",  label: "text-neon-cyan" },
  amber: { bar: "bg-neon-amber", glow: "shadow-[0_0_8px_oklch(0.75_0.16_65)]",   label: "text-neon-amber" },
  green: { bar: "bg-neon-green", glow: "shadow-[0_0_8px_oklch(0.72_0.17_160)]",  label: "text-neon-green" },
  red:   { bar: "bg-destructive", glow: "shadow-[0_0_8px_oklch(0.55_0.22_25)]",  label: "text-destructive" },
};

interface StatBarProps {
  label: string;
  bar: TornBar;
  color: BarColor;
}

export function StatBar({ label, bar, color }: StatBarProps) {
  const tickLeft  = useCountdown(bar.tick_time);
  const fullLeft  = useCountdown(bar.full_time);
  const isFull    = bar.current >= bar.maximum;
  const pct       = Math.min(100, (bar.current / bar.maximum) * 100);
  const colors    = colorMap[color];

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4 card-glow">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className={cn("font-heading text-xs font-bold uppercase tracking-widest", colors.label)}>
          {label}
        </span>
        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
          {bar.current}
          <span className="text-muted-foreground">/{bar.maximum}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colors.bar,
            isFull && colors.glow,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        {isFull ? (
          <span className={cn("font-mono text-xs font-semibold", colors.label)}>
            FULL
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            Full in{" "}
            <span className="text-foreground">{formatDuration(fullLeft)}</span>
          </span>
        )}
        {!isFull && (
          <span className="font-mono text-[11px] text-muted-foreground">
            +1 in {formatDuration(tickLeft)}
          </span>
        )}
      </div>
    </div>
  );
}
