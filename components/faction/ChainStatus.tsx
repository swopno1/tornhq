"use client";

import { Link2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountdown, formatDuration } from "@/hooks/use-countdown";
import type { TornFactionChain } from "@/lib/torn-api";

interface ChainStatusProps {
  chain: TornFactionChain;
}

export function ChainStatus({ chain }: ChainStatusProps) {
  const now = Math.floor(Date.now() / 1000);
  const isChaining = chain.current > 0 && chain.timeout > now;
  const isOnCooldown = chain.cooldown > now;

  const timeoutRemaining = useCountdown(isChaining ? chain.timeout : null);
  const cooldownRemaining = useCountdown(isOnCooldown ? chain.cooldown : null);

  if (!isChaining && !isOnCooldown) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Chain Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span className="font-mono text-sm">No active chain</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isOnCooldown) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-destructive">
            Chain Cooldown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-muted-foreground">
            Cooldown ends in{" "}
            <span className="text-neon-amber tabular-nums">
              {formatDuration(cooldownRemaining)}
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const pct = chain.max > 0 ? Math.min((chain.current / chain.max) * 100, 100) : 0;

  return (
    <Card className="card-glow border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Active Chain
          </CardTitle>
          <Badge className="bg-neon-green/10 font-mono text-xs text-neon-green border-neon-green/30">
            <Zap className="mr-1 h-3 w-3" />
            {chain.modifier.toFixed(1)}x
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-black tabular-nums text-neon-green glow-green">
            {chain.current.toLocaleString()}
          </span>
          {chain.max > 0 && (
            <span className="font-mono text-sm text-muted-foreground">
              / {chain.max.toLocaleString()} hits
            </span>
          )}
        </div>

        {chain.max > 0 && (
          <div className="stat-bar-track">
            <div
              className="h-full rounded-full bg-neon-green transition-all"
              style={{
                width: `${pct}%`,
                boxShadow: "0 0 8px oklch(0.72 0.17 160 / 0.6)",
              }}
            />
          </div>
        )}

        <p className="font-mono text-xs text-muted-foreground">
          Timeout in{" "}
          <span
            className={`tabular-nums ${
              timeoutRemaining < 300 ? "text-destructive" : "text-neon-amber"
            }`}
          >
            {formatDuration(timeoutRemaining)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
