"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TornBazaarItem } from "@/lib/torn-api";

interface Props {
  items: TornBazaarItem[];
  playerId: number;
  fetchedAt: number;
}

type SortKey = "name" | "price" | "quantity" | "delta";
type SortDir = "asc" | "desc";

function priceDelta(item: TornBazaarItem): number {
  if (!item.market_price || item.market_price === 0) return 0;
  return ((item.price - item.market_price) / item.market_price) * 100;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function useAgeLabel(fetchedAt: number): string {
  const [label, setLabel] = useState(() => {
    const secs = Math.floor((Date.now() - fetchedAt) / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    return `${mins}m ago`;
  });

  useEffect(() => {
    const tick = () => {
      const secs = Math.floor((Date.now() - fetchedAt) / 1000);
      if (secs < 60) setLabel("just now");
      else setLabel(`${Math.floor(secs / 60)}m ago`);
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  return label;
}

export function PricelistTable({ items, playerId, fetchedAt }: Props) {
  const [query, setQuery] = useState("");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("delta");
  const [dir, setDir] = useState<SortDir>("asc");

  const ageLabel = useAgeLabel(fetchedAt);

  const tradeUrl = `https://www.torn.com/trade.php#step=initiate&type=0&to=${playerId}`;
  const bazaarUrl = `https://www.torn.com/profiles.php?XID=${playerId}`;

  const visible = useMemo(() => {
    let list = items.filter((i) => {
      if (!i.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (dealsOnly && priceDelta(i) >= -1) return false;
      return true;
    });

    list = list.sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "price") cmp = a.price - b.price;
      else if (sort === "quantity") cmp = a.quantity - b.quantity;
      else if (sort === "delta") cmp = priceDelta(a) - priceDelta(b);
      return dir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [items, query, dealsOnly, sort, dir]);

  const totalValue = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items],
  );

  const dealsCount = useMemo(
    () => items.filter((i) => priceDelta(i) < -1).length,
    [items],
  );

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sort !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return dir === "asc"
      ? <ArrowUp className="h-3 w-3 text-neon-cyan" />
      : <ArrowDown className="h-3 w-3 text-neon-cyan" />;
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground">{items.length}</span> items listed
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          Total value{" "}
          <span className="text-neon-cyan">${fmt(totalValue)}</span>
        </span>
        {dealsCount > 0 && (
          <span className="font-mono text-xs text-neon-green">
            {dealsCount} below market
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50">
          <Zap className="h-2.5 w-2.5" />
          Updated {ageLabel}
        </span>
      </div>

      {/* Search + deals toggle */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-border bg-card pl-9 font-mono text-xs placeholder:text-muted-foreground/50 focus-visible:ring-neon-cyan/30"
          />
        </div>
        <button
          onClick={() => setDealsOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded px-3 py-2 font-mono text-xs transition-colors ${
            dealsOnly
              ? "bg-neon-green/15 text-neon-green ring-1 ring-neon-green/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingDown className="h-3.5 w-3.5" />
          Deals only
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Item
                </span>
              </th>
              {(
                [
                  ["quantity", "Qty"],
                  ["price", "Price"],
                  ["delta", "vs Market"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th key={key} className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground"
                  >
                    {label}
                    <SortIcon col={key} />
                  </button>
                </th>
              ))}
              <th className="w-20 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-mono text-sm text-muted-foreground"
                >
                  {items.length === 0
                    ? "Bazaar is currently empty."
                    : "No items match your filters."}
                </td>
              </tr>
            ) : (
              visible.map((item) => {
                const delta = priceDelta(item);
                const isBelow = delta < -1;
                const isAbove = delta > 1;

                return (
                  <tr
                    key={item.ID}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.torn.com/images/items/${item.ID}/large.png`}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 shrink-0 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                          }}
                        />
                        <div>
                          <p className="font-heading text-xs font-bold tracking-wide text-foreground">
                            {item.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-0.5 border-border px-1 py-0 font-mono text-[9px] text-muted-foreground/60"
                          >
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {fmt(item.quantity)}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-heading text-sm font-black text-neon-cyan">
                        ${fmt(item.price)}
                      </span>
                    </td>

                    {/* vs Market */}
                    <td className="px-4 py-3 text-right">
                      {item.market_price > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span
                            className={`flex items-center gap-1 font-mono text-xs font-bold ${
                              isBelow
                                ? "text-neon-green"
                                : isAbove
                                  ? "text-destructive"
                                  : "text-muted-foreground/50"
                            }`}
                          >
                            {isBelow ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : isAbove ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {delta > 0 ? "+" : ""}
                            {delta.toFixed(1)}%
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground/40">
                            TMV ${fmt(item.market_price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground/30">
                          —
                        </span>
                      )}
                    </td>

                    {/* Buy */}
                    <td className="px-4 py-3 text-right">
                      <a
                        href={bazaarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-neon-cyan/25 bg-neon-cyan/5 px-2.5 py-1 font-mono text-[10px] text-neon-cyan transition-colors hover:bg-neon-cyan/15"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Buy
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Trade CTA */}
      {items.length > 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-4 text-center sm:flex-row sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Want multiple items or not in my bazaar?
          </p>
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-bold text-neon-amber underline-offset-2 hover:underline"
          >
            Send a trade request →
          </a>
        </div>
      )}
    </div>
  );
}
