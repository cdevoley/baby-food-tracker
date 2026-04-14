import type { View } from '../../types';

interface NavigationProps {
  view: View;
  onViewChange: (view: View) => void;
}

const NAV_ITEMS: { id: View; label: string; emoji: string }[] = [
  { id: 'calendar', label: 'Calendar', emoji: '📅' },
  { id: 'history', label: 'History', emoji: '📋' },
  { id: 'stats', label: 'Stats', emoji: '📊' },
];

export default function Navigation({ view, onViewChange }: NavigationProps) {
  return (
    <nav className="relative bg-white dark:bg-stone-800 border-t border-sage-100 dark:border-stone-700 px-4 py-2 sticky bottom-0 z-10">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
              view === item.id
                ? 'text-sage-600 bg-sage-50 dark:bg-stone-700'
                : 'text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300'
            }`}
          >
            {view === item.id && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sage-500 rounded-full" />
            )}
            <span className="text-xl">{item.emoji}</span>
            <span className={`text-xs ${view === item.id ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
