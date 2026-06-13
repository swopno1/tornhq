"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/use-alerts";
import { AlertDrawer } from "@/components/alerts/AlertDrawer";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession();
  const tornId = session?.user?.tornId;
  const name = session?.user?.name ?? `#${tornId}`;
  const initials = name.slice(0, 2).toUpperCase();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount } = useAlerts({ unreadOnly: true, refreshInterval: 60_000 });

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        {title && (
          <h1 className="font-heading text-sm font-bold tracking-wider text-foreground/80 uppercase">
            {title}
          </h1>
        )}

        <div className="flex-1" />

        {tornId && (
          <Badge
            variant="outline"
            className="border-neon-cyan/30 font-mono text-xs text-neon-cyan"
          >
            #{tornId}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          onClick={() => setDrawerOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-amber font-mono text-[9px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 items-center gap-2 px-2 text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/20 font-heading text-[10px] text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs sm:block">{name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
              Signed in as
            </DropdownMenuLabel>
            <DropdownMenuLabel className="py-0 font-heading text-sm">
              {name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <AlertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
