"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceSparkline } from "./PriceSparkline";
import { AddItemForm } from "./AddItemForm";

interface PricePoint {
  id: string;
  lowestPrice: number;
  averagePrice: number;
  volume: number;
  recordedAt: string;
}

interface MarketItem {
  id: string;
  tornItemId: number;
  name: string;
  category: string;
  priceHistory: PricePoint[];
}

interface WatchedItem {
  userId: string;
  itemId: string;
  alertBelow: number | null;
  alertAbove: number | null;
  createdAt: string;
  item: MarketItem;
}

export function WatchedItemsTable() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/market");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function removeItem(itemId: string) {
    setRemoving(itemId);
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    await fetch(`/api/market?itemId=${itemId}`, { method: "DELETE" });
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          {items.length === 0
            ? "No items tracked yet."
            : `${items.length} item${items.length !== 1 ? "s" : ""} tracked`}
        </p>
        <AddItemForm onAdded={fetchItems} />
      </div>

      {items.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">
                Item
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">
                Lowest Price
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">
                24h Trend
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-muted-foreground">
                Alert
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((wi) => {
              const prices = [...wi.item.priceHistory].reverse();
              const latest = prices.at(-1);
              const oldest = prices[0];
              const priceDelta =
                latest && oldest && prices.length > 1
                  ? ((latest.lowestPrice - oldest.lowestPrice) /
                      oldest.lowestPrice) *
                    100
                  : null;
              const belowAlert =
                wi.alertBelow !== null &&
                latest !== undefined &&
                latest.lowestPrice <= wi.alertBelow;

              const sparkColor =
                priceDelta === null
                  ? "oklch(0.55 0.04 248)"
                  : priceDelta > 0
                    ? "oklch(0.55 0.22 25)"
                    : "oklch(0.72 0.17 160)";

              return (
                <TableRow key={wi.itemId} className="border-border">
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-mono text-sm text-foreground">
                        {wi.item.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        #{wi.item.tornItemId} · {wi.item.category}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {latest ? (
                      <span
                        className={`font-mono text-sm tabular-nums ${
                          belowAlert ? "text-neon-amber" : "text-foreground"
                        }`}
                      >
                        ${latest.lowestPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        No data yet
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <PriceSparkline
                          data={prices.map((p) => ({ price: p.lowestPrice }))}
                          color={sparkColor}
                        />
                      </div>
                      {priceDelta !== null && (
                        <div
                          className={`flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${
                            priceDelta > 0.1
                              ? "text-destructive"
                              : priceDelta < -0.1
                                ? "text-neon-green"
                                : "text-muted-foreground"
                          }`}
                        >
                          {priceDelta > 0.1 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : priceDelta < -0.1 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {Math.abs(priceDelta).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {wi.alertBelow !== null && (
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tabular-nums ${
                          belowAlert
                            ? "border-neon-amber/50 text-neon-amber"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        &lt;${wi.alertBelow.toLocaleString()}
                      </Badge>
                    )}
                    {wi.alertAbove !== null && (
                      <Badge
                        variant="outline"
                        className="ml-1 border-border font-mono text-[10px] tabular-nums text-muted-foreground"
                      >
                        &gt;${wi.alertAbove.toLocaleString()}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={removing === wi.itemId}
                      onClick={() => removeItem(wi.itemId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
