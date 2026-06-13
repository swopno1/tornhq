"use client";

import { CheckCircle2, Timer } from "lucide-react";
import { useCountdown, formatDuration } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import type { TornCooldowns } from "@/lib/torn-api";

interface CooldownItemProps {
  label: string;
  /** Unix timestamp when cooldown expires, OR 0 if already ready */
  expiresAt: number;
}

function CooldownItem({ label, expiresAt }: CooldownItemProps) {
  const secondsLeft = useCountdown(expiresAt > 0 ? expiresAt : null);
  const ready = expiresAt === 0 || secondsLeft <= 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        {ready ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-neon-green" />
        ) : (
          <Timer className="h-3.5 w-3.5 text-neon-amber" />
        )}
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
      </div>
      {ready ? (
        <span className="font-mono text-xs font-semibold text-neon-green">Ready</span>
      ) : (
        <span className="font-mono text-xs tabular-nums text-neon-amber">
          {formatDuration(secondsLeft)}
        </span>
      )}
    </div>
  );
}

interface HospitalTimerProps {
  /** Unix timestamp when hospital/jail ends */
  until: number;
  state: string;
}

function StatusTimer({ until, state }: HospitalTimerProps) {
  const secondsLeft = useCountdown(until);
  const isActive = until > 0 && secondsLeft > 0;

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-2 mt-2">
      <div className="flex items-center gap-1.5">
        <Timer className="h-3.5 w-3.5 text-destructive" />
        <span className="font-mono text-xs text-destructive font-semibold uppercase tracking-wide">
          {state}
        </span>
      </div>
      <span className="font-mono text-xs tabular-nums text-destructive">
        {formatDuration(secondsLeft)}
      </span>
    </div>
  );
}

interface CooldownCardProps {
  cooldowns: TornCooldowns;
  statusState: string;
  statusUntil: number;
}

export function CooldownCard({ cooldowns, statusState, statusUntil }: CooldownCardProps) {
  const now = Math.floor(Date.now() / 1000);

  const drugExpiry    = cooldowns.drug    > 0 ? now + cooldowns.drug    : 0;
  const boosterExpiry = cooldowns.booster > 0 ? now + cooldowns.booster : 0;
  const medExpiry     = cooldowns.medical > 0 ? now + cooldowns.medical : 0;

  const hospitalActive =
    (statusState === "Hospital" || statusState === "Jail") && statusUntil > now;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4 card-glow">
      <span className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Cooldowns
      </span>

      <div className="space-y-2.5 pt-1">
        <CooldownItem label="Drug"    expiresAt={drugExpiry} />
        <CooldownItem label="Booster" expiresAt={boosterExpiry} />
        <CooldownItem label="Medical" expiresAt={medExpiry} />
      </div>

      {hospitalActive && (
        <StatusTimer
          until={statusUntil}
          state={statusState}
        />
      )}
    </div>
  );
}
