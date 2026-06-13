"use client";

import { Plane, AlertCircle, RefreshCw, MapPin } from "lucide-react";
import { useTornData } from "@/hooks/use-torn-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TravelStatus } from "@/components/dashboard/TravelStatus";
import type { TornUserBasic } from "@/lib/torn-api";

const DESTINATIONS = [
  "Mexico",
  "Cayman Islands",
  "Canada",
  "Hawaii",
  "United Kingdom",
  "Argentina",
  "Switzerland",
  "Japan",
  "China",
  "UAE",
  "South Africa",
];

export default function TravelPage() {
  const { data, loading, error, refetch } = useTornData<TornUserBasic>(
    "user",
    "basic",
    { refreshInterval: 30_000 },
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Travel
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Current travel status — refreshes every 30 seconds
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-mono text-sm text-muted-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {!loading && data && (
        <>
          {data.status.state === "Okay" ? (
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-5">
                <MapPin className="h-5 w-5 text-neon-cyan" />
                <div>
                  <p className="font-heading text-sm font-bold tracking-widest text-foreground uppercase">
                    Currently in Torn City
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    You're home. Take a flight from the Travel Agency.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <TravelStatus travel={data.travel} status={data.status} />
          )}

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Plane className="h-3.5 w-3.5" />
                Available Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DESTINATIONS.map((dest) => (
                  <Badge
                    key={dest}
                    variant="outline"
                    className={`border-border font-mono text-xs ${
                      data.travel?.destination === dest
                        ? "border-neon-cyan/40 text-neon-cyan"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
