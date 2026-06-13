"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Shield, KeyRound, LogOut, Moon, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const tornId = session?.user?.tornId;
  const email = session?.user?.email;

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSaveApiKey(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);

    const res = await fetch("/api/user/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setSaveResult({ ok: false, message: data.error ?? "Failed to save API key." });
      return;
    }

    setSaveResult({ ok: true, message: `Linked to Torn player #${data.tornId} (${data.name}).` });
    setApiKey("");
    await update();
  }

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
                  {email ?? "—"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {tornId ? `Torn ID #${tornId}` : "No Torn ID linked"}
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
        </CardContent>
      </Card>

      {/* Torn API Key */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Torn API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/20">
              <KeyRound className="h-4 w-4 text-neon-cyan" />
            </div>
            <div>
              <p className="font-mono text-sm text-foreground">
                {tornId ? "API key linked" : "No API key set"}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {tornId
                  ? "Stored encrypted with AES-256-GCM. Enter a new key below to replace it."
                  : "Required for dashboard data. Get your key at torn.com → Preferences → API."}
              </p>
            </div>
            {tornId && (
              <Badge
                variant="outline"
                className="ml-auto shrink-0 border-neon-cyan/30 font-mono text-[10px] text-neon-cyan/70"
              >
                ••••••••
              </Badge>
            )}
          </div>

          <Separator className="bg-border" />

          <form onSubmit={handleSaveApiKey} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {tornId ? "Replace API Key" : "Add API Key"}
              </Label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Torn API key"
                  className="border-input bg-input pr-10 font-mono text-sm"
                  autoComplete="off"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {saveResult && (
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                  saveResult.ok
                    ? "border-neon-green/30 bg-neon-green/10"
                    : "border-destructive/30 bg-destructive/10"
                }`}
              >
                {saveResult.ok ? (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-neon-green" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                )}
                <p
                  className={`font-mono text-xs ${saveResult.ok ? "text-neon-green" : "text-destructive"}`}
                >
                  {saveResult.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={saving || !apiKey.trim()}
              className="font-mono text-xs"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Validating…
                </span>
              ) : (
                "Save API Key"
              )}
            </Button>
          </form>
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

      {/* Session */}
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
