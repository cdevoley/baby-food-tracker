export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'baby-food-tracker-theme';

export function loadThemePreference(): ThemePreference {
  return (localStorage.getItem(KEY) as ThemePreference) ?? 'system';
}

export function saveThemePreference(pref: ThemePreference): void {
  localStorage.setItem(KEY, pref);
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

export function applyTheme(pref: ThemePreference): void {
  const resolved = resolveTheme(pref);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}
