import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** 80 req / 60s per user — safely under Torn's ~100 req/min limit */
export const tornRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, "60 s"),
  analytics: true,
  prefix: "torn:rl",
});

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl = DEFAULT_TTL,
): Promise<void> {
  await redis.setex(key, ttl, value as Parameters<typeof redis.setex>[2]);
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}

/** Canonical cache key for a Torn API response */
export function tornCacheKey(
  tornId: number,
  section: string,
  id: string,
  selections: string,
): string {
  return `torn:${tornId}:${section}:${id || "_"}:${selections}`;
}
