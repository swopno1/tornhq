"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Users,
  Plane,
  Settings,
  Zap,
  Shield,
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
  { href: "/stats", label: "Stats", icon: TrendingUp },
  { href: "/market", label: "Market", icon: ShoppingCart },
  { href: "/faction", label: "Faction", icon: Users },
  { href: "/travel", label: "Travel", icon: Plane },
] as const;

const secondaryItems = [
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Logo / Brand */}
      <SidebarHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
            <Zap className="h-4 w-4 text-neon-cyan" />
          </div>
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
      </SidebarContent>

      {/* Footer — API status + settings */}
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

        {/* API connection status */}
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
