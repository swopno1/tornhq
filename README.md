Torn City Companion App — Full Design & Architecture Plan
Design System
Style: Dark Mode (OLED) — Cyberpunk/Tactical
The design system search matched Dark Mode (OLED) with the cyberpunk/HUD aesthetic — exactly right for a Torn companion. WCAG AAA compliant, OLED-optimized.

Color Palette (adjusted for dark OLED surfaces):

Role Hex Usage
Background #000000 OLED true black base
Surface #0A0A0F Cards, panels
Surface-2 #12121A Elevated cards, modals
Border #1E2A3A Dividers, card borders
Primary #1E40AF Primary actions, links
Secondary #3B82F6 Hover states, badges
Accent/CTA #D97706 Alerts, energy bars, highlights
Neon Cyan #06B6D4 Stat values, live data
Neon Green #10B981 Positive values, online status
Danger #DC2626 Attacks, nerve, destructive
Text-Primary #F1F5F9 Headings, labels
Text-Muted #64748B Secondary labels
Typography:

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@700;900&display=swap');

/_ Headings / stat values _/ font-family: 'Orbitron', monospace;
/_ Body / data / tables _/ font-family: 'JetBrains Mono', monospace;
Key Effects:

Neon glow on stat values: text-shadow: 0 0 8px #06B6D4, 0 0 20px #06B6D480
Card borders with subtle glow: border: 1px solid #1E2A3A; box-shadow: 0 0 12px #1E40AF20
Progress bars with animated fill + glow (energy, nerve, happiness)
Micro-transitions: 150–200ms ease-out only
Layout Architecture

┌─────────────────────────────────────────────────────────────────┐
│ TOPBAR (sticky, h-14) │
│ [Logo] [Player: FactionName | $Cash | Lvl 42] [🔔] [Avatar] │
├──────────────┬──────────────────────────────────────────────────┤
│ SIDEBAR │ MAIN CONTENT AREA │
│ (w-56, │ │
│ collapsible │ ┌─────────┬─────────┬─────────┬─────────┐ │
│ on mobile) │ │ Energy │ Nerve │ Happy │Travel │ │
│ │ │ ██████░ │ ████░░ │ ████░░ │ Status │ │
│ • Dashboard │ │ 180/210 │ 21/25 │ 95/100 │ UK→USA │ │
│ • Stats │ └─────────┴─────────┴─────────┴─────────┘ │
│ • Market │ │
│ • Faction │ ┌──────────────────┐ ┌───────────────────┐ │
│ • Travel │ │ STAT GROWTH │ │ NOTIFICATIONS │ │
│ • Crimes │ │ [Line Chart] │ │ ⚠ Energy Ready │ │
│ • Settings │ │ Str/Def/Spd/Dex │ │ ✓ Travel Landed │ │
│ │ └──────────────────┘ │ ⚡ Chain Active │ │
│ ────────── │ └───────────────────┘ │
│ API Status │ ┌──────────────────────────────────────────┐ │
│ ● Connected │ │ MARKET PRICE TRACKER │ │
│ │ │ Item | Price | 24h Δ | 7d Chart │ │
└──────────────┴──────────────────────────────────────────────────┘

Mobile: Sidebar collapses to bottom nav (5 items: Dashboard/Stats/Market/Faction/Alerts)
Folder Structure

