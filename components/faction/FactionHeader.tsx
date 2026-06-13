import { Shield, Users, Trophy, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TornFactionData } from "@/lib/torn-api";

interface FactionHeaderProps {
  data: TornFactionData;
  memberCount: number;
}

export function FactionHeader({ data, memberCount }: FactionHeaderProps) {
  return (
    <Card className="card-glow-cyan border-border bg-card">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-heading text-base font-black tracking-widest text-neon-cyan glow-cyan uppercase">
                {data.tag ? `[${data.tag}] ` : ""}
                {data.name}
              </h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Faction #{data.ID} · {data.age} days old
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs tabular-nums text-foreground">
                {memberCount}
                <span className="text-muted-foreground">/{data.capacity}</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">members</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-neon-amber" />
              <span className="font-mono text-xs tabular-nums text-neon-amber">
                {data.respect.toLocaleString()}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">respect</span>
            </div>
            {data.best_chain > 0 && (
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {data.best_chain.toLocaleString()}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">best chain</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-neon-cyan/20 font-mono text-[10px] text-neon-cyan/70"
          >
            Leader #{data.leader}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
