"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, ChevronUp, ChevronDown, Eye, ShoppingBag, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  ID: number;
  name: string;
  quantity: number | null;
  type: string | null;
  market_price: number | null;
  equipped?: number | null;
}

type SortKey = "name" | "type" | "quantity" | "market_price" | "total_value";
type SortDir = "asc" | "desc";

// Torn inventory returns specific subtypes, not generic "Weapon"
const TYPE_COLORS: Record<string, string> = {
  // Melee weapons
  Melee: "border-red-800/50 text-red-400",
  Piercing: "border-red-800/50 text-red-400",
  Slashing: "border-red-800/50 text-red-400",
  Clubbing: "border-red-800/50 text-red-400",
  // Primary firearms
  Rifle: "border-red-800/50 text-red-400",
  SMG: "border-red-800/50 text-red-400",
  Shotgun: "border-red-800/50 text-red-400",
  "Machine Gun": "border-red-800/50 text-red-400",
  "Heavy Artillery": "border-red-800/50 text-red-400",
  // Secondary firearms
  Handgun: "border-orange-800/50 text-orange-400",
  Throwable: "border-orange-800/50 text-orange-400",
  // Temporary weapons
  Temporary: "border-amber-800/50 text-(--neon-amber)",
  // Defensive / Armor
  Defensive: "border-blue-800/50 text-blue-400",
  Armor: "border-blue-800/50 text-blue-400",
  // Consumables
  Drug: "border-purple-800/50 text-purple-400",
  Booster: "border-purple-800/50 text-purple-400",
  Alcohol: "border-purple-800/50 text-purple-400",
  "Energy Drink": "border-purple-800/50 text-purple-400",
  Medical: "border-green-800/50 text-green-400",
  Enhancer: "border-green-800/50 text-green-400",
  Candy: "border-pink-800/50 text-pink-400",
  // Clothing / Wearables
  Clothing: "border-border text-muted-foreground",
  Jewelry: "border-border text-muted-foreground",
  // Collectibles / Valuables
  Collectible: "border-cyan-800/50 text-(--neon-cyan)",
  Plushie: "border-cyan-800/50 text-(--neon-cyan)",
  Flower: "border-cyan-800/50 text-(--neon-cyan)",
  // Misc
  Electronics: "border-violet-800/50 text-violet-400",
  Special: "border-amber-800/50 text-(--neon-amber)",
  Book: "border-amber-800/50 text-(--neon-amber)",
  "Supply Pack": "border-amber-800/50 text-(--neon-amber)",
  Material: "border-border text-muted-foreground",
  Car: "border-border text-muted-foreground",
  Key: "border-border text-muted-foreground",
};

