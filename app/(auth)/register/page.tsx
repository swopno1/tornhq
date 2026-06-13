"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, UserPlus, Mail, Lock, Key, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tornApiKey, setTornApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, tornApiKey }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neon-green/10 ring-1 ring-neon-green/30">
          <CheckCircle className="h-7 w-7 text-neon-green" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-black tracking-widest text-foreground">
            Check your email
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            We sent a verification link to <span className="text-foreground">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="font-mono text-sm">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
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
          Create your account
        </p>
      </div>

      <Card className="card-glow border-border bg-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Register
            </h2>
          </div>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Your Torn API key is encrypted with AES-256 and never sent to the browser after setup.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Password
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

            {/* Confirm password */}
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
                  placeholder="Repeat password"
                  className="border-input bg-input pl-9 font-mono text-sm placeholder:text-muted-foreground/40"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Torn API key */}
            <div className="space-y-2">
              <Label htmlFor="tornKey" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Torn API Key
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  id="tornKey"
                  type={showKey ? "text" : "password"}
                  value={tornApiKey}
                  onChange={(e) => setTornApiKey(e.target.value)}
                  placeholder="Paste your Torn API key…"
                  className="border-input bg-input px-9 font-mono text-sm placeholder:text-muted-foreground/40"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/60">
                Get your key at{" "}
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

            {error && (
              <p role="alert" className="font-mono text-xs leading-relaxed text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword || !tornApiKey}
              className="w-full font-heading text-sm font-bold uppercase tracking-widest transition-all duration-150"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-neon-cyan transition-colors hover:text-neon-cyan/80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
