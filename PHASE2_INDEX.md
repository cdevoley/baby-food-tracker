# Phase 2 — Master Index

Run these chunks **in order**. Each chunk ends with `npm run build` passing clean before you move on.
If a session errors mid-chunk, restart and re-read only that chunk file — prior chunks are already committed.

| Chunk | File | Features | Est. Time |
|-------|------|----------|-----------|
| 1 | `PHASE2_CHUNK1_quick_wins.md` | Toast, Export/Import UI, Food suggestions, History search | ~35 min |
| 2 | `PHASE2_CHUNK2_dark_mode.md` | Dark mode (system-aware + manual toggle) | ~45 min |
| 3 | `PHASE2_CHUNK3_allergen_profile.md` | Allergen wait reminder, Baby profile / Settings modal | ~75 min |
| 4 | `PHASE2_CHUNK4_edit_entry.md` | Edit entry (most complex) | ~60 min |

## Context (all chunks)
Phase 2 AI features are working (Anthropic API restored, parseJson fixed).

**Out of scope:** Push notifications (needs backend), photo persistence (too complex), weekly summary (needs backend).

## Reused Infrastructure (all chunks)
- `exportData()` / `importData()` — `src/utils/storage.ts` (no changes needed)
- `updateEntry(id, updates)` — `src/hooks/useFoodEntries.ts:55` (already built)
- `ALLERGENS` constant — `src/utils/constants.ts`
- `saveEntries()` — `src/utils/storage.ts`
- `AddFoodModal` 4-step form — reuse for edit (Chunk 4)