torn-city/
├── app/
│ ├── (auth)/
│ │ └── login/page.tsx # API key entry + validation
│ ├── (dashboard)/
│ │ ├── layout.tsx # Sidebar + topbar shell
│ │ ├── page.tsx # Main dashboard
│ │ ├── stats/page.tsx # Stat history + growth charts
│ │ ├── market/page.tsx # Item price tracker
│ │ ├── faction/page.tsx # Faction overview
│ │ ├── travel/page.tsx # Travel timers + crime tools
│ │ └── settings/page.tsx # API key, notifications, prefs
│ └── api/
│ ├── torn/route.ts # Proxy + cache layer for Torn API
│ ├── snapshots/route.ts # Stat snapshot scheduler
│ └── notifications/route.ts # Alert evaluation
├── components/
│ ├── layout/
│ │ ├── Sidebar.tsx
│ │ ├── Topbar.tsx
│ │ └── BottomNav.tsx # Mobile only
│ ├── dashboard/
│ │ ├── StatBar.tsx # Energy/Nerve/Happy bars
│ │ ├── CooldownCard.tsx
│ │ └── TravelStatus.tsx
│ ├── stats/
│ │ ├── StatGrowthChart.tsx # Recharts line chart
│ │ └── SnapshotTable.tsx
│ ├── market/
│ │ ├── PriceTrackerTable.tsx
│ │ └── PriceSparkline.tsx
│ ├── faction/
│ │ ├── MemberActivityTable.tsx
│ │ └── ChainStatus.tsx
│ └── ui/ # shadcn/ui components
├── lib/
│ ├── torn-api.ts # Typed Torn API client
│ ├── cache.ts # Redis (Upstash) helpers
│ ├── crypto.ts # AES-256 API key encryption
│ └── db.ts # Prisma client
├── prisma/
│ └── schema.prisma
├── .env.local
└── next.config.ts
Initial Database Schema

// prisma/schema.prisma

model User {
id String @id @default(cuid())
tornId Int @unique
apiKeyEnc String // AES-256 encrypted
createdAt DateTime @default(now())
snapshots StatSnapshot[]
alerts Alert[]
watchedItems WatchedItem[]
}

model StatSnapshot {
id String @id @default(cuid())
userId String
user User @relation(fields: [userId], references: [id])
strength Int
defense Int
speed Int
dexterity Int
total Int
level Int
xp Int
takenAt DateTime @default(now())
@@index([userId, takenAt])
}

model MarketItem {
id String @id @default(cuid())
tornItemId Int @unique
name String
category String
priceHistory PricePoint[]
watchers WatchedItem[]
}

model PricePoint {
id String @id @default(cuid())
itemId String
item MarketItem @relation(fields: [itemId], references: [id])
averagePrice Int
lowestPrice Int
volume Int
recordedAt DateTime @default(now())
@@index([itemId, recordedAt])
}

model WatchedItem {
userId String
itemId String
alertBelow Int?
alertAbove Int?
user User @relation(fields: [userId], references: [id])
item MarketItem @relation(fields: [itemId], references: [id])
@@id([userId, itemId])
}

model Alert {
id String @id @default(cuid())
userId String
user User @relation(fields: [userId], references: [id])
type String // energy_ready | travel_landed | chain_alert | price_alert
payload Json
readAt DateTime?
createdAt DateTime @default(now())
}
Environment Variables

# .env.local

# App

NEXTAUTH_SECRET=<32-byte-random>
NEXTAUTH_URL=http://localhost:3000
API_KEY_ENCRYPTION_SECRET=<32-byte-hex> # AES-256 key for encrypting Torn API keys

# Torn API

TORN_API_BASE=https://api.torn.com

# Database (Neon / Supabase PostgreSQL)

DATABASE_URL=postgresql://user:pass@host/tornapp?sslmode=require

# Redis (Upstash)

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Background Jobs (Inngest)

INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
Setup Commands

# 1. Scaffold the project

npx create-next-app@latest torn-city --typescript --tailwind --app --src-dir=false
cd torn-city

# 2. Install core dependencies

npm install prisma @prisma/client @upstash/redis @upstash/ratelimit \
 next-auth @auth/prisma-adapter \
 recharts \
 inngest \
 zod \
 @t3-oss/env-nextjs

# 3. Install shadcn/ui

npx shadcn@latest init
npx shadcn@latest add card badge button table progress tooltip sheet sidebar

# 4. Prisma setup

npx prisma init

# (edit schema.prisma with schema above)

npx prisma generate
npx prisma db push

# 5. Install useful skills (see below)

