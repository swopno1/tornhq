import Link from "next/link";
import {
  Zap,
  TrendingUp,
  ShoppingCart,
  Users,
  BarChart2,
  Bell,
  Plane,
  Calculator,
  ChevronRight,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: BarChart2,
    color: "text-neon-cyan",
    ring: "ring-neon-cyan/20 bg-neon-cyan/10",
    title: "Live Dashboard",
    desc: "Real-time energy, nerve, happy and life bars. Cooldown timers for drugs, boosters and medical. Hospital and jail countdowns. Travel status at a glance.",
  },
  {
    icon: ShoppingCart,
    color: "text-neon-green",
    ring: "ring-neon-green/20 bg-neon-green/10",
    title: "Market Intelligence",
    desc: "Watch Torn City market items and track price history. Sparkline charts for 24-hour trends. Automated alerts when items drop below or spike above your targets.",
  },
  {
    icon: TrendingUp,
    color: "text-neon-amber",
    ring: "ring-neon-amber/20 bg-neon-amber/10",
    title: "Battle Stats Tracker",
    desc: "Snapshot your Strength, Speed, Defense and Dexterity every 6 hours automatically. Visualize growth over time with a 4-line Recharts chart and full history table.",
  },
  {
    icon: Users,
    color: "text-neon-cyan",
    ring: "ring-neon-cyan/20 bg-neon-cyan/10",
    title: "Faction Command",
    desc: "Live chain countdown with 5-minute timeout warnings. Member activity table sortable by status, level, last action and days in faction. Chain cooldown state.",
  },
  {
    icon: Bell,
    color: "text-neon-amber",
    ring: "ring-neon-amber/20 bg-neon-amber/10",
    title: "Smart Alerts",
    desc: "Price threshold alerts fired by background Inngest jobs every 15 minutes. Alert drawer accessible from any page. Unread badge on the notification bell.",
  },
  {
    icon: Calculator,
    color: "text-neon-green",
    ring: "ring-neon-green/20 bg-neon-green/10",
    title: "Calculators",
    desc: "Torn City tools and calculators — profit margin, gym efficiency, hospital time, travel cost and more. More calculators added regularly.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your API key",
    desc: "Sign in with your Torn City API key. It is validated instantly and stored with AES-256-GCM encryption — never visible in plaintext.",
  },
  {
    n: "02",
    title: "Dashboard auto-populates",
    desc: "Your bars, cooldowns, stats and faction data load immediately. Background jobs start snapshotting your stats and polling market prices.",
  },
  {
    n: "03",
    title: "Set targets, get alerts",
    desc: "Add market items to your watchlist, set price thresholds, and let TornHQ notify you while you play — or while you sleep.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
              <Zap className="h-4 w-4 text-neon-cyan" />
            </div>
            <span className="font-heading text-sm font-black tracking-widest text-neon-cyan glow-cyan">
              TORNHQ
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://www.vivescriptsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              By ViveScript
            </Link>
            <Button
              asChild
              size="sm"
              className="border-neon-cyan/30 bg-neon-cyan/10 font-mono text-xs text-neon-cyan ring-1 ring-neon-cyan/20 hover:bg-neon-cyan/20"
              variant="outline"
            >
              <Link href="/dashboard">
                Enter Dashboard
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* grid bg */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        {/* neon glow blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-neon-cyan/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-neon-amber/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <Badge
            variant="outline"
            className="mb-6 border-neon-cyan/30 font-mono text-xs text-neon-cyan/80"
          >
            Torn City Companion — Built for serious players
          </Badge>

          <h1 className="font-heading text-4xl font-black leading-tight tracking-widest text-foreground uppercase md:text-6xl">
            Your Torn City
            <br />
            <span className="text-neon-cyan glow-cyan">Command Center</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            TornHQ is a personal companion app for senior Torn City players.
            Track your stats, manage your marketplace, monitor faction activity,
            and get automated price alerts — all in one OLED cyberpunk interface.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="border-neon-cyan/40 bg-neon-cyan/10 font-mono text-sm font-bold tracking-widest text-neon-cyan ring-1 ring-neon-cyan/30 hover:bg-neon-cyan/20"
              variant="outline"
            >
              <Link href="/dashboard">
                <Zap className="mr-2 h-4 w-4" />
                Enter Dashboard
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="font-mono text-sm text-muted-foreground hover:text-foreground"
            >
              <Link href="#features">
                See features
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* status strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-muted-foreground/60">
            {[
              "AES-256-GCM encrypted keys",
              "Redis-cached API proxy",
              "Inngest background jobs",
              "OLED dark-only UI",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-neon-green" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="border-b border-border/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
              What&apos;s inside
            </p>
            <h2 className="mt-2 font-heading text-2xl font-black tracking-widest text-foreground uppercase md:text-3xl">
              Everything a senior player needs
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, ring, title, desc }) => (
              <Card
                key={title}
                className="card-glow border-border bg-card transition-colors duration-200 hover:border-border/80"
              >
                <CardContent className="p-5">
                  <div
                    className={`mb-4 flex h-9 w-9 items-center justify-center rounded-sm ring-1 ${ring}`}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <h3 className="font-heading text-sm font-bold tracking-widest text-foreground uppercase">
                    {title}
                  </h3>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-b border-border/40 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
              Setup in minutes
            </p>
            <h2 className="mt-2 font-heading text-2xl font-black tracking-widest text-foreground uppercase md:text-3xl">
              How it works
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                <p className="font-heading text-4xl font-black tracking-widest text-neon-cyan/15">
                  {n}
                </p>
                <h3 className="-mt-2 font-heading text-sm font-bold tracking-widest text-foreground uppercase">
                  {title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel section ───────────────────────────────────────────── */}
      <section className="border-b border-border/40 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-xl border border-neon-amber/20 bg-neon-amber/5 p-8 text-center">
            <Plane className="mx-auto mb-4 h-8 w-8 text-neon-amber" />
            <h2 className="font-heading text-xl font-black tracking-widest text-foreground uppercase">
              Your Torn business, organized
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
              TornHQ acts as your player&apos;s public face — your marketplace listings,
              your bazaar, your buying and selling history, your inventory and cash
              resources. Built for players who take the game seriously.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                "Marketplace management",
                "Bazaar listings",
                "Inventory tracking",
                "Cash & resource overview",
                "Travel planner",
                "Faction tools",
              ].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-neon-amber/30 font-mono text-xs text-neon-amber/80"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ViveScript CTA ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="pointer-events-none mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/30">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-black tracking-widest text-foreground uppercase md:text-3xl">
            Want your own TornHQ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            TornHQ is built and maintained by{" "}
            <span className="text-foreground">ViveScript Solutions</span>.
            We build custom Torn City companion apps, web tools, and automation
            solutions for players who want an edge.
          </p>
          <p className="mx-auto mt-2 font-mono text-xs text-muted-foreground/60">
            Custom setup &bull; Your branding &bull; Your player data &bull; Ongoing support
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="border-primary/30 bg-primary/10 font-mono text-sm font-bold tracking-widest text-primary ring-1 ring-primary/20 hover:bg-primary/20"
              variant="outline"
            >
              <Link
                href="https://www.vivescriptsolutions.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                vivescriptsolutions.com
              </Link>
            </Button>
          </div>

          <p className="mt-6 font-mono text-[11px] text-muted-foreground/40">
            Not affiliated with Torn Ltd. &bull; Torn City is a trademark of Torn Ltd.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-neon-cyan" />
            <span className="font-heading text-xs font-bold tracking-widest text-neon-cyan">
              TORNHQ
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/50">
            Built by{" "}
            <Link
              href="https://www.vivescriptsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              ViveScript Solutions
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
