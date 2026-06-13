"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap, Lock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const tokenError = searchParams.get("error");

  const bannerError =
    tokenError === "invalid-token"
      ? "Invalid or expired verification link. Please register again."
      : tokenError === "token-expired"
        ? "Verification link expired. Please register again to get a new one."
        : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password. If you haven't verified your email yet, check your inbox."
          : "Sign-in failed. Please try again.",
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
          <Zap
            className="h-7 w-7 text-neon-cyan"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.75 0.15 200))" }}
          />
        </div>
        <h1 className="font-heading text-2xl font-black tracking-widest text-foreground glow-cyan">
          TORNHQ
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Advanced companion for Torn City players
        </p>
      </div>

      {/* Success banners */}
      {verified && (
        <div className="flex items-center gap-2 rounded-md border border-neon-green/30 bg-neon-green/10 px-4 py-3">
          <CheckCircle className="h-4 w-4 shrink-0 text-neon-green" />
          <p className="font-mono text-xs text-neon-green">
            Email verified — you can now sign in.
          </p>
        </div>
      )}
      {reset && (
        <div className="flex items-center gap-2 rounded-md border border-neon-green/30 bg-neon-green/10 px-4 py-3">
          <CheckCircle className="h-4 w-4 shrink-0 text-neon-green" />
          <p className="font-mono text-xs text-neon-green">
            Password updated — sign in with your new password.
          </p>
        </div>
      )}
      {bannerError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="font-mono text-xs text-destructive">{bannerError}</p>
        </div>
      )}

      {/* Login card */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Sign In
            </h2>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-input bg-input pl-9 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="font-mono text-[11px] text-neon-cyan/70 transition-colors hover:text-neon-cyan"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-input bg-input pr-10 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="font-mono text-xs leading-relaxed text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full font-heading text-sm font-bold uppercase tracking-widest transition-all duration-150"
              style={
                !loading && email.trim() && password
                  ? { boxShadow: "0 0 12px oklch(0.45 0.17 265 / 0.4)" }
                  : undefined
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-[11px] text-muted-foreground/40">
        Not affiliated with or endorsed by Torn City Ltd.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
