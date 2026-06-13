"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Users,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/use-alerts";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/stats", label: "Stats", icon: TrendingUp },
  { href: "/dashboard/market", label: "Market", icon: ShoppingCart },
  { href: "/dashboard/faction", label: "Faction", icon: Users },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useAlerts({ unreadOnly: true, refreshInterval: 60_000 });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        const isAlerts = href === "/dashboard/alerts";

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-150",
              isActive ? "text-neon-cyan" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-[0_0_6px_oklch(0.75_0.15_200)]",
                )}
              />
              {isAlerts && unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon-amber font-mono text-[9px] font-bold text-black">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium tracking-wide",
                isActive ? "font-heading" : "font-sans",
              )}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-8 rounded-t-full bg-neon-cyan shadow-[0_0_6px_oklch(0.75_0.15_200)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
