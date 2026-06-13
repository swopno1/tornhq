import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Zap, Shield, ShoppingCart, Users, TrendingUp, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Dashboard" };


const upcomingWidgets = [
  {
    icon: Zap,
    title: "Energy / Nerve / Happy",
    desc: "Animated stat bars with tick timers and ready alerts",
    color: "text-neon-amber",
  },
  {
    icon: Shield,
    title: "Cooldown Timers",
    desc: "Hospital, jail, drug & booster countdowns",
    color: "text-destructive",
  },
  {
    icon: Plane,
    title: "Travel Status",
    desc: "Current destination, time left, abroad items",
    color: "text-neon-cyan",
  },
  {
    icon: TrendingUp,
    title: "Stat Growth Chart",
    desc: "Str / Def / Spd / Dex history from periodic snapshots",
    color: "text-neon-green",
  },
  {
    icon: ShoppingCart,
    title: "Market Tracker",
    desc: "Watched items with price history sparklines",
    color: "text-neon-amber",
  },
  {
    icon: Users,
    title: "Faction Overview",
    desc: "Member activity, last action, chain participation",
    color: "text-primary",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? `#${session?.user?.tornId}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Welcome header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-xl font-black tracking-widest text-foreground uppercase">
            Welcome back,{" "}
            <span className="text-neon-cyan glow-cyan">{name}</span>
          </h1>
          <Badge
            variant="outline"
            className="border-neon-green/30 font-mono text-[10px] text-neon-green"
          >
            Week 1 Complete
          </Badge>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          Foundation is live. Dashboard widgets arrive in Week 2.
        </p>
      </div>

      {/* Skeleton preview of what's coming */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingWidgets.map(({ icon: Icon, title, desc, color }) => (
          <Card key={title} className="card-glow border-border bg-card group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-bold tracking-wider uppercase">
                <Icon className={`h-4 w-4 ${color}`} />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
              <div className="space-y-1.5 opacity-40">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-3/4 rounded-full" />
                <Skeleton className="h-2 w-1/2 rounded-full" />
              </div>
              <Badge
                variant="outline"
                className="border-border font-mono text-[10px] text-muted-foreground"
              >
                Week 2
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auth & proxy confirmation */}
      <Card className="card-glow-cyan border-neon-cyan/20 bg-card/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-neon-green" />
            <div className="space-y-1">
              <p className="font-heading text-xs font-bold tracking-wider uppercase text-neon-green">
                Week 1 Deliverables — Complete
              </p>
              <ul className="space-y-0.5 font-mono text-xs text-muted-foreground">
                <li>✓ AES-256-GCM API key encryption</li>
                <li>✓ NextAuth credentials provider + JWT sessions</li>
                <li>✓ /api/torn proxy with Redis cache (5-min TTL)</li>
                <li>✓ Upstash sliding-window rate limiter (80 req/60s)</li>
                <li>✓ OLED dark cyberpunk theme — Orbitron + JetBrains Mono</li>
                <li>✓ Collapsible sidebar + topbar + mobile bottom nav</li>
                <li>✓ Prisma schema: User, StatSnapshot, MarketItem, PricePoint, WatchedItem, Alert</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
