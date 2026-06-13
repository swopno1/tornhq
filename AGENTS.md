<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# TornHQ — Agent Context

## What this project is

**TornHQ** is a Next.js 16 + TypeScript companion web app for the browser game [Torn City](https://www.torn.com).
GitHub: https://github.com/swopno1/tornhq

It provides players with analytics dashboards, market price tracking, faction management tools, and custom alerts — all powered by the Torn public REST API.

## Quick-start commands

```bash
npx prisma dev          # Start local Prisma Postgres proxy (required for DB)
npx prisma generate     # Regenerate Prisma client after schema changes
npx prisma db push      # Push schema changes to local DB
npm run dev             # Start Next.js dev server on :3000
```

## Architecture snapshot

```
Browser → /api/torn (Next.js route)
              ↓                 ↓
         Redis cache       Torn API (rate-limited)
              ↓
         Prisma ORM → PostgreSQL (prisma+postgres://)

Inngest cron (0 */6 * * *) → /api/inngest → takeStatSnapshot
              ↓ (all users)
         decrypt key → callTornApi(battlestats,profile) → StatSnapshot
```

## Prisma 7 — critical differences from Prisma 5/6

| Topic | Detail |
|-------|--------|
| Generator provider | `"prisma-client"` not `"prisma-client-js"` |
| Import path | `@/lib/generated/prisma/client` (no barrel index.ts) |
| Constructor | **Requires** `{ accelerateUrl: string }` or `{ adapter }` — never `new PrismaClient()` |
| Config | `prisma.config.ts` owns the DB URL — `schema.prisma` datasource has no `url` field |
| Models generated | `lib/generated/prisma/models/` (one file per model) |

## Auth architecture

- **Provider**: NextAuth v4 credentials (`next-auth/providers/credentials`)
- **Session strategy**: JWT (no DB sessions, no Prisma adapter)
- **Key security**: Torn API key encrypted with AES-256-GCM before DB storage; decrypted only inside API route handler
- **Types**: `types/next-auth.d.ts` extends session with `{ userId: string; tornId: number }`

## Tailwind v4 + shadcn notes

- Import order in `globals.css`: `tailwindcss` → `tw-animate-css` → `shadcn/tailwind.css`
- Custom dark variant: `@custom-variant dark (&:is(.dark *))` — `.dark` class on `<html>`
- Design tokens defined in `globals.css` `:root` block (OLED dark — both `:root` and `.dark` have identical cyberpunk values)
- Custom utilities: `.glow-cyan`, `.glow-amber`, `.card-glow`, `.card-glow-cyan`, `.grid-bg`
- Never use `@tailwind base/components/utilities` — Tailwind v4 uses `@import "tailwindcss"` only

## File conventions

- All page components in `app/(dashboard)/[section]/page.tsx` are **server components**
- Client components (`"use client"`) live under `components/` and only where hooks are needed
- Layout hierarchy: `app/layout.tsx` (root, dark class, fonts) → `app/(dashboard)/layout.tsx` (auth guard, SidebarProvider, Providers) → page
- `SidebarProvider` + `SidebarInset` wraps all dashboard pages; sidebar toggle uses `SidebarTrigger` in Topbar
- Session access: server components use `getServerSession(authOptions)`; client components use `useSession()`

## Hooks

| Hook | Signature | Purpose |
|------|-----------|---------|
| `useCountdown` | `(unixTimestamp: number \| null \| undefined) → number` | Counts down from a Unix epoch timestamp, 1-second interval. Returns seconds remaining. |
| `formatDuration` | `(seconds: number) → string` | "Xh Ym" / "Xm Ys" / "Xs" / "Ready" |
| `useTornData<T>` | `(section, selections, opts?) → { data, loading, error, refetch }` | Fetches `/api/torn`, optional `refreshInterval` (ms), cleans up on unmount. |

## Dashboard components (Week 2)

| Component | File | Notes |
|-----------|------|-------|
| `StatBar` | `components/dashboard/StatBar.tsx` | Shows Energy/Nerve/Happy/Life. Takes `bar: TornBar` + `color` prop. Live "+1 in Xs" and "Full in Xh Ym" via `useCountdown`. |
| `CooldownCard` | `components/dashboard/CooldownCard.tsx` | Drug/booster/medical seconds→expiry timestamp. Hospital/jail state from `status.until`. |
| `TravelStatus` | `components/dashboard/TravelStatus.tsx` | Hidden when `status.state === "Okay"`. Shows destination + countdown when traveling/abroad. |
| `DashboardClient` | `components/dashboard/DashboardClient.tsx` | `"use client"`, fetches `user/basic`, 60s auto-refresh. Renders skeleton on load, error panel on failure. |

## Stats components (Week 2)

| Component | File | Notes |
|-----------|------|-------|
| `StatGrowthChart` | `components/stats/StatGrowthChart.tsx` | `"use client"`, Recharts `ResponsiveContainer + LineChart`, 4 lines. Sorted ascending by `takenAt`. |
| `SnapshotTable` | `components/stats/SnapshotTable.tsx` | Server component (no `"use client"`). Color-coded stat columns, `tabular-nums`. |
| `SnapshotTrigger` | `components/stats/SnapshotTrigger.tsx` | `"use client"`, POST `/api/snapshots`, handles `skipped` JSON. Calls `router.refresh()` on success. |

## Inngest (Week 2)

- `inngest/client.ts` — `new Inngest({ id: "tornhq" })`
- `inngest/functions.ts` — `takeStatSnapshot`: `triggers: [{ cron: "0 */6 * * *" }]`; 2-arg v4 API (`createFunction(config, handler)`)
- `app/api/inngest/route.ts` — `serve({ client: inngest, functions: [takeStatSnapshot] })`, exports GET/POST/PUT
- **Inngest v4 breaking change**: `createFunction` takes 2 args; triggers go inside the first config object (not a 3rd arg as in v3)

## Do not

- Use `new PrismaClient()` without `{ accelerateUrl }` — it will throw a TS error
- Import Prisma from `@/lib/generated/prisma` (no barrel) — use `@/lib/generated/prisma/client`
- Add `url = env("DATABASE_URL")` to `schema.prisma` datasource — it is in `prisma.config.ts`
- Use `@tailwind` directives — this is Tailwind v4
- Use emojis as icons — use Lucide React SVGs
- Call Torn API directly from the browser — always go through `/api/torn`
- Expose `apiKeyEnc` or the decrypted API key in any response or log
- Use Inngest v3 3-arg `createFunction(opts, trigger, handler)` — v4 uses 2 args with triggers in config
- Use Recharts `Tooltip.formatter` with `value.toLocaleString()` directly — value is a union type; guard with `typeof value === "number"` first

## Torn API

- Base URL: `https://api.torn.com`
- Rate limit: ~100 req/min per key — our proxy enforces 80/60s via Upstash sliding window
- Cache TTL: 5 minutes (Redis)
- Proxy route: `GET /api/torn?section=user&selections=basic,profile&id=`
- Types: see `lib/torn-api.ts` for `TornUserBasic`, `TornBar`, `TornStatus`, etc.
