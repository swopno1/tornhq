"use client";

import { signOut, useSession } from "next-auth/react";
import { Shield, KeyRound, LogOut, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();
  const tornId = session?.user?.tornId;
  const name = session?.user?.name ?? `Player #${tornId}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Settings
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Account and application preferences
        </p>
      </div>

      {/* Account */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">
                  {name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Torn ID #{tornId}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-neon-green/30 font-mono text-xs text-neon-green"
            >
              Active
            </Badge>
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/20">
                <KeyRound className="h-4 w-4 text-neon-cyan" />
              </div>
              <div>
                <p className="font-mono text-sm text-foreground">API Key</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Stored encrypted (AES-256-GCM)
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-neon-cyan/30 font-mono text-[10px] text-neon-cyan/70"
            >
              ••••••••
            </Badge>
          </div>

          <p className="font-mono text-[11px] text-muted-foreground/60">
            To update your API key, sign out and sign back in with the new key.
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted ring-1 ring-border">
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-sm text-foreground">Dark Mode</p>
                <p className="font-mono text-xs text-muted-foreground">
                  OLED black — cyberpunk theme (always on)
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-border font-mono text-xs text-muted-foreground"
            >
              On
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/20 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-destructive">
            Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-foreground">Sign out</p>
              <p className="font-mono text-xs text-muted-foreground">
                Ends your session on this device
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 font-mono text-xs text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
