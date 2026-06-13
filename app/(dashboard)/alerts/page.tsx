import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, Target, Plane, Timer, Link2, Bell } from "lucide-react";

export const metadata: Metadata = { title: "Alerts" };

const ALERT_LABELS: Record<string, string> = {
  price_alert: "Price",
  energy_ready: "Energy",
  nerve_ready: "Nerve",
  travel_landed: "Travel",
  cooldown_expired: "Cooldown",
  chain_alert: "Chain",
};

const ALERT_ICONS: Record<string, React.ElementType> = {
  price_alert: ShoppingCart,
  energy_ready: Zap,
  nerve_ready: Target,
  travel_landed: Plane,
  cooldown_expired: Timer,
  chain_alert: Link2,
};

function alertDescription(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case "price_alert": {
      const name = String(payload.itemName ?? "Item");
      const price = Number(payload.lowestPrice ?? 0);
      const below = payload.alertBelow != null ? Number(payload.alertBelow) : null;
      const above = payload.alertAbove != null ? Number(payload.alertAbove) : null;
      if (below !== null)
        return `${name} dropped to $${price.toLocaleString()} (alert: <$${below.toLocaleString()})`;
      if (above !== null)
        return `${name} rose to $${price.toLocaleString()} (alert: >$${above.toLocaleString()})`;
      return `${name} — price $${price.toLocaleString()}`;
    }
    case "energy_ready": return "Energy bar is full";
    case "nerve_ready": return "Nerve bar is full";
    case "travel_landed": return `Landed at ${String(payload.destination ?? "destination")}`;
    case "cooldown_expired": return `${String(payload.type ?? "Cooldown")} has expired`;
    case "chain_alert": return String(payload.message ?? "Chain alert");
    default: return "Notification";
  }
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);

  const alerts = session?.user?.userId
    ? await prisma.alert.findMany({
        where: { userId: session.user.userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  const unread = alerts.filter((a) => !a.readAt).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
            Alert History
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            All notifications from market price changes and game events
          </p>
        </div>
        {unread > 0 && (
          <Badge className="bg-neon-amber/20 font-mono text-xs text-neon-amber border-neon-amber/30">
            {unread} unread
          </Badge>
        )}
      </div>

      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="font-mono text-sm text-muted-foreground">
                No alerts yet — add market items to get started
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((alert) => {
                const Icon = ALERT_ICONS[alert.type] ?? Bell;
                const unread = !alert.readAt;
                const payload = (alert.payload ?? {}) as Record<string, unknown>;

                return (
                  <li
                    key={alert.id}
                    className={`flex items-start gap-3 px-6 py-3 ${
                      unread ? "bg-neon-amber/5" : ""
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        unread ? "text-neon-amber" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={`font-mono text-xs ${
                          unread ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {alertDescription(alert.type, payload)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-border font-mono text-[10px] text-muted-foreground/60"
                        >
                          {ALERT_LABELS[alert.type] ?? alert.type}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground/60">
                          {formatDate(new Date(alert.createdAt))}
                        </span>
                      </div>
                    </div>
                    {unread && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-amber" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
