import type { View } from '../../types';
import type { ThemePreference } from '../../utils/theme';

interface HeaderProps {
  view: View;
  babyName?: string;
  themePref: ThemePreference;
  onToggleTheme: () => void;
  onOpenSettings?: () => void;
}

const VIEW_TITLES: Record<View, string> = {
  calendar: 'Food Calendar',
  history: 'Food History',
  stats: 'Stats & Insights',
};

export default function Header({ view, babyName, themePref, onToggleTheme, onOpenSettings }: HeaderProps) {
  const themeIcon = themePref === 'dark' ? '☀️' : '🌙';

  return (
    <header className="bg-white dark:bg-stone-800 border-b border-sage-100 dark:border-stone-700 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-sage-700 dark:text-sage-400">{VIEW_TITLES[view]}</h1>
          {babyName && (
            <p className="text-xs text-gray-400 dark:text-stone-400">Tracking for {babyName}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-lg leading-none"
          >
            {themeIcon}
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-lg leading-none"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
