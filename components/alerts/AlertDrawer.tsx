"use client";

import { ShoppingCart, Zap, Target, Plane, Timer, Link2, Bell, CheckCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/use-alerts";
import type { AlertRecord } from "@/hooks/use-alerts";

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function alertDescription(alert: AlertRecord): string {
  const p = alert.payload;
  switch (alert.type) {
    case "price_alert": {
      const name = String(p.itemName ?? "Item");
      const price = Number(p.lowestPrice ?? 0);
      const below = p.alertBelow != null ? Number(p.alertBelow) : null;
      const above = p.alertAbove != null ? Number(p.alertAbove) : null;
      if (below !== null)
        return `${name} dropped to $${price.toLocaleString()} (alert: <$${below.toLocaleString()})`;
      if (above !== null)
        return `${name} rose to $${price.toLocaleString()} (alert: >$${above.toLocaleString()})`;
      return `${name} — price $${price.toLocaleString()}`;
    }
    case "energy_ready":
      return "Energy bar is full";
    case "nerve_ready":
      return "Nerve bar is full";
    case "travel_landed":
      return `Landed at ${String(p.destination ?? "destination")}`;
    case "cooldown_expired":
      return `${String(p.type ?? "Cooldown")} has expired`;
    case "chain_alert":
      return String(p.message ?? "Chain alert");
    default:
      return "Notification";
  }
}

function AlertIcon({ type, unread }: { type: string; unread: boolean }) {
  const cls = `h-4 w-4 shrink-0 ${unread ? "text-neon-amber" : "text-muted-foreground"}`;
  switch (type) {
    case "price_alert":
      return <ShoppingCart className={cls} />;
    case "energy_ready":
      return <Zap className={cls} />;
    case "nerve_ready":
      return <Target className={cls} />;
    case "travel_landed":
      return <Plane className={cls} />;
    case "cooldown_expired":
      return <Timer className={cls} />;
    case "chain_alert":
      return <Link2 className={cls} />;
    default:
      return <Bell className={cls} />;
  }
}

interface AlertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDrawer({ open, onOpenChange }: AlertDrawerProps) {
  const { alerts, loading, unreadCount, markAllRead } = useAlerts({
    refreshInterval: 30_000,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-sm"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <SheetTitle className="font-heading text-sm font-bold tracking-widest uppercase">
            Alerts
          </SheetTitle>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllRead}
              className="h-7 gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-px p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="font-mono text-sm text-muted-foreground">
                No alerts yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((alert) => {
                const unread = !alert.readAt;
                return (
                  <li
                    key={alert.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      unread ? "bg-neon-amber/5" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <AlertIcon type={alert.type} unread={unread} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={`font-mono text-xs leading-snug ${
                          unread ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {alertDescription(alert)}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground/60">
                        {relativeTime(alert.createdAt)}
                      </p>
                    </div>
                    {unread && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-amber" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