npx skills add secondsky/claude-skills@tailwind-v4-shadcn -g -y
npx skills add sickn33/antigravity-awesome-skills@nextjs-supabase-auth -g -y
npx skills add antvis/chart-visualization-skills@chart-visualization -g -y
npx skills add aj-geddes/useful-ai-prompts@api-rate-limiting -g -y
Recommended Skills to Install
Skill Installs What It Adds
secondsky/claude-skills@tailwind-v4-shadcn 5.5K Tailwind v4 + shadcn/ui patterns — use when building any component
sickn33/antigravity-awesome-skills@nextjs-supabase-auth 5.4K Next.js + Supabase auth flow — use for API key auth setup
antvis/chart-visualization-skills@chart-visualization 3.8K Chart type selection + Recharts implementation — use for stat history & market charts
bytedance/deer-flow@chart-visualization 1.6K Advanced data viz patterns — supplements the above
giuseppe-trisciuoglio/developer-kit@tailwind-design-system 1.4K Tailwind design token system — use when building the theme
jwynia/agent-skills@shadcn-layouts 408 shadcn dashboard layouts — jump-start the sidebar/topbar shell
aj-geddes/useful-ai-prompts@api-rate-limiting 500 Rate limiting patterns — critical for respecting Torn's API limits
secondsky/claude-skills@api-rate-limiting 267 Next.js-specific rate limiting — use on /api/torn proxy route
Prioritized Feature Matrix
Feature Impact Effort Phase
API key auth + secure storage Critical Low MVP
Player dashboard (bars + cooldowns) Critical Low MVP
Stat snapshot + history chart High Medium MVP
Market price tracker (watched items) High Medium MVP
Custom notifications (energy/travel/chain) High Medium MVP
Faction member activity table Medium Medium MVP
Travel timer + destination helper Medium Low MVP
Crime profit calculator Medium Medium Phase 2
Market arbitrage finder High High Phase 2
Attack log analysis Medium High Phase 2
Training ROI optimizer High High Phase 2
Faction war tools Medium High Phase 2
Shared faction dashboards Medium High Long-term
PWA + push notifications High High Long-term
AI-assisted insights Medium Very High Long-term
4-Week MVP Roadmap
Week 1 — Foundation

Project scaffold (Next.js 15, Prisma, Upstash Redis, shadcn/ui)
Design tokens: OLED dark theme, Orbitron/JetBrains Mono, color variables
API key entry page + AES-256 encrypted storage in DB
/api/torn proxy route with Redis caching (5-min TTL) + Upstash rate limiter
Sidebar + topbar layout shell, bottom nav for mobile
Week 2 — Core Dashboard

Player status cards (Energy, Nerve, Happiness, Life bars with glow)
Cooldown timers (hospital, jail, travel) with live countdown
Travel status card
Stat snapshot cron (Inngest, every 6h) storing to StatSnapshot
Stat growth line chart (Recharts) — Strength/Defense/Speed/Dex over time
Week 3 — Market + Notifications

Watched items list with add/remove
Market price polling (Inngest, every 15min) storing PricePoint
Price history sparklines per item, sortable table
Alert evaluation job: energy ready, travel landed, chain active, price threshold
In-app notification bell + alert drawer (shadcn Sheet)
Week 4 — Faction + Polish

Faction member list: last action, status, stats contribution
Chain participation indicator
Mobile responsiveness pass (375px → 1440px)
Performance audit (Redis cache hit rate, API call budget)
Error states, empty states, loading skeletons throughout
API, Security & Rate-Limit Considerations
Concern Strategy
Torn API key storage AES-256-GCM encrypted at rest; never logged or exposed in responses
Rate limits Torn allows ~100 req/min per key. Redis cache all responses with 5-min TTL; deduplicate concurrent requests
Background polling Inngest jobs run server-side using the user's stored key — never client-side
Key validation Validate key on entry by calling /user?selections=basic — store only on success
CORS /api/torn proxy is internal only — no CORS headers needed
ToS compliance Cache aggressively, no reselling of data, respect Torn's API ToS (no automated gameplay)
Architecture Diagram

Browser (Next.js App Router)
│
▼
[/api/torn proxy] ──→ Redis (Upstash) ──→ Torn API
│ (5-min cache) (rate-limited)
│
[Prisma ORM] ──→ PostgreSQL (Neon/Supabase)
│ (users, snapshots, prices, alerts)
│
[Inngest Jobs]
├─ stat-snapshot (every 6h per active user)
├─ market-poll (every 15min for watched items)
└─ alert-eval (every 5min — check thresholds)
The design system, folder structure, schema, and skill installations above give you a ready-to-build foundation. Start with Week 1 (scaffold + auth + proxy), then proceed in order — each week produces a shippable increment. The biggest early win is the Torn API proxy with Redis caching: get that right first and everything downstream is fast and cost-efficient.
