"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ShoppingCart, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TornBazaarItem } from "@/lib/torn-api";

interface Props {
  items: TornBazaarItem[];
  playerId: number;
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

export function BazaarGrid({ items, playerId }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [dir, setDir] = useState<SortDir>("asc");

  const categories = useMemo(() => {
    const types = Array.from(new Set(items.map((i) => i.type))).sort();
    return ["All", ...types];
  }, [items]);

  const visible = useMemo(() => {
    let list = items.filter((i) => {
      const matchQuery = i.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "All" || i.type === category;
      return matchQuery && matchCat;
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
  }, [items, query, category, sort, dir]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir("asc");
    }
  }

  const tradeUrl = `https://www.torn.com/trade.php#step=initiate&type=0&to=${playerId}`;
  const bazaarUrl = `https://www.torn.com/profiles.php?XID=${playerId}`;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-border bg-card pl-9 font-mono text-xs placeholder:text-muted-foreground/50 focus-visible:ring-neon-cyan/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded px-2.5 py-1 font-mono text-[10px] tracking-wide transition-colors ${
                category === cat
                  ? "bg-neon-cyan/15 text-neon-cyan ring-1 ring-neon-cyan/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        <span className="mr-2 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          Sort:
        </span>
        {(["name", "price", "quantity", "delta"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={`flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
              sort === key
                ? "text-neon-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key === "delta" ? "vs Market" : key.charAt(0).toUpperCase() + key.slice(1)}
            {sort === key && (
              <ArrowUpDown className="h-2.5 w-2.5" />
            )}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
          {visible.length} item{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card">
          <p className="font-mono text-sm text-muted-foreground">
            {items.length === 0 ? "Bazaar is currently empty." : "No items match your search."}
          </p>
        </div>
      )}

      {/* Item grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((item) => {
          const delta = priceDelta(item);
          const isBelow = delta < -1;
          const isAbove = delta > 1;

          return (
            <div
              key={item.ID}
              className="group flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-neon-cyan/30"
            >
              {/* Item image */}
              <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-t-xl bg-muted/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.torn.com/images/items/${item.ID}/large.png`}
                  alt={item.name}
                  className="h-20 w-20 object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute right-2 top-2">
                  <Badge
                    variant="outline"
                    className="border-border bg-background/80 font-mono text-[9px] text-muted-foreground/70 backdrop-blur-sm"
                  >
                    {item.type}
                  </Badge>
                </div>
              </div>

              {/* Item info */}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div>
                  <p className="font-heading text-xs font-bold tracking-wide text-foreground line-clamp-2">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="mt-auto space-y-1">
                  <p className="font-heading text-sm font-black text-neon-cyan">
                    ${fmt(item.price)}
                  </p>
                  {item.market_price > 0 && (
                    <div className="flex items-center gap-1">
                      {isBelow ? (
                        <TrendingDown className="h-3 w-3 text-neon-green" />
                      ) : isAbove ? (
                        <TrendingUp className="h-3 w-3 text-destructive" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground/50" />
                      )}
                      <span
                        className={`font-mono text-[10px] ${
                          isBelow
                            ? "text-neon-green"
                            : isAbove
                              ? "text-destructive"
                              : "text-muted-foreground/50"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)}% vs market (${fmt(item.market_price)})
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={bazaarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1.5 font-mono text-xs text-neon-cyan transition-colors hover:bg-neon-cyan/15"
                >
                  <ShoppingCart className="h-3 w-3" />
                  Buy in Torn
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade CTA */}
      {items.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-4 text-center sm:flex-row sm:justify-center">
          <p className="font-mono text-xs text-muted-foreground">
            Want to buy multiple items or make an offer?
          </p>
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-neon-amber underline-offset-2 hover:underline"
          >
            Send a trade request →
          </a>
        </div>
      )}
    </div>
  );
}
