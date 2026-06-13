import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Dashboard
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Live player status — refreshes every 60s
        </p>
      </div>

      <DashboardClient />
    </div>
  );
}