function typeColor(type: string | null) {
  return TYPE_COLORS[type ?? ""] ?? "border-border text-muted-foreground";
}

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyNeedsUpdate, setKeyNeedsUpdate] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [watching, setWatching] = useState<Set<number>>(new Set());
  const [watched, setWatched] = useState<Set<number>>(new Set());

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setKeyNeedsUpdate(false);
    try {
      const res = await fetch("/api/inventory");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body.errorCode === "KEY_NEEDS_UPDATE") {
          setKeyNeedsUpdate(true);
        } else {
          setError(body.error ?? `HTTP ${res.status}`);
        }
        return;
      }
      const raw = body.items;
      setItems(Array.isArray(raw) ? raw : raw != null ? Object.values(raw) : []);
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  async function watchPrice(item: InventoryItem) {
    setWatching((prev) => new Set(prev).add(item.ID));
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tornItemId: item.ID }),
      });
      if (res.ok || res.status === 409) {
        setWatched((prev) => new Set(prev).add(item.ID));
      }
    } finally {
      setWatching((prev) => {
        const next = new Set(prev);
        next.delete(item.ID);
        return next;
      });
    }
  }

  const filtered = items
    .filter((i) => i && typeof i.name === "string")
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name": return (a.name ?? "").localeCompare(b.name ?? "") * dir;
        case "type": return (a.type ?? "").localeCompare(b.type ?? "") * dir;
        case "quantity": return ((a.quantity ?? 0) - (b.quantity ?? 0)) * dir;
        case "market_price": return ((a.market_price ?? 0) - (b.market_price ?? 0)) * dir;
        case "total_value": return ((a.market_price ?? 0) * (a.quantity ?? 0) - (b.market_price ?? 0) * (b.quantity ?? 0)) * dir;
        default: return 0;
      }
    });

  const totalQty = filtered.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const totalValue = filtered.reduce((s, i) => s + (i.market_price ?? 0) * (i.quantity ?? 0), 0);

  function SortHeader({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort.key === sortKey;
    return (
      <button
        onClick={() => toggleSort(sortKey)}
        className="flex items-center gap-1 font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        {active ? (
          sort.dir === "asc"
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (keyNeedsUpdate) {
    return (
      <div className="rounded-md border border-amber-800/50 bg-amber-950/20 px-5 py-4 space-y-2">
        <p className="font-mono text-sm font-semibold text-(--neon-amber)">API key needs update</p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Torn moved inventory data to API v2, which requires a new permission not present on old
          Full Access keys. You need to generate a fresh key at Torn.
        </p>
        <ol className="font-mono text-xs text-muted-foreground list-decimal list-inside space-y-1">
          <li>
            Go to{" "}
            <a
              href="https://www.torn.com/preferences.php#tab=api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--neon-cyan) underline underline-offset-2"
            >
              torn.com → Preferences → API
            </a>
          </li>
          <li>Generate a new key — select <span className="text-foreground">Full Access</span></li>
          <li>
            Copy the new key and paste it in{" "}
            <a href="/dashboard/settings" className="text-(--neon-cyan) underline underline-offset-2">
              TornHQ Settings
            </a>
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-xs font-mono text-xs"
        />
        <button
          onClick={fetchItems}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-(--neon-cyan) transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
        <p className="ml-auto font-mono text-xs text-muted-foreground">
          {filtered.length} items · {totalQty.toLocaleString()} qty · ~${totalValue.toLocaleString()} value
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center font-mono text-sm text-muted-foreground">
          {search ? "No items match your search." : "Your inventory is empty."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>
                <SortHeader label="Name" sortKey="name" />
              </TableHead>
              <TableHead>
                <SortHeader label="Type" sortKey="type" />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Qty" sortKey="quantity" />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Market Price" sortKey="market_price" />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label="Total Value" sortKey="total_value" />
              </TableHead>
              <TableHead className="w-20 text-right">
                <span className="font-mono text-xs uppercase text-muted-foreground">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const totalVal = (item.market_price ?? 0) * (item.quantity ?? 0);
              const isWatched = watched.has(item.ID);
              const isWatching = watching.has(item.ID);

              return (
                <TableRow key={item.ID} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-foreground">{item.name}</p>
                      {!!item.equipped && (
                        <Badge
                          variant="outline"
                          className="border-(--neon-cyan)/40 text-(--neon-cyan) text-[9px] px-1 py-0"
                        >
                          Equipped
                        </Badge>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">ID #{item.ID}</p>
                  </TableCell>

                  <TableCell>
                    {item.type ? (
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${typeColor(item.type)}`}
                      >
                        {item.type}
                      </Badge>
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {(item.quantity ?? 0).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {(item.market_price ?? 0) > 0 ? `$${item.market_price!.toLocaleString()}` : "—"}
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums text-(--neon-green)">
                    {totalVal > 0 ? `$${totalVal.toLocaleString()}` : "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-7 w-7 ${
                          isWatched
                            ? "text-(--neon-cyan)"
                            : "text-muted-foreground hover:text-(--neon-cyan)"
                        }`}
                        disabled={isWatching || isWatched}
                        onClick={() => watchPrice(item)}
                        title={isWatched ? "Watching price" : "Watch price"}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-(--neon-amber)"
                        title="Manage in Bazaar"
                        asChild
                      >
                        <a
                          href="https://www.torn.com/bazaar.php"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
