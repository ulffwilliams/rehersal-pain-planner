# Rehearsal Planner — CLAUDE.md

## Project
Fullstack web app for bands to find common rehearsal days via pain chart scoring (1–6 per weekday).

## Stack
- Next.js 14 App Router
- NeonDB Serverless (`@neondatabase/serverless`)
- Tailwind CSS + neobrutalism.dev components
- Recharts for bar charts
- Deploy: Vercel

## Design Rules
- Neo-brutalism: `border: 2px solid black`, offset shadows, high contrast colors
- Mobile-first: design for 390px, then desktop
- Pain faces are the visual identity — use consistently everywhere
- No rounded cards without contrast; always black borders + offset-shadow
- Swedish UI text throughout ("Repa" not "träffas/mötas")

## Pain Chart Scale
1 = "Det fungerar perfekt" (green, happy)
2 = "Det fungerar bra" (light green)
3 = "Det går" (yellow, neutral)
4 = "Det är lite jobbigt" (orange)
5 = "Det är ganska jobbigt" (red-orange)
6 = "Jag kan absolut inte" (dark red, very sad)

Source image: `public/pain_chart.png` — sprite sheet, 6 faces horizontal.
Individual faces extracted to: `public/pain_1.png` … `public/pain_6.png`

## Database Schema (NeonDB PostgreSQL)
```sql
groups (id UUID PK, name TEXT NOT NULL, created_at TIMESTAMP)
members (id UUID PK, group_id UUID FK→groups, nickname TEXT NOT NULL)
responses (
  id UUID PK,
  member_id UUID FK→members,
  group_id UUID FK→groups,
  day_of_week INT CHECK(0–6),  -- 0=Monday, 6=Sunday
  pain_score INT CHECK(1–6),
  submitted_at TIMESTAMP,
  UNIQUE(member_id, day_of_week)  -- idempotent upsert
)
```

## Pages
| Route | Purpose |
|-------|---------|
| `/` | Create band, add members, get magic link |
| `/group/[groupId]` | Pick member profile → vote Mon–Sun |
| `/group/[groupId]/stats` | Aggregated stats (unlocks when ALL voted) |

## API Routes
```
POST /api/groups              → create group + members
GET  /api/groups/[id]         → get group, members, response status
POST /api/responses           → upsert all 7 responses for one member
GET  /api/groups/[id]/stats   → aggregated stats (only if all voted)
```

POST /api/responses payload:
```json
{ "memberId": "uuid", "groupId": "uuid", "responses": [{"dayOfWeek": 0, "painScore": 2}, ...] }
```
Use `ON CONFLICT (member_id, day_of_week) DO UPDATE` for idempotens.

## Components
- `PainFace` — sprite/image, `value` prop (1–6), `size` prop, hover/select interactions
- `VotingCard` — one day at a time, slide animation, pain faces 3+3 grid mobile / row desktop
- `DayStats` — Recharts BarChart, member list with faces
- `InsightCard` — auto-generated text insights
- `WaitingScreen` — auto-refresh every 30s, who voted/pending
- `ProgressBar` — "Dag X av 7" neo-brutal progress

## Insight Logic (`lib/insights.ts`)
```ts
classifyDay(summary): "blocked"|"perfect"|"great"|"okay"|"tough"|"bad"
// blocked: max===6
// perfect: avg<=2.0
// great: avg<=2.8
// okay: avg<=3.5
// tough: avg<=4.5
// bad: else
```

## File Structure
```
app/
  page.tsx
  group/[groupId]/page.tsx
  group/[groupId]/stats/page.tsx
  api/groups/route.ts
  api/groups/[id]/route.ts
  api/groups/[id]/stats/route.ts
  api/responses/route.ts
components/
  PainFace.tsx
  VotingCard.tsx
  DayStats.tsx
  InsightCard.tsx
  WaitingScreen.tsx
  ProgressBar.tsx
lib/
  db.ts
  insights.ts
public/
  pain_chart.png
  pain_1.png … pain_6.png
```

## Key Constraints
- No auth — magic links + nickname selection only
- Idempotent votes — re-voting replaces old answers
- Stats page gated — only accessible when ALL members voted
- Waiting screen polls every 30s with manual refresh button
- Stats page is the reward — make it visually impressive
