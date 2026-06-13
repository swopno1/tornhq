import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: IORedis | undefined };

function createClient() {
  return new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: 3 });
}

export const redis = globalForRedis.redis ?? createClient();
if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Atomic sliding window rate limiter using a sorted-set Lua script
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])
redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
redis.call('ZADD', key, now, tostring(now))
redis.call('EXPIRE', key, ttl)
local count = redis.call('ZCARD', key)
if count <= limit then
  return {1, limit - count}
else
  return {0, 0}
end
`;

const RL_LIMIT = 80;
const RL_WINDOW_MS = 60_000;

/** 80 req / 60s per user — safely under Torn's ~100 req/min limit */
export const tornRatelimit = {
  async limit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const key = `torn:rl:${identifier}`;
    const now = Date.now();
    const windowStart = now - RL_WINDOW_MS;
    const ttl = Math.ceil(RL_WINDOW_MS / 1000) + 1;

    const result = (await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      1,
      key,
      now.toString(),
      windowStart.toString(),
      RL_LIMIT.toString(),
      ttl.toString(),
    )) as [number, number];

    return { success: result[0] === 1, remaining: result[1] };
  },
};

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl = DEFAULT_TTL,
): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
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
