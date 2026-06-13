import type { Metadata } from "next";
import { FactionClient } from "@/components/faction/FactionClient";

export const metadata: Metadata = { title: "Faction" };

export default function FactionPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Faction
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Member activity and chain status — refreshes every 2 minutes
        </p>
      </div>

      <FactionClient />
    </div>
  );
}
