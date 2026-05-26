# Prompt: Rehearsal Planner — Pain Chart Scheduling App for Bands

## Översikt

Bygg en fullstack-webbapp kallad **"Rehearsal Planner"** som hjälper ett band att hitta gemensamma repdagar, baserat på ett pain chart-system. Konceptet är enkelt: varje bandmedlem anger hur "ont" det gör att repa varje dag i veckan, på en skala 1–6. Appen samlar svaren och visar sammanfattad statistik när alla har svarat.

Appen heter **Rehearsal Planner** — använd detta konsekvent i UI, title tags och metadata.

---

## Tech Stack

- **Frontend + Backend:** Next.js (App Router)
- **Databas:** NeonDB Serverless (PostgreSQL via `@neondatabase/serverless`)
- **Styling:** Tailwind CSS + [neobrutalism.dev](https://www.neobrutalism.dev/) komponentbibliotek som primär källa; komplettera med andra bibliotek vid behov
- **Deploy:** Vercel

---

## Design

### Stil: Neo-brutalism
- Primärt [neobrutalism.dev](https://www.neobrutalism.dev/) – använd deras komponenter, färger, borders och shadows
- Komplettera med andra bibliotek om neobrutalism.dev saknar det du behöver
- Hårda svarta kanter (`border: 2px solid black`), starka kontrastfärger, offset-shadows, råa former
- **Mobile-first och 100% responsiv design** – designa primärt för mobilskärmar (~390px), sedan för desktop
- Musikreferenser i designspråket är välkomna men inte obligatoriska (t.ex. notlinjer som dekorativa element)

### Pain Chart-symbolerna
En bifogad PNG (`pain_chart.png`) innehåller alla 6 ansikten i en enda bild, arrangerade horisontellt. Din uppgift:

1. **Dela upp PNG:en** i 6 separata tillgångar — antingen via CSS (`background-position` sprite-teknik) eller genom att extrahera dem som individuella filer
2. **Bygg en `<PainFace value={1-6} />` React-komponent** som visar rätt ansikte baserat på värdet, med stöd för olika storlekar via en `size`-prop
3. Ansiktena ska vara **interaktiva**: hover-effekter (scale-up, shadow), klickbara, och markerade när de är valda
4. Skalan och dess innebörd:
   - **1 (grön, glad):** "Det fungerar perfekt"
   - **2 (ljusgrön, litet leende):** "Det fungerar bra"
   - **3 (gul, neutral):** "Det går"
   - **4 (orange, lite missnöjd):** "Det är lite jobbigt"
   - **5 (röd-orange, nedstämd):** "Det är ganska jobbigt"
   - **6 (mörkt röd, kraftigt ledsen):** "Jag kan absolut inte"
5. Symbolerna är en **grundpelare i designen** och ska återanvändas konsekvent i hela appen — i röstningsflödet, statistiksidan och sammanfattningskorten

---

## Databas (NeonDB)

### Tabeller

```sql
-- Grupper/band
groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Bandmedlemmar
members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL
)

-- Svar (en rad per person per dag)
responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Måndag, 6=Söndag
  pain_score INT NOT NULL CHECK (pain_score BETWEEN 1 AND 6),
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, day_of_week) -- Idempotens: en person kan uppdatera sitt svar
)
```

---

## Sidor & Flöde

### 1. Startsida — `/`
**Syfte:** Skapa ett nytt band/grupp

**UI:**
- Stor, fet neo-brutal rubrik: "Rehearsal Planner"
- Undertitel: "Ta reda på när hela bandet kan repa"
- Pain chart-ansiktena visas dekorativt (t.ex. som en rad längst ner eller som bakgrundselement)
- Formulär:
  - Fält: Bandets namn (t.ex. "The Broken Strings")
  - 4 standardfält för bandmedlemmars nicknames (placeholder: "Lägg till namn...")
  - En "+ Lägg till bandmedlem"-knapp som lägger till fler fält dynamiskt (ingen övre gräns)
  - Primär CTA: "Skapa band & generera länk" (stor, neo-brutal knapp med offset-shadow)
- Vid submit:
  - Spara grupp + deltagare i databasen
  - Generera magic link: `https://[app-url]/group/[group-id]`
  - Visa länken i ett framträdande kort med:
    - Texten "Skicka den här länken till alla i bandet!"
    - En stor "Kopiera länk"-knapp
    - Valfritt: QR-kod för länken

---

### 2. Gruppens sida — `/group/[groupId]`
**Syfte:** Välj din profil och starta röstningen

**UI – Profilval:**
- Visa bandets namn som rubrik
- Underrubrik: "Vem är du?"
- Lista alla bandmedlemmar som stora, klickbara kort i neo-brutal stil
- Status per kort:
  - ✅ Klar: grön badge + "Röstat klart" — fortfarande klickbar (leder till stats om alla är klara, annars tillbaka hit)
  - ⏳ Ej klar: klickbar, startar röstningsflödet

**UI – Röstningsflöde (Måndag → Söndag):**
- Ett kort åt gången med smooth slide-animation vid dagbyten
- Kortets innehåll:
  - Rubrik: **"Hur känner du för att repa på [dag]?"**
  - De 6 pain-face-ansiktena visas i en rad (desktop) eller 3+3-grid (mobil)
  - Hover: ansiktet skalas upp + border-highlight
  - Valt ansikte: tydlig markering (tjock svart border, inzooming, förklaringstext visas)
  - Förklaringstext under valt ansikte: t.ex. "Det är lite jobbigt"
  - "Nästa dag →"-knapp (inaktiv tills ett val gjorts)
- Progress-indikator: "Dag 3 av 7" med neo-brutal progress bar
- Sista dagen (Söndag) → knapp: "Skicka mina svar 🎸"
- Efter submit → spara alla 7 svar i ett API-anrop → redirect till `/group/[groupId]/stats`

---

### 3. Statistiksida — `/group/[groupId]/stats`
**Syfte:** Visa aggregerad repstatistik — endast tillgänglig när ALLA har röstat

**Åtkomst:**
- Om inte alla röstat: visa en **vänteskärm**
  - Vilka har röstat ✅ och vilka saknas ❌
  - Auto-refresh var 30:e sekund
  - Manuell "Uppdatera"-knapp
  - Pain faces som dekorativa element på väntan

**UI – Statistiksidan (när alla är klara):**

#### Sektion 1: Smarta insikter (överst)
Auto-genererade textinsikter baserat på datan:
- 🟢 "Fredagar är perfekta repdagar" (alla har 1–2)
- 👍 "Torsdagar funkar bra för bandet" (medel ≤ 2.5, ingen >3)
- 🤷 "Onsdagar är lite delat" (ingen extrem, men medel ~3–3.5)
- 😬 "Söndagar är tuffa — undvik" (medel >4 eller någon har 6)
- 🚫 "Lördagar fungerar inte — någon kan absolut inte" (någon har 6)
- **"Bästa repdagen: [Dag]"** — med stor pain face (värde = genomsnitt avrundat) och ett tydligt kort
- **"Sämsta repdagen: [Dag]"** — med stor pain face

#### Sektion 2: Veckoöversikt
- Kompakt lista/grid med alla 7 dagar
- Varje dag: dagnamn + genomsnittlig pain face + medelvärde + kort statustext
- Klickbar — scrollar ner till detaljvyn för den dagen

#### Sektion 3: Dag-för-dag-detaljvy
- Tab-navigation eller scroll-baserad navigation mellan dagar
- Swipe-gesture på mobil för att byta dag
- Per dag:
  - Stort pain face (genomsnitt, avrundat)
  - Genomsnittligt pain score med en decimal (t.ex. "2.3")
  - **Stapeldiagram** (Recharts `BarChart`) med pain faces som x-axelns labels (1–6), antal röster på y-axeln
  - Lista: varje bandmedlem + deras pain face för den dagen
  - Stämningstext baserat på medel:
    - 1–2: "🎉 Hela bandet är med!"
    - 2–3: "👍 Det funkar för de flesta"
    - 3–4: "🤷 Delat — kräver kompromiss"
    - 4–5: "😬 Svårt för flera i bandet"
    - 5–6: "🚫 Dålig repdag"

**Diagrambibliotek:** Recharts (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`)

---

## API Routes (Next.js App Router)

```
POST /api/groups                    → Skapa grupp + deltagare
GET  /api/groups/[id]               → Hämta grupp, deltagare, svarsstatus
POST /api/responses                 → Spara alla 7 svar för en deltagare (upsert)
GET  /api/groups/[id]/stats         → Aggregerad statistik per dag (bara om alla svarat)
```

### POST /api/responses — Payload
```json
{
  "memberId": "uuid",
  "groupId": "uuid",
  "responses": [
    { "dayOfWeek": 0, "painScore": 2 },
    { "dayOfWeek": 1, "painScore": 4 },
    ...
  ]
}
```
Använd `ON CONFLICT (member_id, day_of_week) DO UPDATE` för idempotens.

---

## Insiktslogik (`lib/insights.ts`)

```ts
type DaySummary = {
  day: number; // 0–6
  avg: number;
  max: number;
  scores: number[];
}

function classifyDay(summary: DaySummary): string {
  if (summary.max === 6) return "blocked";       // Någon kan absolut inte
  if (summary.avg <= 2.0) return "perfect";      // Alla är med
  if (summary.avg <= 2.8) return "great";        // Funkar bra
  if (summary.avg <= 3.5) return "okay";         // Okej, kompromiss
  if (summary.avg <= 4.5) return "tough";        // Tufft för flera
  return "bad";                                  // Dålig dag
}

// Returnera: bästa dag, sämsta dag, lista med insiktstext per dag
```

---

## Filstruktur (förslag)

```
app/
  page.tsx                          ← Startsida (skapa band)
  group/
    [groupId]/
      page.tsx                      ← Profilval + röstningsflöde
      stats/
        page.tsx                    ← Statistiksida
api/
  groups/
    route.ts
    [id]/
      route.ts
      stats/
        route.ts
  responses/
    route.ts
components/
  PainFace.tsx                      ← Sprite/image-baserat, size-prop, interaktiv
  VotingCard.tsx                    ← Röstningskort per dag med animation
  DayStats.tsx                      ← Detaljvy för en dag inkl. Recharts
  InsightCard.tsx                   ← Sammanfattningsinsikter
  WaitingScreen.tsx                 ← Vänteskärm med realtidsstatus
  ProgressBar.tsx
lib/
  db.ts                             ← NeonDB-klient (@neondatabase/serverless)
  insights.ts                       ← classifyDay(), generateInsights()
public/
  pain_chart.png                    ← Din bifogade PNG (original)
  pain_1.png … pain_6.png           ← Extraherade individuella ansikten (om du väljer den vägen)
```

---

## Viktigt att tänka på

1. **Pain faces är appens visuella identitet** — de ska användas konsekvent i alla vyer och vara rätt extraherade från PNG:en
2. **"Repa" är nyckelordet** — använd det konsekvent i all UI-text (inte "träffas" eller "mötas")
3. **Mobile-first** — testa alla vyer i 390px-bredd innan desktop
4. **Neo-brutalism hela vägen** — inga rundade kort utan kontrast, alltid svarta borders, alltid offset-shadow
5. **Statistiksidan är belöningen** — gör den informativ, tydlig och visuellt imponerande med Recharts
6. **Ingen autentisering** — allt via magic links och nickname-val; enkelt och friktionsfritt
7. **Idempotens** — om en bandmedlem öppnar länken igen och röstar om, ersätt gamla svar (UPSERT)
