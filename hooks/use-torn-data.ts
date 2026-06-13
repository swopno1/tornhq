"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTornDataOptions {
  refreshInterval?: number;
  id?: string;
}

interface UseTornDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTornData<T>(
  section: string,
  selections: string,
  options: UseTornDataOptions = {},
): UseTornDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ section, selections });
      if (options.id) params.set("id", options.id);
      const res = await fetch(`/api/torn?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.error ?? "Torn API error");
      if (isMounted.current) {
        setData(json);
        setError(null);
      }
    } catch (e) {
      if (isMounted.current)
        setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [section, selections, options.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    if (options.refreshInterval) {
      const id = setInterval(fetchData, options.refreshInterval);
      return () => {
        clearInterval(id);
        isMounted.current = false;
      };
    }
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, options.refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
