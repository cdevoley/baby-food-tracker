# Baby Food Tracker — Project Brief

A mobile-first web app for parents tracking solid food introductions during their baby's transition from bottle feeding (starting ~6 months). Parents can log each feeding session with food details, allergen flags, enjoyment levels, and any reactions.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom sage/peach color palette)
- **Data:** Supabase (Phase 3 complete); localStorage (`baby-food-tracker-entries`) remains as offline fallback / pre-auth cache
- **AI:** `@anthropic-ai/sdk` — food analysis + photo recognition via Claude (gated behind `VITE_ANTHROPIC_API_KEY`)
- **Utilities:** date-fns (date math), uuid (ID generation)

## Running the App
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

Optional: copy `.env.example` to `.env.local` and add `VITE_ANTHROPIC_API_KEY` to enable AI features.

## Architecture

### Data Model (`src/types/index.ts`)
`FoodEntry` is the core entity. Key fields:
- `date` (YYYY-MM-DD), `foodName`, `foodCategory`, `texture`, `timeOfDay`
- `feedingTime?` — actual HH:MM time (new), `timeOfDay` is derived from it
- `amountEaten`, `enjoyment` — rated per feeding
- `allergens[]` — from the 9 major allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame)
- `hadReaction`, `symptoms[]`, `reactionDelay` — reaction tracking
- `isFirstIntroduction` — auto-detected based on prior entries
- `notes` — free text
- `nutrition?` — AI-estimated per-100g macros (calories, protein, carbs, fat, fiber)
- `photoAnalysis?` — one-sentence AI description from photo capture

All lookup data (allergens, symptoms, categories, etc.) lives in `src/utils/constants.ts`.

### State Management
`useFoodEntries` hook (`src/hooks/useFoodEntries.ts`) manages all CRUD operations, persists to Supabase (+ localStorage offline cache), and subscribes to realtime updates from household-mates.

### AI (`src/utils/ai.ts`)
- `AI_ENABLED` — false when `VITE_ANTHROPIC_API_KEY` is absent; all AI UI is hidden
- `analyzeFood(name)` — text call to Haiku; returns category, allergens, nutrition
- `analyzeFoodImage(base64, mimeType)` — vision call to Haiku; returns foodName, category, allergens, notes. Has a two-step fallback: if foodName is empty but notes has content, a second text call extracts the name from the description.
- `deriveTimeOfDay(hhmm)` — maps HH:MM → morning/midday/afternoon/evening

### Views
| View | Component | Purpose |
|------|-----------|---------|
| Calendar | `CalendarView` | Monthly calendar, emoji food dots per day, day detail panel |
| History | `FoodHistoryView` | Searchable/filterable list of all entries |
| Stats | `StatsView` | Texture nudge, weekly new-foods + sparkline, enjoyment breakdown, category breakdown, feeding-windows heatmap, favorites, allergen summary |

### Key Components
- `AddFoodModal` — 4-step guided form (food name → details → reactions → notes). Includes time picker, AI debounce analysis, photo capture with thumbnail
- `FoodEntryCard` — expandable card showing entry details (time, nutrition, photo notes), inline delete
- `DayCell` — calendar day tile with food emoji dots and ⭐/⚠️ badges

## Roadmap

### Phase 1 — COMPLETE ✅
- [x] Calendar view with monthly navigation
- [x] 4-step Add Food modal
- [x] Food entry cards (expandable)
- [x] Food history with search + filter + sort
- [x] Stats view (enjoyment, category, favorites, allergens)
- [x] localStorage persistence
- [x] Allergen tracking (9 major allergens)
- [x] Reaction/symptom logging
- [x] First introduction auto-detection

### Phase 2 — COMPLETE ✅

