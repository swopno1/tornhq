import Link from "next/link";
import { Zap, ExternalLink, Users, Shield, AlertCircle, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricelistTable } from "@/components/pricelist/PricelistTable";
import {
  callTornApi,
  type TornUserBasic,
  type TornUserBazaarResponse,
} from "@/lib/torn-api";

// Revalidate every 60 seconds — sold items drop off within a minute
export const revalidate = 60;

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

async function fetchPricelistData() {
  const apiKey = process.env.TORN_API_KEY;
  const fetchedAt = Date.now();

  if (!apiKey) return { profile: null, items: [], fetchedAt, noKey: true };

  const [profileResult, bazaarResult] = await Promise.allSettled([
    callTornApi<TornUserBasic>("/user?selections=basic", apiKey, { revalidate: 60 }),
    callTornApi<TornUserBazaarResponse>("/user?selections=bazaar", apiKey, { revalidate: 60 }),
  ]);

  const profile =
    profileResult.status === "fulfilled" && !profileResult.value.error
      ? profileResult.value
      : null;

  const items =
    bazaarResult.status === "fulfilled" &&
    !bazaarResult.value.error &&
    Array.isArray(bazaarResult.value.bazaar)
      ? bazaarResult.value.bazaar
      : [];

  return { profile, items, fetchedAt, noKey: false };
}

export async function generateMetadata() {
  const { profile } = await fetchPricelistData();
  const name = profile?.name ?? "Player";
  return {
    title: `${name}'s Pricelist — TornHQ`,
    description: `Browse ${name}'s live bazaar listings on Torn City. Compare prices against market value.`,
  };
}

export default async function PricelistPage() {
  const { profile, items, fetchedAt, noKey } = await fetchPricelistData();

  const faction =
    profile?.faction && "faction_name" in profile.faction
      ? profile.faction
      : null;

  const profileUrl = profile
    ? `https://www.torn.com/profiles.php?XID=${profile.player_id}`
    : "https://www.torn.com";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/30">
                <Zap className="h-4 w-4 text-neon-cyan" />
              </div>
              <span className="font-heading text-sm font-black tracking-widest text-neon-cyan glow-cyan">
                TORNHQ
              </span>
            </Link>
            <span className="text-muted-foreground/30">/</span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <List className="h-3.5 w-3.5" />
              Pricelist
            </div>
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
            to your environment variables.
          </p>
        </div>
      )}

      {/* ── Player identity strip ────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-4">
          {profile ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neon-cyan/30 bg-neon-cyan/10">
                  <span className="font-heading text-base font-black text-neon-cyan">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-sm font-black tracking-widest text-foreground">
                      {profile.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-border font-mono text-[10px] text-muted-foreground"
                    >
                      Lv {profile.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] ${STATUS_COLOR[profile.status.state] ?? "text-muted-foreground border-border"}`}
                    >
                      <span
                        className={`mr-1 h-1.5 w-1.5 rounded-full ${STATUS_DOT[profile.status.state] ?? "bg-muted-foreground"}`}
                      />
                      {profile.status.state === "Okay"
                        ? "In Torn City"
                        : profile.status.state}
                    </Badge>
                  </div>
                  {faction && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground/60">
                      <Users className="h-2.5 w-2.5" />
                      {faction.faction_name} · {faction.position}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                View on Torn
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                <Shield className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <span className="font-heading text-sm font-bold text-muted-foreground">
                Player Pricelist
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Pricelist table ──────────────────────────────────────────── */}
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <PricelistTable
            items={items}
            playerId={profile?.player_id ?? 0}
            fetchedAt={fetchedAt}
          />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-neon-cyan" />
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
