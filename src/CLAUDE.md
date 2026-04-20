# src/

Entry point is `main.tsx` → mounts `App.tsx`.

`App.tsx` owns top-level view state (`calendar | history | stats`), theme preference, baby profile, auth session, and the `editingEntry` modal state. It consumes `useFoodEntries` + `useAuth` and passes data down to the three view components. Baby name/DOB/start-date are loaded via `loadProfile()` (localStorage) and rendered through `SettingsModal`.

## Sub-modules

@src/types/CLAUDE.md

@src/utils/CLAUDE.md

@src/hooks/CLAUDE.md

@src/components/CLAUDE.md
