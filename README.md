# TornHQ

> **GitHub:** https://github.com/swopno1/tornhq

A dark-mode, cyberpunk-aesthetic web application that enhances the experience of [Torn](https://www.torn.com) players — providing advanced analytics, planning tools, and quality-of-life features through the Torn public API.

---

## Features

### MVP (Week 1–4)
- **Secure API key auth** — AES-256-GCM encrypted storage, never exposed client-side
- **Player dashboard** — Energy, Nerve, Happiness, Life bars with live countdowns
- **Stat history** — Periodic snapshots with growth charts (Strength, Defense, Speed, Dexterity)
- **Market tracker** — Watch items, view price history, get price alerts
- **Custom notifications** — Energy ready, travel landed, chain active, price threshold alerts
- **Faction overview** — Member activity, last-action status, chain participation

### Phase 2
- Crime profit calculator & risk/reward analysis
- Market arbitrage finder
- Attack log analysis
- Training ROI optimizer
- Faction war preparation tools

### Long-term
- Shared faction dashboards
- PWA + push notifications
- AI-assisted insights (training recommendations, market forecasting)

---

## Architecture

```
Browser (Next.js App Router)
        │
        ▼
  [/api/torn proxy]  ──→  Redis (Upstash)  ──→  Torn API
        │                  (5-min cache)         (≤80 req/min)
        │
  [Prisma ORM]  ──→  PostgreSQL (Prisma Postgres / Neon / Supabase)
        │             (users, snapshots, prices, alerts)
        │
  [Inngest Jobs]
    ├─ stat-snapshot (every 6h per active user)
    ├─ market-poll   (every 15min for watched items)
    └─ alert-eval    (every 5min — check thresholds)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma 7 |
| Database | PostgreSQL (Prisma Postgres / Neon / Supabase) |
| Cache | Redis via Upstash |
| Auth | NextAuth v4 (credentials provider + JWT) |
| Background jobs | Inngest |
| Hosting | Vercel + managed DB/Redis |

---

## Project Structure

```
torn-city/
├── app/
│   ├── page.tsx                    # Root redirect (auth-aware)
│   ├── globals.css                 # OLED dark + cyberpunk design tokens
│   ├── layout.tsx                  # Root layout (fonts, dark class)
│   ├── (auth)/
│   │   └── login/page.tsx          # API key entry + validation
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth guard + Sidebar + Topbar shell
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── stats/page.tsx          # Stat history + growth charts
│   │   ├── market/page.tsx         # Item price tracker
│   │   ├── faction/page.tsx        # Faction overview
│   │   ├── travel/page.tsx         # Travel timers + crime tools
│   │   └── settings/page.tsx       # API key, notifications, prefs
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── torn/route.ts           # Proxy + cache layer for Torn API
│       ├── snapshots/route.ts      # Stat snapshot scheduler
│       └── notifications/route.ts  # Alert evaluation
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Collapsible sidebar (shadcn)
│   │   ├── Topbar.tsx              # Top navigation bar
│   │   └── BottomNav.tsx           # Mobile bottom navigation (5 items)
│   ├── dashboard/
│   │   ├── StatBar.tsx             # Energy/Nerve/Happy animated bars
│   │   ├── CooldownCard.tsx        # Hospital/jail/drug timers
│   │   └── TravelStatus.tsx        # Travel destination + time left
│   ├── stats/
│   │   ├── StatGrowthChart.tsx     # Recharts line chart
│   │   └── SnapshotTable.tsx       # Historical snapshot table
│   ├── market/
│   │   ├── PriceTrackerTable.tsx   # Sortable watched-items table
│   │   └── PriceSparkline.tsx      # 7-day sparkline per item
│   ├── faction/
│   │   ├── MemberActivityTable.tsx # Member last-action, status
│   │   └── ChainStatus.tsx         # Chain timer + participation
│   └── ui/                         # shadcn/ui generated components
├── lib/
│   ├── auth.ts                     # NextAuth options (credentials provider)
│   ├── torn-api.ts                 # Typed Torn API client
│   ├── cache.ts                    # Upstash Redis helpers + rate limiter
│   ├── crypto.ts                   # AES-256-GCM encrypt/decrypt
│   └── db.ts                       # Prisma client singleton
├── types/
│   └── next-auth.d.ts              # Session type extensions (tornId, userId)
├── prisma/
│   └── schema.prisma               # Database models
├── prisma.config.ts                # Prisma 7 config (DB URL, migrations path)
└── .env.local                      # Environment variables (see below)
```

---

## Design System

### Style: Dark Mode OLED — Cyberpunk/Tactical

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| Background | `#000000` | `oklch(0 0 0)` | OLED true black base |
| Surface | `#0D0D14` | `oklch(0.08 0.008 255)` | Cards, panels |
| Surface-2 | `#111118` | `oklch(0.12 0.01 255)` | Elevated cards, modals |
| Border | `#1E2A3A` | `oklch(0.22 0.03 240)` | Dividers, card borders |
| Primary | `#2B4FCC` | `oklch(0.45 0.17 265)` | Buttons, links |
| Accent/CTA | `#D97706` | `oklch(0.65 0.15 65)` | Energy bars, highlights |
| Neon Cyan | `#06B6D4` | `oklch(0.75 0.15 200)` | Stat values, live data |
| Neon Green | `#10B981` | `oklch(0.72 0.17 160)` | Positive Δ, online status |
| Danger | `#DC2626` | `oklch(0.55 0.22 25)` | Nerve, attacks, errors |
| Text | `#F1F5F9` | `oklch(0.96 0.005 240)` | Headings, labels |
| Text Muted | `#64748B` | `oklch(0.55 0.04 248)` | Secondary labels |

### Typography

```css
/* Headings / stat values */
font-family: 'Orbitron', monospace;   /* weights: 700, 900 */

/* Body / data / tables */
font-family: 'JetBrains Mono', monospace;  /* weights: 400, 500 */
```

Google Fonts import:
```
https://fonts.google.com/share?selection.family=JetBrains+Mono:wght@400;500|Orbitron:wght@700;900
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Torn API key](https://www.torn.com/preferences.php#tab=api) (public access, no special permissions needed for basic player data)
- PostgreSQL database (local Prisma Postgres, Neon, or Supabase)
- Upstash Redis instance

### Environment Variables

Create `.env.local` with:

```bash
# NextAuth
NEXTAUTH_SECRET=                     # openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000

# AES-256 key for Torn API key encryption (must be exactly 64 hex chars)
API_KEY_ENCRYPTION_SECRET=           # openssl rand -hex 32

# Torn API base URL
TORN_API_BASE=https://api.torn.com

# Database (Prisma uses prisma.config.ts — set DATABASE_URL in .env)
DATABASE_URL=prisma+postgres://...   # or postgresql://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Background Jobs (Inngest) — optional for Week 1
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

Generate secrets:
```bash
openssl rand -hex 32   # use once for NEXTAUTH_SECRET
openssl rand -hex 32   # use again for API_KEY_ENCRYPTION_SECRET
```

### Installation

```bash
# 1. Install dependencies (already done if you ran npm install)
npm install

# 2. Install missing shadcn/ui components
npx shadcn@latest add label avatar dropdown-menu

# 3. Push database schema
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Start dev server
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

---

## Security

| Concern | Strategy |
|---------|----------|
| API key storage | AES-256-GCM encrypted at rest; key never logged or exposed in responses |
| Rate limiting | Upstash sliding window (80 req/60s per user); Redis cache (5-min TTL) deduplicates requests |
| Background polling | Inngest jobs run server-side — API key is never sent to the browser |
| Key validation | Key is validated against Torn API before being stored |
| Session | JWT strategy, no database sessions |
| ToS compliance | No automated gameplay; data cached aggressively; no resale of API data |

---

## Development Roadmap

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundation: auth, design tokens, API proxy, layout shell | ✅ In Progress |
| 2 | Core Dashboard: stat bars, cooldown timers, stat growth chart | ⏳ Pending |
| 3 | Market + Notifications: price tracker, alerts, notification drawer | ⏳ Pending |
| 4 | Faction + Polish: member activity, responsiveness, skeletons | ⏳ Pending |

---

## Feature Priority Matrix

| Feature | Impact | Effort | Phase |
|---------|--------|--------|-------|
| API key auth + secure storage | Critical | Low | MVP |
| Player dashboard (bars + cooldowns) | Critical | Low | MVP |
| Stat snapshot + history chart | High | Medium | MVP |
| Market price tracker | High | Medium | MVP |
| Custom notifications | High | Medium | MVP |
| Faction member activity | Medium | Medium | MVP |
| Travel timer | Medium | Low | MVP |
| Crime profit calculator | Medium | Medium | Phase 2 |
| Market arbitrage finder | High | High | Phase 2 |
| Attack log analysis | Medium | High | Phase 2 |
| Training ROI optimizer | High | High | Phase 2 |
| Faction war tools | Medium | High | Phase 2 |
| Shared faction dashboards | Medium | High | Long-term |
| PWA + push notifications | High | High | Long-term |
| AI-assisted insights | Medium | Very High | Long-term |

---

## Torn API Compliance

- All requests go through the `/api/torn` server-side proxy — the raw API key is never exposed to the browser
- Responses are cached in Redis for 5 minutes to minimize API calls
- Rate limiter enforces a maximum of 80 requests per 60 seconds per user (safely under Torn's ~100 req/min limit)
- No automated gameplay; the app is read-only and advisory
- Torn API ToS: https://www.torn.com/forums.php#/p=threads&f=61&t=16197853

---

## Contributing

This is a private project for personal use. Not affiliated with or endorsed by Torn City Ltd.

---

## License

MIT
