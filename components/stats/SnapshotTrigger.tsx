"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SnapshotTriggerProps {
  hasRecent: boolean;
}

export function SnapshotTrigger({ hasRecent }: SnapshotTriggerProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function trigger() {
    setState("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/snapshots", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setState("error");
        setMsg(json.error ?? "Failed");
        return;
      }
      if (json.skipped) {
        setMsg("Snapshot taken recently — try again in an hour.");
        setState("idle");
        return;
      }
      setState("done");
      router.refresh();
    } catch {
      setState("error");
      setMsg("Network error");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={trigger}
        disabled={state === "loading"}
        className="border-neon-cyan/30 font-mono text-xs text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10"
      >
        {state === "loading" ? (
          <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : state === "done" ? (
          <Check className="mr-1.5 h-3.5 w-3.5" />
        ) : (
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        )}
        {state === "done" ? "Saved" : "Take Snapshot"}
      </Button>
      {msg && (
        <p className={`font-mono text-[11px] ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
