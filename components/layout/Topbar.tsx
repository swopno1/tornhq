"use client";

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

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession();
  const tornId = session?.user?.tornId;
  const name = session?.user?.name ?? `#${tornId}`;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Sidebar toggle */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-5" />

      {/* Page title */}
      {title && (
        <h1 className="font-heading text-sm font-bold tracking-wider text-foreground/80 uppercase">
          {title}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Player ID badge */}
      {tornId && (
        <Badge
          variant="outline"
          className="border-neon-cyan/30 font-mono text-xs text-neon-cyan"
        >
          #{tornId}
        </Badge>
      )}

      {/* Notifications (static in Week 1) */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {/* Unread indicator — wired up in Week 3 */}
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-neon-amber" />
      </Button>

      {/* User menu */}
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
  );
}
