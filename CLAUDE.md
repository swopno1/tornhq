@AGENTS.md

# TornHQ — Claude Code Context

## Project Overview

**TornHQ** is a dark-mode, cyberpunk-aesthetic companion web app for [Torn City](https://www.torn.com) players.
GitHub: https://github.com/swopno1/tornhq
Working directory: `/Users/mdamirhossain/ViveScript-Solutions/projects/torn-city`

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + TypeScript (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui (radix-sera style, `taupe` base color) |
| ORM | **Prisma 7** — generated client at `lib/generated/prisma/client` |
| Database | `prisma+postgres://` (local Prisma Postgres via `npx prisma dev`) |
| Cache | Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`) |
| Auth | NextAuth v4 — credentials provider + JWT, no Prisma adapter |
| Background jobs | Inngest (`inngest` package, not yet wired) |
| Icons | Lucide React |

## Critical Prisma 7 Notes

- Generator: `provider = "prisma-client"` (not `prisma-client-js`)
- Output: `../lib/generated/prisma` — import from `@/lib/generated/prisma/client`
- Constructor **requires** either `{ accelerateUrl }` or `{ adapter }` — no empty `new PrismaClient()`
- Config lives in `prisma.config.ts` (not `schema.prisma` datasource)
- Local dev: run `npx prisma dev` to start the local Postgres proxy
- After schema changes: `npx prisma generate` then `npx prisma db push`

## Auth Flow

1. User enters Torn API key on `/login`
2. NextAuth credentials provider calls `/user?selections=basic` on Torn API to validate
3. On success: AES-256-GCM encrypts key, upserts `User` record (tornId + apiKeyEnc)
4. JWT contains `{ userId, tornId }` — session type extended in `types/next-auth.d.ts`
5. All Torn API calls go through `/api/torn` server-side proxy (Redis cached, rate-limited)

## Key Files

```
lib/auth.ts          NextAuth options (credentials, JWT callbacks)
lib/crypto.ts        AES-256-GCM encrypt/decrypt for API keys
lib/cache.ts         Upstash Redis helpers + sliding-window rate limiter
lib/torn-api.ts      Typed Torn API client (callTornApi, validateApiKey)
lib/db.ts            Prisma singleton (accelerateUrl constructor)
types/next-auth.d.ts Session type: adds tornId + userId
app/api/torn/route.ts  Torn API proxy: auth check → rate limit → cache → fetch
```

## Design Tokens

- **Style**: OLED black dark mode, cyberpunk/tactical aesthetic — dark-only app
- **Fonts**: Orbitron (headings, `font-heading`), JetBrains Mono (body, `font-sans`)
- **Neon tokens**: `--neon-cyan`, `--neon-green`, `--neon-amber` (defined in globals.css)
- **Glow utilities**: `.glow-cyan`, `.glow-amber`, `.glow-green`, `.glow-red`
- **Card effects**: `.card-glow`, `.card-glow-cyan`
- **Background**: `.grid-bg` (subtle dot/line grid for auth pages)
- `dark` class is hardcoded on `<html>` in `app/layout.tsx`

## URL Structure

```
/              → redirect to /dashboard or /login
/login         → app/(auth)/login/page.tsx
/dashboard     → app/(dashboard)/dashboard/page.tsx  (auth-guarded)
/stats         → app/(dashboard)/stats/page.tsx
/market        → app/(dashboard)/market/page.tsx
/faction       → app/(dashboard)/faction/page.tsx
/travel        → app/(dashboard)/travel/page.tsx
/settings      → app/(dashboard)/settings/page.tsx
/alerts        → app/(dashboard)/alerts/page.tsx
```

## shadcn/ui Components Installed

badge, button, card, input, progress, separator, sheet, sidebar, skeleton, table, tooltip,
label, avatar, dropdown-menu

## Environment Variables (`.env.local`)

```
NEXTAUTH_SECRET            # openssl rand -hex 32
NEXTAUTH_URL               # http://localhost:3000
API_KEY_ENCRYPTION_SECRET  # openssl rand -hex 32  (must be 64 hex chars)
TORN_API_BASE              # https://api.torn.com
DATABASE_URL               # prisma+postgres://... (from .env via prisma.config.ts)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
INNGEST_EVENT_KEY          # optional until Week 3
INNGEST_SIGNING_KEY        # optional until Week 3
```

## Dev Roadmap

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundation: auth, theme, API proxy, layout shell | ✅ Complete |
| 2 | Core Dashboard: stat bars, cooldown timers, stat growth chart | ⏳ Next |
| 3 | Market + Notifications: price tracker, alerts, notification drawer | ⏳ Pending |
| 4 | Faction + Polish: member activity, responsiveness, skeletons | ⏳ Pending |

## Coding Conventions

- Server components by default; add `"use client"` only when needed (hooks, interactivity)
- Zod v4 is installed (`zod@^4.4.3`) — some APIs differ from v3
- `@t3-oss/env-nextjs` is installed but not yet wired — use `process.env.*` directly for now
- No comments unless the WHY is non-obvious
- No emojis in code/UI — SVG icons (Lucide) only
