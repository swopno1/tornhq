"use client";

import { Plane, MapPin } from "lucide-react";
import { useCountdown, formatDuration } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import type { TornTravel, TornStatus } from "@/lib/torn-api";

interface TravelStatusProps {
  travel: TornTravel | null;
  status: TornStatus;
}

export function TravelStatus({ travel, status }: TravelStatusProps) {
  const timeLeft = useCountdown(travel?.timestamp ?? null);

  const isAbroad    = status.state === "Abroad";
  const isTraveling = status.state === "Traveling";
  const isHome      = !isAbroad && !isTraveling;

  if (isHome) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 card-glow-cyan",
        isTraveling ? "border-neon-cyan/30" : "border-neon-green/30",
      )}
    >
      {isTraveling ? (
        <Plane className="h-4 w-4 shrink-0 text-neon-cyan animate-pulse" />
      ) : (
        <MapPin className="h-4 w-4 shrink-0 text-neon-green" />
      )}

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-heading text-xs font-bold uppercase tracking-widest",
          isTraveling ? "text-neon-cyan" : "text-neon-green",
        )}>
          {isTraveling ? "Traveling" : "Abroad"}
        </p>
        <p className="font-mono text-sm text-foreground truncate">
          {travel?.destination ?? status.description}
        </p>
      </div>

      {isTraveling && travel && (
        <div className="text-right shrink-0">
          <p className="font-mono text-xs text-muted-foreground">Arrives in</p>
          <p className="font-mono text-sm font-semibold text-neon-cyan tabular-nums">
            {timeLeft > 0 ? formatDuration(timeLeft) : "Landing…"}
          </p>
        </div>
      )}
    </div>
  );
}
