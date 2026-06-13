"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useTornData } from "@/hooks/use-torn-data";
import { StatBar } from "./StatBar";
import { CooldownCard } from "./CooldownCard";
import { TravelStatus } from "./TravelStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TornUserBasic } from "@/lib/torn-api";

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

export function DashboardClient() {
  const { data, loading, error, refetch } = useTornData<TornUserBasic>(
    "user",
    "basic",
    { refreshInterval: 60_000 },
  );

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="font-mono text-sm text-muted-foreground">{error}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const lastAction = data.last_action;

  return (
    <div className="space-y-4">
      {/* Player header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-lg font-black tracking-wider text-foreground">
          {data.name}
        </h2>
        <Badge variant="outline" className="border-border font-mono text-xs">
          Lvl {data.level}
        </Badge>
        {data.faction != null && "faction_name" in data.faction && data.faction.faction_id > 0 && (
          <Badge variant="outline" className="border-primary/30 font-mono text-xs text-primary">
            {(data.faction as { faction_id: number; faction_name: string }).faction_name}
          </Badge>
        )}
        {lastAction != null && (
          <Badge
            variant="outline"
            className={
              lastAction.status === "Online"
                ? "border-neon-green/30 text-neon-green"
                : lastAction.status === "Idle"
                ? "border-neon-amber/30 text-neon-amber"
                : "border-border text-muted-foreground"
            }
          >
            <span className={
              `mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                lastAction.status === "Online" ? "bg-neon-green" :
                lastAction.status === "Idle" ? "bg-neon-amber" : "bg-muted-foreground"
              }`
            } />
            {lastAction.status}
          </Badge>
        )}
      </div>

      {/* Travel banner — only shown when traveling/abroad */}
      {data.status != null && <TravelStatus travel={data.travel ?? null} status={data.status} />}

      {/* Stat bars grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.energy != null && <StatBar label="Energy"    bar={data.energy} color="cyan"  />}
        {data.nerve  != null && <StatBar label="Nerve"     bar={data.nerve}  color="red"   />}
        {data.happy  != null && <StatBar label="Happiness" bar={data.happy}  color="amber" />}
        {data.life   != null && <StatBar label="Life"      bar={data.life}   color="green" />}
      </div>

      {/* Cooldowns */}
      {data.cooldowns != null && data.status != null && (
        <CooldownCard
          cooldowns={data.cooldowns}
          statusState={data.status.state}
          statusUntil={data.status.until}
        />
      )}

      {/* Status details */}
      {data.status?.description && data.status.state !== "Okay" && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-1">
            <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-destructive">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-muted-foreground">
              {data.status.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
