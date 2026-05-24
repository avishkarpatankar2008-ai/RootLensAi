# RootLensAI Frontend v2.1.0

Enterprise AI observability frontend — Next.js 16 + Tailwind CSS 4 + Framer Motion.

## What's New in v2.1.0

- **Premium dark enterprise UI** — obsidian/cyan color system, JetBrains Mono typography
- **Sidebar navigation** — persistent nav with active state animations
- **Animated KPI cards** — spring-based number counters, trend indicators
- **AI RCA Panel** — expandable root cause analysis with confidence scoring
- **Live telemetry feed** — WebSocket-connected real-time log stream
- **Improved upload flow** — step-by-step progress, richer results display
- **Incidents list page** — searchable, paginated incident table
- **Premium chat UI** — copy-to-clipboard, quick prompts, typing indicator
- **Area charts** — gradient-filled Recharts analytics

## Setup

```bash
# Install
npm install

# Configure
cp .env.local.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Development
npm run dev
```

## Structure

```
app/
  page.tsx          — Main dashboard
  chat/page.tsx     — AI Assistant
  upload/page.tsx   — Log upload & analysis
  incidents/page.tsx — Incident list

components/dashboard/
  AppSidebar.tsx    — Sidebar navigation
  KpiCard.tsx       — Animated metric card
  HealthIndicator.tsx — Service health row
  RcaPanel.tsx      — AI root cause panel
  StatusBadge.tsx   — Severity badge + timeline event
  LoadingStates.tsx — Skeletons, empty/error states

lib/
  api.ts            — FastAPI client
  hooks.ts          — React hooks + WebSocket telemetry
  types.ts          — TypeScript interfaces
```
