"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchResult {
  id: number;
  name: string;
  type: string;
}

interface AddItemFormProps {
  onAdded: () => void;
}

export function AddItemForm({ onAdded }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [alertBelow, setAlertBelow] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? []);
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function reset() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelected(null);
    setShowDropdown(false);
    setAlertBelow("");
    setState("idle");
    setError(null);
  }

  function selectItem(item: SearchResult) {
    setSelected(item);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tornItemId: selected.id,
          alertBelow: alertBelow ? Number(alertBelow) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setState("error");
        setError(json.error ?? "Failed");
        return;
      }
      reset();
      onAdded();
    } catch {
      setState("error");
      setError("Network error");
    }
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-neon-cyan/30 font-mono text-xs text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Item
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3"
    >
      <div className="space-y-1">
        <Label className="font-mono text-[11px] text-muted-foreground">Item Name</Label>
        <div className="relative" ref={dropdownRef}>
          {selected ? (
            <div className="flex h-8 min-w-52 items-center gap-1.5 rounded-md border border-border bg-background px-2">
              <Check className="h-3 w-3 shrink-0 text-(--neon-cyan)" />
              <span className="font-mono text-xs text-foreground">{selected.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">#{selected.id}</span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searching ? "Searching..." : "Search items..."}
                  className="h-8 w-52 pl-7 font-mono text-xs"
                  autoFocus
                />
              </div>
              {showDropdown && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg">
                  {results.length > 0 ? (
                    results.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => selectItem(r)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/40"
                      >
                        <span className="font-mono text-xs text-foreground">{r.name}</span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {r.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2">
                      <p className="font-mono text-xs text-muted-foreground">No items found</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="font-mono text-[11px] text-muted-foreground">Alert below ($)</Label>
        <Input
          type="number"
          min={0}
          value={alertBelow}
          onChange={(e) => setAlertBelow(e.target.value)}
          placeholder="optional"
          className="h-8 w-32 font-mono text-xs"
        />
      </div>

      <div className="flex gap-1.5">
        <Button
          type="submit"
          size="sm"
          disabled={state === "loading" || !selected}
          className="h-8 font-mono text-xs"
        >
          {state === "loading" ? "Adding..." : "Add"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={reset}
          className="h-8 w-8 p-0 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {error && (
        <p className="w-full font-mono text-[11px] text-destructive">{error}</p>
      )}
    </form>
  );
}
