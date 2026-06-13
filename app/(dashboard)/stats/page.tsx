import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatGrowthChart } from "@/components/stats/StatGrowthChart";
import { SnapshotTable } from "@/components/stats/SnapshotTable";
import { SnapshotTrigger } from "@/components/stats/SnapshotTrigger";

export const metadata: Metadata = { title: "Stats" };

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  const snapshots = session?.user?.userId
    ? await prisma.statSnapshot.findMany({
        where: { userId: session.user.userId },
        orderBy: { takenAt: "desc" },
        take: 60,
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
            Stat History
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Battle stats tracked over time — snapshots every 6 hours
          </p>
        </div>
        <SnapshotTrigger hasRecent={snapshots.length > 0} />
      </div>

      {/* Growth chart */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Battle Stats Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatGrowthChart snapshots={snapshots} />
        </CardContent>
      </Card>

      {/* History table */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Snapshot History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SnapshotTable snapshots={snapshots} />
        </CardContent>
      </Card>
    </div>
  );
}
