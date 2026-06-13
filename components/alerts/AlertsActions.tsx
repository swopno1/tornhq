"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertsActions({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!hasUnread) return null;

  async function markAll() {
    setLoading(true);
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={markAll}
      disabled={loading}
      className="border-border font-mono text-xs text-muted-foreground hover:text-foreground"
    >
      <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
      {loading ? "Marking..." : "Mark all read"}
    </Button>
  );
}
