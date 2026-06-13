"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AlertRecord {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

interface UseAlertsOptions {
  unreadOnly?: boolean;
  limit?: number;
  refreshInterval?: number;
}

export function useAlerts({
  unreadOnly = false,
  limit = 50,
  refreshInterval = 60_000,
}: UseAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await fetch(`/api/alerts?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      if (isMounted.current) {
        setAlerts(json.alerts ?? []);
        setLoading(false);
      }
    } catch {
      if (isMounted.current) setLoading(false);
    }
  }, [unreadOnly, limit]);

  useEffect(() => {
    isMounted.current = true;
    fetchAlerts();
    if (refreshInterval > 0) {
      const id = setInterval(fetchAlerts, refreshInterval);
      return () => {
        isMounted.current = false;
        clearInterval(id);
      };
    }
    return () => {
      isMounted.current = false;
    };
  }, [fetchAlerts, refreshInterval]);

  const markRead = useCallback(
    async (ids: string[]) => {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setAlerts((prev) =>
        prev.map((a) =>
          ids.includes(a.id) ? { ...a, readAt: new Date().toISOString() } : a,
        ),
      );
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    const now = new Date().toISOString();
    setAlerts((prev) => prev.map((a) => ({ ...a, readAt: a.readAt ?? now })));
  }, []);

  return {
    alerts,
    loading,
    unreadCount: alerts.filter((a) => !a.readAt).length,
    refetch: fetchAlerts,
    markRead,
    markAllRead,
  };
}
