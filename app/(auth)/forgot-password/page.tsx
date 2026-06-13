"use client";

import { useState } from "react";
import { Zap, Mail, SendHorizonal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
          <CheckCircle className="h-7 w-7 text-neon-cyan" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-black tracking-widest text-foreground">
            Check your email
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            If <span className="text-foreground">{email}</span> is registered, you&apos;ll receive a
            reset link shortly. The link expires in 1 hour.
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
          Reset your password
        </p>
      </div>

      <Card className="card-glow border-border bg-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <SendHorizonal className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Forgot Password
            </h2>
          </div>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Enter your email and we&apos;ll send a secure reset link valid for 1 hour.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full font-heading text-sm font-bold uppercase tracking-widest"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending…
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-neon-cyan transition-colors hover:text-neon-cyan/80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
