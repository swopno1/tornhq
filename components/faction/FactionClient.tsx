"use client";

import { AlertCircle, RefreshCw, ShieldOff } from "lucide-react";
import { useTornData } from "@/hooks/use-torn-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FactionHeader } from "./FactionHeader";
import { ChainStatus } from "./ChainStatus";
import { MemberTable } from "./MemberTable";
import type { TornFactionData } from "@/lib/torn-api";

function FactionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function FactionClient() {
  const { data, loading, error, refetch } = useTornData<TornFactionData>(
    "faction",
    "basic,chain,members",
    { refreshInterval: 120_000 },
  );

  if (loading) return <FactionSkeleton />;

  if (error) {
    const noFaction =
      error.toLowerCase().includes("faction") ||
      error.toLowerCase().includes("not in");

    if (noFaction) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <ShieldOff className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading text-sm tracking-widest text-muted-foreground uppercase">
            Not in a faction
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Join a faction in Torn City to see member activity and chain status here.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="font-mono text-sm text-muted-foreground">{error}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data?.ID) return null;

  const memberCount = Object.keys(data.members ?? {}).length;

  return (
    <div className="space-y-4">
      <FactionHeader data={data} memberCount={memberCount} />

      <ChainStatus chain={data.chain ?? { current: 0, max: 0, timeout: 0, cooldown: 0, modifier: 1, start: 0 }} />

      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Members — {memberCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {memberCount === 0 ? (
            <p className="px-6 py-4 font-mono text-sm text-muted-foreground">
              No member data available.
            </p>
          ) : (
            <MemberTable members={data.members} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
