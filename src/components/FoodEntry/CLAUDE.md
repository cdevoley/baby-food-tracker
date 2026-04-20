# src/components/FoodEntry/

Components for creating and viewing individual food entries.

## Files

### `AddFoodModal.tsx`
4-step guided form for logging a feeding session. Accepts an optional `existingEntry` + `onUpdateEntry` to operate in edit mode.

| Step | Fields |
|------|--------|
| 1 — Food | Food name (text + AI debounce), photo capture, category, allergens |
| 2 — Details | Texture, time picker (HH:MM), amount eaten, enjoyment |
| 3 — Reactions | `hadReaction` toggle, symptoms checkboxes, reaction delay |
| 4 — Notes | Free-text notes, nutrition summary grid |

Key behaviours:
- **AI auto-detect** (when `AI_ENABLED`): 800 ms debounce on food name input calls `analyzeFood()` → auto-fills category, allergens, and nutrition.
- **Photo capture** (when `AI_ENABLED`): camera input calls `analyzeFoodImage()` → auto-fills food name, category, allergens, and shows thumbnail.
- Allergens in step 1 are seeded from AI analysis; user can always override.
- `isFirstIntroduction` is computed from the hook and displayed as a badge. In **edit mode** it's only rewritten when the food name actually changes — otherwise the saved flag is preserved.
- **Suggestions:** `SUGGESTED_FOODS` is a 50-item static list; substring-matched client-side as the user types.

### `FoodEntryCard.tsx`
Expandable card showing a single `FoodEntry`.

- Collapsed: food name, emoji, feeding time badge, first-intro / reaction chips.
- Expanded: full details — texture, amount, enjoyment, allergens, symptoms, nutrition grid, AI photo notes.
- Inline delete button (calls `onDelete`) + optional ✏️ edit button (calls `onEdit(entry)`) that opens `AddFoodModal` in edit mode from `App.tsx`.
