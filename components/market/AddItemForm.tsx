"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddItemFormProps {
  onAdded: () => void;
}

export function AddItemForm({ onAdded }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  const [tornItemId, setTornItemId] = useState("");
  const [alertBelow, setAlertBelow] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setTornItemId("");
    setAlertBelow("");
    setState("idle");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tornItemId: Number(tornItemId),
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
        <Label className="font-mono text-[11px] text-muted-foreground">
          Torn Item ID
        </Label>
        <Input
          type="number"
          min={1}
          value={tornItemId}
          onChange={(e) => setTornItemId(e.target.value)}
          placeholder="e.g. 180"
          className="h-8 w-28 font-mono text-xs"
          required
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label className="font-mono text-[11px] text-muted-foreground">
          Alert below ($)
        </Label>
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
          disabled={state === "loading" || !tornItemId}
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
