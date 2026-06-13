"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Users,
  Plane,
  Settings,
  Shield,
  ShieldCheck,
  Dices,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stats", label: "Stats", icon: TrendingUp },
  { href: "/dashboard/market", label: "Market", icon: ShoppingCart },
  { href: "/dashboard/faction", label: "Faction", icon: Users },
  { href: "/dashboard/travel", label: "Travel", icon: Plane },
] as const;

const secondaryItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin ?? false;

  return (
    <Sidebar collapsible="icon">
      {/* Logo / Brand */}
      <SidebarHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" alt="TornHQ" width={28} height={28} className="shrink-0" unoptimized />
          <span className="font-heading text-sm font-bold tracking-widest text-neon-cyan glow-cyan group-data-[collapsible=icon]:hidden">
            TORNHQ
          </span>
        </div>
      </SidebarHeader>

      {/* Primary Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs tracking-widest text-muted-foreground/60 uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        "transition-colors duration-150",
                        isActive &&
                          "bg-sidebar-accent text-neon-cyan ring-1 ring-neon-cyan/20",
                      )}
                    >
                      <Link href={href}>
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-neon-cyan" : "text-muted-foreground",
                          )}
                        />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin section — visible to super admin only */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs tracking-widest text-neon-amber/60 uppercase">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/admin")}
                    tooltip="Admin Panel"
                    className={cn(
                      "transition-colors duration-150",
                      pathname.startsWith("/dashboard/admin") &&
                        "bg-sidebar-accent text-neon-amber ring-1 ring-neon-amber/20",
                    )}
                  >
                    <Link href="/dashboard/admin">
                      <ShieldCheck
                        className={cn(
                          "h-4 w-4",
                          pathname.startsWith("/dashboard/admin")
                            ? "text-neon-amber"
                            : "text-muted-foreground",
                        )}
                      />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/slots")}
                    tooltip="Casino Slots"
                    className={cn(
                      "transition-colors duration-150",
                      pathname.startsWith("/dashboard/slots") &&
                        "bg-sidebar-accent text-neon-amber ring-1 ring-neon-amber/20",
                    )}
                  >
                    <Link href="/dashboard/slots">
                      <Dices
                        className={cn(
                          "h-4 w-4",
                          pathname.startsWith("/dashboard/slots")
                            ? "text-neon-amber"
                            : "text-muted-foreground",
                        )}
                      />
                      <span>Slots</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer — settings + API status */}
      <SidebarFooter className="border-t border-border">
        <SidebarSeparator className="my-0" />
        <SidebarMenu>
          {secondaryItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={label}
              >
                <Link href={href}>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <Shield className="h-3.5 w-3.5 shrink-0 text-neon-green" />
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            API Connected
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
