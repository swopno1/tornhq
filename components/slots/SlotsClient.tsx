"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

interface CasinoState {
  balance: number;
  streak: number | null;
}

export function SlotsClient() {
  const [state, setState] = useState<CasinoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/slots/balance");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      const data: CasinoState = await res.json();
      setState(data);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 60_000);
    return () => clearInterval(id);
  }, [fetchState]);

  const streakLabel = (streak: number | null) => {
    if (streak === null) return null;
    if (streak === 0) return { text: "No streak", icon: <Minus className="h-4 w-4" />, color: "text-muted-foreground" };
    if (streak > 0) return { text: `+${streak} win streak`, icon: <TrendingUp className="h-4 w-4" />, color: "text-(--neon-green)" };
    return { text: `${streak} loss streak`, icon: <TrendingDown className="h-4 w-4" />, color: "text-(--neon-amber)" };
  };

  const streak = streakLabel(state?.streak ?? null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading text-(--neon-cyan) glow-cyan">
          Casino Slots
        </h1>
        <button
          onClick={() => { setLoading(true); fetchState(); }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-(--neon-cyan) transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-glow-cyan">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Coins className="h-4 w-4 text-(--neon-cyan)" />
              Token Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-heading text-(--neon-cyan) glow-cyan tabular-nums">
                {(state?.balance ?? 0).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {streak?.icon ?? <Minus className="h-4 w-4" />}
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className={`text-3xl font-heading tabular-nums ${streak?.color ?? "text-muted-foreground"}`}>
                {streak?.text ?? "—"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          Last updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 60s
        </p>
      )}

      <div className="rounded-md border border-border/50 bg-muted/10 px-4 py-3 text-sm text-muted-foreground space-y-1.5">
        <p className="font-medium text-foreground/70">About this tracker</p>
        <p>
          Play slots on{" "}
          <span className="font-mono text-(--neon-cyan)">torn.com/page.php?sid=slots</span>.
          This page reads your live token balance and streak from the Torn API every 60 seconds.
        </p>
        <p className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-(--neon-amber) border-(--neon-amber)/40 text-[10px]">
            Note
          </Badge>
          Torn does not expose a public API endpoint for automated slot play.
        </p>
      </div>
    </div>
  );
}
