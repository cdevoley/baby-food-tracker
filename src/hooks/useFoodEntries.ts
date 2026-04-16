import { useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FoodEntry } from '../types';
import { loadEntries, saveEntries } from '../utils/storage';
import { ALLERGENS } from '../utils/constants';
import {
  SUPABASE_ENABLED,
  dbLoadEntries,
  dbInsertEntry,
  dbUpdateEntry,
  dbDeleteEntry,
  dbUpsertEntries,
} from '../utils/supabase';

interface UseFoodEntriesOptions {
  onSyncError?: (message: string) => void;
}

export function useFoodEntries(options: UseFoodEntriesOptions = {}) {
  const { onSyncError } = options;
  // When Supabase is enabled, start with an empty list and load from DB.
  // Otherwise, hydrate immediately from localStorage.
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    SUPABASE_ENABLED ? [] : loadEntries()
  );
  const [syncing, setSyncing] = useState(SUPABASE_ENABLED);

  // On mount: load from Supabase (when enabled), fall back to localStorage on error.
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    dbLoadEntries()
      .then((data) => {
        setEntries(data);
        saveEntries(data); // keep localStorage in sync as offline cache
      })
      .catch((err) => {
        console.error('Failed to load from Supabase, falling back to localStorage:', err);
        setEntries(loadEntries());
      })
      .finally(() => setSyncing(false));
  }, []);

  const addEntry = useCallback((entry: Omit<FoodEntry, 'id' | 'createdAt'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => {
      const updated = [...prev, newEntry];
      saveEntries(updated);
      return updated;
    });
    if (SUPABASE_ENABLED) {
      dbInsertEntry(newEntry).catch(err => {
        console.error('Supabase insert failed:', err);
        onSyncError?.('Failed to save to cloud — saved locally');
      });
    }
    return newEntry;
  }, [onSyncError]);

  const updateEntry = useCallback((id: string, updates: Partial<FoodEntry>) => {
    setEntries(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      saveEntries(updated);
      return updated;
    });
    if (SUPABASE_ENABLED) {
      dbUpdateEntry(id, updates).catch(err => {
        console.error('Supabase update failed:', err);
        onSyncError?.('Failed to sync update to cloud — saved locally');
      });
    }
  }, [onSyncError]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveEntries(updated);
      return updated;
    });
    if (SUPABASE_ENABLED) {
      dbDeleteEntry(id).catch(err => {
        console.error('Supabase delete failed:', err);
        onSyncError?.('Failed to sync delete to cloud — removed locally');
      });
    }
  }, [onSyncError]);

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  const getEntriesForMonth = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return entries.filter(e => e.date.startsWith(prefix));
  }, [entries]);

  const getFoodNames = useCallback(() => {
    const names = new Set(entries.map(e => e.foodName.toLowerCase()));
    return Array.from(names).sort();
  }, [entries]);

  const isFirstIntroduction = useCallback((foodName: string, date: string) => {
    return !entries.some(e =>
      e.foodName.toLowerCase() === foodName.toLowerCase() && e.date < date
    );
  }, [entries]);

  const recentNewAllergens = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 5);

    // Build map: allergen ID → earliest entry date
    const firstSeen: Record<string, string> = {};
    for (const entry of entries) {
      for (const allergenId of entry.allergens) {
        if (!firstSeen[allergenId] || entry.date < firstSeen[allergenId]) {
          firstSeen[allergenId] = entry.date;
        }
      }
    }

    return Object.entries(firstSeen)
      .filter(([, date]) => new Date(date + 'T00:00:00') >= cutoff)
      .map(([allergenId, firstDate]) => {
        const first = new Date(firstDate + 'T00:00:00');
        const waitStart = new Date(first);
        waitStart.setDate(first.getDate() + 3);
        const waitEnd = new Date(first);
        waitEnd.setDate(first.getDate() + 5);
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const allergen = ALLERGENS.find(a => a.id === allergenId);
        return {
          allergenId,
          allergenLabel: allergen ? `${allergen.emoji} ${allergen.label}` : allergenId,
          firstDate: fmt(first),
          waitUntil: `${fmt(waitStart)}–${fmt(waitEnd)}`,
        };
      });
  }, [entries]);

  const importEntries = useCallback((imported: FoodEntry[]) => {
    setEntries(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const newEntries = imported.filter(e => !existingIds.has(e.id));
      const merged = [...prev, ...newEntries];
      saveEntries(merged);
      return merged;
    });
    if (SUPABASE_ENABLED) {
      dbUpsertEntries(imported).catch(err => {
        console.error('Supabase import sync failed:', err);
        onSyncError?.('Imported locally but cloud sync failed');
      });
    }
  }, [onSyncError]);

  return {
    entries,
    syncing,
    addEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    getEntriesForDate,
    getEntriesForMonth,
    getFoodNames,
    isFirstIntroduction,
    recentNewAllergens,
  };
}
