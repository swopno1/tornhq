"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-destructive/10 ring-1 ring-destructive/30">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-black tracking-widest text-foreground">
            Invalid Link
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            This reset link is missing a token. Request a new one from the forgot password page.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" className="font-mono text-sm">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to reset password.");
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
          <Zap
            className="h-7 w-7 text-neon-cyan"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.75 0.15 200))" }}
          />
        </div>
        <h1 className="font-heading text-2xl font-black tracking-widest text-foreground glow-cyan">
          TORNHQ
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Set a new password
        </p>
      </div>

      <Card className="card-glow border-border bg-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Reset Password
            </h2>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="border-input bg-input px-9 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="border-input bg-input pl-9 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="font-mono text-xs leading-relaxed text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full font-heading text-sm font-bold uppercase tracking-widest"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating…
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-xs text-muted-foreground">
        <Link href="/login" className="text-neon-cyan transition-colors hover:text-neon-cyan/80">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
