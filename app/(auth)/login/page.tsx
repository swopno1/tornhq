"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, Lock, Shield, TrendingUp, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  { icon: TrendingUp, label: "Stat growth tracking & analytics" },
  { icon: ShoppingCart, label: "Market price tracker & alerts" },
  { icon: Users, label: "Faction activity dashboard" },
  { icon: Shield, label: "End-to-end encrypted API key storage" },
];

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);

    const result = await signIn("torn-api-key", {
      apiKey: apiKey.trim(),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "Invalid API key or unable to reach Torn. Double-check your key and try again.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo */}
      <div className="text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
          <Zap className="h-7 w-7 text-neon-cyan" style={{ filter: "drop-shadow(0 0 8px oklch(0.75 0.15 200))" }} />
        </div>
        <h1 className="font-heading text-2xl font-black tracking-widest text-foreground glow-cyan">
          TORNHQ
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Advanced companion for Torn City players
        </p>
      </div>

      {/* Login card */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-heading text-sm font-bold tracking-widest uppercase text-foreground">
              Connect Your Account
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Enter your Torn API key to get started. Your key is encrypted with
            AES-256 before storage and never sent to the browser again.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="apiKey"
                className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
              >
                Torn API Key
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here…"
                  className="border-input bg-input pr-10 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="font-mono text-xs text-destructive leading-relaxed"
                >
                  {error}
                </p>
              )}

              <p className="font-mono text-[11px] text-muted-foreground/60 leading-relaxed">
                Find your key at{" "}
                <a
                  href="https://www.torn.com/preferences.php#tab=api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-cyan hover:underline"
                >
                  Torn → Preferences → API
                </a>
                . A public access key is sufficient.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full font-heading text-sm font-bold tracking-widest uppercase transition-all duration-150"
              style={
                !loading && apiKey.trim()
                  ? { boxShadow: "0 0 12px oklch(0.45 0.17 265 / 0.4)" }
                  : undefined
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting…
                </span>
              ) : (
                "Connect to Torn"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-2">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-2"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-neon-cyan/70" />
            <span className="font-mono text-[11px] text-muted-foreground leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center font-mono text-[11px] text-muted-foreground/40">
        Not affiliated with or endorsed by Torn City Ltd.
      </p>
    </div>
  );
}