**Shipped:**
- [x] Actual time picker replacing the 4 emoji time-of-day buttons
- [x] AI auto-detect category, allergens, nutrition on food name input (debounced 800ms)
- [x] Photo / OCR capture → Claude Vision identifies food name, category, allergens
- [x] Nutrition grid in step 4 summary and expanded card view
- [x] Feeding time on entry cards ("07:30 🌅")
- [x] **Baby profile screen** — `SettingsModal` edits name, DOB, solids start date; persisted via `src/utils/profile.ts`
- [x] **Edit entry** — pencil button on `FoodEntryCard` opens `AddFoodModal` in edit mode; `isFirstIntroduction` flag re-evaluated when food name changes
- [x] **"Wait 3–5 days" allergen reminder** — `recentNewAllergens` in `useFoodEntries` drives dismissable cards at top of history
- [x] **Expanded food suggestions** — 50 items in `AddFoodModal.SUGGESTED_FOODS`
- [x] **Export/Import UI** — buttons in StatsView Data section; `importEntries()` dedupes by id and syncs to cloud when signed in
- [x] Dark mode toggle (system/light/dark) with Tailwind `dark:` variants

**Deferred (need backend infra beyond current Supabase scope):**
- [ ] Weekly summary email / push notifications

### Phase 3 — COMPLETE ✅ (Supabase)

**Goal:** Replace localStorage with Supabase so data persists across devices; add auth + household sharing + realtime for multi-person family use.

**Shipped (live at baby-food-tracker-lemon.vercel.app):**
- [x] **Chunk 1** (commit `e23268b`) — Supabase data layer: `food_entries` table, typed CRUD helpers in `src/utils/supabase.ts`, `useFoodEntries` loads from Supabase with optimistic writes, "Sync to Cloud" bulk migration button in StatsView.
- [x] **Chunk 2** (commit `910c2b2`) — Sync UX polish: loading spinner on mount, error toasts via `onSyncError` callback, `importEntries()` replaces the `window.location.reload()` hack, cloud icon (☁️) in Header, Export pulls from in-memory `entries` prop.
- [x] **Chunk 3** (commits `06ad324` → `420896a`) — Google OAuth via `useAuth` + `SignInView`; `households` + `household_members` tables with RLS gated on membership; `household_id` on `food_entries`; three-branch rendering (loading / sign-in / app) in `App.tsx`; account section + sign-out in `SettingsModal`. Post-ship RLS fixes in `420896a` and `33896b1` resolve a circular policy dep and an infinite-recursion bug.
- [x] **Chunk 4 — Collaboration:** Auto-join invites + realtime sync. Owner adds invitee's Gmail in Settings → `household_invites` row created (no Resend, no code). Invitee signs in with Google → `redeem_pending_invite()` security-definer function auto-adds them to the household. Realtime subscription on `food_entries` via `supabase_realtime` publication gives live insert/update/delete propagation. `leave_household()` handles solo-member (delete), owner-transfer (promote oldest other member), and plain member-leave cases. UI in `SettingsModal`: invite input, pending invites list with revoke, leave-household with confirmation.

**Notable simplifications vs original design:** no Edge Function, no Resend, no 6-char code, no `JoinHouseholdView`. Google's verified email replaces all of that. See `supabase/migrations/0002_household_invites.sql`.

**Phase 4+ (out of scope):** Multi-baby per household, per-user entry attribution, push notifications, offline queue with retry.

## Design System
Colors defined in `tailwind.config.js`:
- `sage-*` — primary green tones (buttons, active states)
- `peach-*` — accent warm orange (charts, category bars)
- Amber — allergen warnings
- Red — reactions/symptoms

## Notes for Claude Code
- Keep all components under `src/components/`. Group by feature, not type.
- Baby profile (name, DOB, solids start date) is read from `src/utils/profile.ts` (`loadProfile`/`saveProfile`). It's localStorage-only for now — not yet synced to Supabase.
- When adding new food categories or allergens, update `src/utils/constants.ts` only — components read from there.
- `FoodEntry` schema changes need: update `src/types/index.ts`, `src/utils/supabase.ts` (`DbRow`), and a Supabase migration in `supabase/migrations/`. Make new fields optional so old stored rows stay valid.
- AI features are entirely opt-in via `AI_ENABLED` — app works fully without an API key.
- Realtime subscription in `useFoodEntries` dedupes by id against optimistic writes. Rapid successive `updateEntry` calls can briefly flash a stale value when echoes arrive out of order — acceptable for now.
