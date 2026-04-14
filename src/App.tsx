import { useState, useCallback, useEffect } from 'react';
import type { View } from './types';
import { useFoodEntries } from './hooks/useFoodEntries';
import { saveEntries } from './utils/storage';
import { loadThemePreference, saveThemePreference, applyTheme } from './utils/theme';
import type { ThemePreference } from './utils/theme';
import { loadProfile, saveProfile } from './utils/profile';
import type { BabyProfile } from './utils/profile';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import CalendarView from './components/Calendar/CalendarView';
import FoodHistoryView from './components/FoodHistory/FoodHistoryView';
import StatsView from './components/FoodHistory/StatsView';
import SettingsModal from './components/Layout/SettingsModal';
import AddFoodModal from './components/FoodEntry/AddFoodModal';
import type { FoodEntry } from './types';

export default function App() {
  const [view, setView] = useState<View>('calendar');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [themePref, setThemePref] = useState<ThemePreference>(() => loadThemePreference());
  const [profile, setProfile] = useState<BabyProfile>(() => loadProfile());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    applyTheme(themePref);
  }, [themePref]);

  useEffect(() => {
    if (themePref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themePref]);

  const toggleTheme = useCallback(() => {
    const next: ThemePreference = themePref === 'system' ? 'light' : themePref === 'light' ? 'dark' : 'system';
    setThemePref(next);
    saveThemePreference(next);
  }, [themePref]);
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    isFirstIntroduction,
    recentNewAllergens,
  } = useFoodEntries();
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  const handleAddEntry = useCallback((entry: Parameters<typeof addEntry>[0]) => {
    addEntry(entry);
    showToast('Entry saved ✓');
  }, [addEntry, showToast]);

  const handleDeleteEntry = useCallback((id: string) => {
    deleteEntry(id);
    showToast('Entry deleted');
  }, [deleteEntry, showToast]);

  const handleImport = useCallback((imported: FoodEntry[]) => {
    const merged = [...entries, ...imported.filter(e => !entries.find(p => p.id === e.id))];
    saveEntries(merged);
    // Reload to pick up the saved entries (avoids prop-drilling a setEntries)
    window.location.reload();
  }, [entries]);

  return (
    <div className="min-h-screen flex flex-col bg-sage-50 dark:bg-stone-900">
      <Header
        view={view}
        babyName={profile.babyName}
        themePref={themePref}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          {view === 'calendar' && (
            <CalendarView
              entries={entries}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
              isFirstIntroduction={isFirstIntroduction}
              onEditEntry={setEditingEntry}
            />
          )}
          {view === 'history' && (
            <FoodHistoryView
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
              recentNewAllergens={recentNewAllergens}
              onEditEntry={setEditingEntry}
            />
          )}
          {view === 'stats' && (
            <StatsView entries={entries} onImport={handleImport} />
          )}
        </div>
      </main>

      <Navigation view={view} onViewChange={setView} />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        initialProfile={profile}
        onSave={(updated) => {
          saveProfile(updated);
          setProfile(updated);
        }}
      />

      {editingEntry && (
        <AddFoodModal
          date={editingEntry.date}
          onClose={() => setEditingEntry(null)}
          onSave={() => setEditingEntry(null)}
          isFirstIntroduction={isFirstIntroduction}
          existingEntry={editingEntry}
          onUpdateEntry={(id, updates) => {
            updateEntry(id, updates);
            showToast('Entry updated ✓');
            setEditingEntry(null);
          }}
        />
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-sage-700 text-white px-5 py-3 rounded-xl shadow-lg transition-opacity duration-300 pointer-events-none ${
          toast.visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
