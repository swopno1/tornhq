import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchedItemsTable } from "@/components/market/WatchedItemsTable";

export const metadata: Metadata = { title: "Market" };

export default function MarketPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Market Watch
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Track item prices — updated every 15 minutes
        </p>
      </div>

      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Watched Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WatchedItemsTable />
        </CardContent>
      </Card>
    </div>
  );
}
