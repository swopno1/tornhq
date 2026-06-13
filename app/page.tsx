import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Users, Shield, RefreshCw, AlertCircle, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BazaarGrid } from "@/components/landing/BazaarGrid";
import {
  callTornApi,
  type TornUserBasic,
  type TornUserBazaarResponse,
} from "@/lib/torn-api";

// Revalidate every 5 minutes — ISR so the page stays fresh without hammering the API
export const revalidate = 300;

const STATUS_COLOR: Record<string, string> = {
  Okay: "text-neon-green border-neon-green/30 bg-neon-green/10",
  Hospital: "text-destructive border-destructive/30 bg-destructive/10",
  Jail: "text-neon-amber border-neon-amber/30 bg-neon-amber/10",
  Traveling: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10",
  Abroad: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10",
};

const STATUS_DOT: Record<string, string> = {
  Okay: "bg-neon-green shadow-[0_0_6px_oklch(0.72_0.17_160)]",
  Hospital: "bg-destructive",
  Jail: "bg-neon-amber",
  Traveling: "bg-neon-cyan",
  Abroad: "bg-neon-cyan",
};

const ACTIVITY_DOT: Record<string, string> = {
  Online: "bg-neon-green shadow-[0_0_6px_oklch(0.72_0.17_160)]",
  Idle: "bg-neon-amber",
  Offline: "bg-muted-foreground/40",
};

async function fetchStorefront() {
  const apiKey = process.env.TORN_API_KEY;
  if (!apiKey) return { profile: null, bazaar: [], noKey: true };

  const [profileResult, bazaarResult] = await Promise.allSettled([
    callTornApi<TornUserBasic>("/user?selections=basic", apiKey, { revalidate: 300 }),
    callTornApi<TornUserBazaarResponse>("/user?selections=bazaar", apiKey, { revalidate: 300 }),
  ]);

  if (profileResult.status === "rejected") {
    console.error("[storefront] profile fetch threw:", profileResult.reason);
  } else if (profileResult.value.error) {
    console.error("[storefront] Torn API error:", profileResult.value.error);
  }

  const profile =
    profileResult.status === "fulfilled" &&
    !profileResult.value.error &&
    profileResult.value.name != null
      ? profileResult.value
      : null;

  const bazaar =
    bazaarResult.status === "fulfilled" &&
    !bazaarResult.value.error &&
    Array.isArray(bazaarResult.value.bazaar)
      ? bazaarResult.value.bazaar
      : [];

  return { profile, bazaar, noKey: false };
}

export default async function StorefrontPage() {
  const { profile, bazaar, noKey } = await fetchStorefront();

  const faction =
    profile?.faction && "faction_name" in profile.faction
      ? profile.faction
      : null;

  const profileUrl = profile
    ? `https://www.torn.com/profiles.php?XID=${profile.player_id}`
    : "https://www.torn.com";

  const tradeUrl = profile
    ? `https://www.torn.com/trade.php#step=initiate&type=0&to=${profile.player_id}`
    : "https://www.torn.com";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="TornHQ" width={28} height={28} className="shrink-0" unoptimized />
            <span className="font-heading text-sm font-black tracking-widest text-neon-cyan glow-cyan">
              TORNHQ
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricelist"
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <List className="h-3.5 w-3.5" />
              Pricelist
            </Link>
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
              variant="outline"
              className="border-border font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── No API key banner ────────────────────────────────────────── */}
      {noKey && (
        <div className="border-b border-neon-amber/20 bg-neon-amber/5 px-4 py-3 text-center">
          <p className="font-mono text-xs text-neon-amber">
            <AlertCircle className="mr-1.5 inline h-3.5 w-3.5" />
            <strong>Setup required:</strong> Add{" "}
            <code className="rounded bg-neon-amber/10 px-1 text-[11px]">TORN_API_KEY</code>{" "}
            to your environment variables to display live player data.
          </p>
        </div>
      )}

      {/* ── Player profile hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-neon-cyan/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10">
          {profile ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Left — identity */}
              <div className="flex items-start gap-4">
                {/* Avatar placeholder */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 ring-1 ring-neon-cyan/20">
                  <span className="font-heading text-xl font-black text-neon-cyan">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-heading text-2xl font-black tracking-widest text-foreground">
                      {profile.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className="border-border font-mono text-xs text-muted-foreground"
                    >
                      Lv {profile.level}
                    </Badge>

                    {/* Game status */}
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${STATUS_COLOR[profile.status.state] ?? "text-muted-foreground border-border"}`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${STATUS_DOT[profile.status.state] ?? "bg-muted-foreground"}`}
                      />
                      {profile.status.state === "Okay"
                        ? "In Torn City"
                        : profile.status.description}
                    </Badge>
                  </div>

                  {/* Online activity */}
                  <div className="flex flex-wrap items-center gap-3">
                    {profile.last_action && (
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${ACTIVITY_DOT[profile.last_action.status] ?? "bg-muted-foreground/40"}`}
                      />
                      {profile.last_action.status}
                      {profile.last_action.status !== "Online" &&
                        ` · ${profile.last_action.relative}`}
                    </span>
                    )}

                    {faction && (
                      <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {faction.faction_name}
                        <span className="text-muted-foreground/50">
                          [{faction.position}]
                        </span>
                      </span>
                    )}
                  </div>

                  {profile.status.description && profile.status.state !== "Okay" && (
                    <p className="font-mono text-xs text-muted-foreground/60">
                      {profile.status.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right — action buttons */}
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <a
                  href={tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    className="border-neon-cyan/30 bg-neon-cyan/10 font-mono text-xs text-neon-cyan ring-1 ring-neon-cyan/20 hover:bg-neon-cyan/20"
                    variant="outline"
                  >
                    Send Trade Request
                  </Button>
                </a>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Torn Profile
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            /* Profile fetch failed or no key */
            <div className="flex items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card">
                <Shield className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black tracking-widest text-foreground">
                  Player Storefront
                </h1>
                <p className="font-mono text-xs text-muted-foreground">
                  {noKey
                    ? "Configure TORN_API_KEY to show live profile data."
                    : "Could not load profile — Torn API may be unavailable."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Bazaar ───────────────────────────────────────────────────── */}
      <section className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-sm font-black tracking-widest text-foreground uppercase">
                Bazaar
              </h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {bazaar.length > 0
                  ? `${bazaar.length} item${bazaar.length !== 1 ? "s" : ""} for sale · prices updated every 5 min`
                  : "No items currently listed in the bazaar."}
              </p>
            </div>

            {profile && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                View full bazaar on Torn
              </a>
            )}
          </div>

          <BazaarGrid
            items={bazaar}
            playerId={profile?.player_id ?? 0}
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="" width={16} height={16} className="shrink-0" unoptimized />
            <span className="font-heading text-xs font-bold tracking-widest text-neon-cyan">
              TORNHQ
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/40">
              · Not affiliated with Torn Ltd.
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/50">
            Powered by{" "}
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
