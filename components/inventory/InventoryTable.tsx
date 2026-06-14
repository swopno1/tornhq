"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Info, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  TornV2EquipmentItem,
  TornV2ClothingItem,
  TornV2AmmoItem,
  TornV2BazaarItem,
} from "@/lib/torn-api";

const WEAPON_SLOT: Record<number, string> = {
  1: "Primary",
  2: "Secondary",
  3: "Melee",
  5: "Temporary",
};

const ARMOR_SLOT: Record<number, string> = {
  4: "Body",
  6: "Head",
  7: "Legs",
  8: "Feet",
  9: "Hands",
};

function qualityColor(q: number | null): string {
  if (q == null) return "text-muted-foreground";
  if (q >= 90) return "text-(--neon-cyan)";
  if (q >= 70) return "text-(--neon-green)";
  if (q >= 50) return "text-(--neon-amber)";
  if (q >= 30) return "text-orange-400";
  return "text-red-400";
}

function WeaponCard({ item }: { item: TornV2EquipmentItem }) {
  const slot = WEAPON_SLOT[item.slot] ?? `Slot ${item.slot}`;
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-foreground truncate">{item.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{slot} · #{item.id}</p>
        </div>
        {item.sub_type && (
          <Badge variant="outline" className="shrink-0 font-mono text-[10px] border-red-800/50 text-red-400">
            {item.sub_type}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Damage</p>
          <p className="font-mono text-sm font-bold text-(--neon-amber)">
            {item.stats.damage != null ? item.stats.damage.toFixed(1) : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Accuracy</p>
          <p className="font-mono text-sm font-bold text-(--neon-cyan)">
            {item.stats.accuracy != null ? item.stats.accuracy.toFixed(1) : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Quality</p>
          <p className={`font-mono text-sm font-bold ${qualityColor(item.stats.quality)}`}>
            {item.stats.quality != null ? item.stats.quality.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {item.ammo && (
        <div className="rounded border border-border/40 bg-muted/10 px-2 py-1.5">
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-foreground/60">Ammo:</span>{" "}
            {item.ammo.name} · {item.ammo.type} ·{" "}
            <span className="text-(--neon-green)">{item.ammo.quantity.toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function ArmorCard({ item }: { item: TornV2EquipmentItem }) {
  const slot = ARMOR_SLOT[item.slot] ?? `Slot ${item.slot}`;
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-foreground truncate">{item.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{slot} · #{item.id}</p>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono text-[10px] border-blue-800/50 text-blue-400">
          Armor
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Armor</p>
          <p className="font-mono text-sm font-bold text-blue-400">
            {item.stats.armor != null ? `${item.stats.armor.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Quality</p>
          <p className={`font-mono text-sm font-bold ${qualityColor(item.stats.quality)}`}>
            {item.stats.quality != null ? item.stats.quality.toFixed(1) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface InventoryData {
  equipment: TornV2EquipmentItem[];
  clothing: TornV2ClothingItem[];
  ammo: TornV2AmmoItem[];
  bazaar: TornV2BazaarItem[];
  bazaarOpen: boolean | null;
}

export function InventoryTable() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      setData(body);
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-800 bg-red-950/30 px-4 py-3 font-mono text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const weapons = data.equipment
    .filter((e) => e.type === "Weapon")
    .sort((a, b) => a.slot - b.slot);

  const armor = data.equipment
    .filter((e) => e.type === "Armor")
    .sort((a, b) => a.slot - b.slot);

  const totalAmmoQty = data.ammo.reduce(
    (sum, a) => sum + a.types.reduce((s, t) => s + t.quantity, 0),
    0,
  );

  return (
    <div className="space-y-7">
      {/* API notice */}
      <div className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Torn&apos;s API does not expose your full item inventory (the v2 endpoint requires a permission
          Torn hasn&apos;t released publicly). This page shows your <span className="text-foreground/70">equipped loadout</span>,{" "}
          <span className="text-foreground/70">ammo</span>, and <span className="text-foreground/70">bazaar listings</span>.
        </p>
      </div>

      {/* Refresh */}
      <div className="flex items-center justify-end">
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-(--neon-cyan) transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Weapons */}
      {weapons.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Weapons
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {weapons.map((item) => (
              <WeaponCard key={item.uid} item={item} />
            ))}
          </div>
        </section>
      )}

      {weapons.length > 0 && armor.length > 0 && <Separator className="border-border/40" />}

      {/* Armor */}
      {armor.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Armor
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {armor.map((item) => (
              <ArmorCard key={item.uid} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Clothing */}
      {data.clothing.length > 0 && (
        <>
          <Separator className="border-border/40" />
          <section className="space-y-3">
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Clothing
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.clothing.map((item) => (
                <div
                  key={item.uid}
                  className="rounded-md border border-border bg-background/40 px-3 py-2"
                >
                  <p className="font-mono text-xs text-foreground">{item.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {item.type} · #{item.id}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Ammo */}
      {data.ammo.length > 0 && (
        <>
          <Separator className="border-border/40" />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Ammo
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">
                {totalAmmoQty.toLocaleString()} total rounds
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground">Name</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground">Type</TableHead>
                  <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground">Qty</TableHead>
                  <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ammo.flatMap((ammo) =>
                  ammo.types.map((t, i) => (
                    <TableRow key={`${ammo.id}-${i}`} className="border-border">
                      <TableCell className="font-mono text-xs text-foreground">
                        {i === 0 ? ammo.name : ""}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{t.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-(--neon-green)">
                        {t.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {t.equipped ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-[9px] border-(--neon-cyan)/40 text-(--neon-cyan)"
                          >
                            Loaded
                          </Badge>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </section>
        </>
      )}

      {/* Bazaar */}
      <Separator className="border-border/40" />
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Bazaar
          </h3>
          {data.bazaarOpen != null && (
            <Badge
              variant="outline"
              className={`font-mono text-[9px] ${
                data.bazaarOpen
                  ? "border-(--neon-green)/40 text-(--neon-green)"
                  : "border-border text-muted-foreground"
              }`}
            >
              {data.bazaarOpen ? "Open" : "Closed"}
            </Badge>
          )}
        </div>

        {data.bazaar.length === 0 ? (
          <div className="flex items-center gap-2 py-4 font-mono text-sm text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            No items currently listed in your bazaar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-muted-foreground">Item</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-muted-foreground">Type</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground">Qty</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground">Your Price</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground">Market</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bazaar.map((item) => {
                const diff =
                  item.market_price > 0
                    ? ((item.price - item.market_price) / item.market_price) * 100
                    : null;
                return (
                  <TableRow key={item.id} className="border-border">
                    <TableCell>
                      <p className="font-mono text-xs text-foreground">{item.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">#{item.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums text-(--neon-amber)">
                      ${item.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
                        ${item.market_price.toLocaleString()}
                      </p>
                      {diff != null && (
                        <p
                          className={`font-mono text-[10px] tabular-nums ${
                            diff <= 0 ? "text-(--neon-green)" : "text-red-400"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(1)}%
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
