import { useState } from 'react';
import type { FoodEntry } from '../../types';
import { ALLERGENS, ENJOYMENT_LEVELS, FOOD_CATEGORIES, AMOUNTS, TEXTURES, TIMES_OF_DAY, SYMPTOMS } from '../../utils/constants';

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete: (id: string) => void;
  onEdit?: (entry: FoodEntry) => void;
}

export default function FoodEntryCard({ entry, onDelete, onEdit }: FoodEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const category = FOOD_CATEGORIES.find(c => c.id === entry.foodCategory);
  const enjoyment = ENJOYMENT_LEVELS.find(e => e.id === entry.enjoyment);
  const amount = AMOUNTS.find(a => a.id === entry.amountEaten);
  const time = TIMES_OF_DAY.find(t => t.id === entry.timeOfDay);
  const texture = TEXTURES.find(t => t.id === entry.texture);
  const allergenLabels = entry.allergens.map(id => ALLERGENS.find(a => a.id === id)?.label).filter(Boolean);
  const symptomLabels = entry.symptoms.map(id => SYMPTOMS.find(s => s.id === id)?.label).filter(Boolean);

  return (
    <div className={`rounded-xl border p-3 transition-all ${entry.hadReaction ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700' : 'border-sage-100 bg-white dark:bg-stone-800 dark:border-stone-700'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{category?.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-gray-800 dark:text-stone-100 capitalize">{entry.foodName}</span>
              {entry.isFirstIntroduction && (
                <span className="chip bg-sage-100 text-sage-700">⭐ First try!</span>
              )}
              {entry.hadReaction && (
                <span className="chip bg-amber-100 text-amber-700">⚠️ Reaction</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-400 mt-0.5">
              <span>{entry.feedingTime ? `${entry.feedingTime} ${time?.emoji}` : `${time?.emoji} ${time?.label}`}</span>
              <span>·</span>
              <span className={`chip ${enjoyment?.color}`}>{enjoyment?.emoji} {enjoyment?.label}</span>
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(entry); }}
            aria-label="Edit entry"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex-shrink-0 transition-colors text-sm"
          >
            ✏️
          </button>
        )}
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-stone-200 p-1 flex-shrink-0 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-stone-700 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium">Texture</span>
              <p className="text-gray-700 dark:text-stone-200">{texture?.label}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium">Amount eaten</span>
              <p className="text-gray-700 dark:text-stone-200">{amount?.emoji} {amount?.label}</p>
            </div>
          </div>

          {allergenLabels.length > 0 && (
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium block mb-1">Contains allergens</span>
              <div className="flex flex-wrap gap-1">
                {allergenLabels.map(label => (
                  <span key={label} className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">{label}</span>
                ))}
              </div>
            </div>
          )}

          {entry.hadReaction && symptomLabels.length > 0 && (
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium block mb-1">Symptoms observed</span>
              <div className="flex flex-wrap gap-1">
                {symptomLabels.map(label => (
                  <span key={label} className="chip bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">{label}</span>
                ))}
              </div>
              {entry.reactionDelay && (
                <p className="text-xs text-red-500 mt-1">
                  Appeared: {entry.reactionDelay === 'immediate' ? 'Immediately' : entry.reactionDelay === 'within_hours' ? 'Within a few hours' : 'Next day'}
                </p>
              )}
            </div>
          )}

          {entry.nutrition && (
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium block mb-1">Nutrition (per 100g)</span>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { label: 'Cal', value: entry.nutrition.calories },
                  { label: 'Protein', value: `${entry.nutrition.protein}g` },
                  { label: 'Carbs', value: `${entry.nutrition.carbs}g` },
                  { label: 'Fat', value: `${entry.nutrition.fat}g` },
                  { label: 'Fiber', value: `${entry.nutrition.fiber}g` },
                ].map(item => (
                  <div key={item.label} className="bg-sage-50 dark:bg-stone-700 rounded-lg p-1.5">
                    <p className="text-xs font-semibold text-sage-700 dark:text-sage-400">{item.value}</p>
                    <p className="text-xs text-gray-400 dark:text-stone-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(entry.notes || entry.photoAnalysis) && (
            <div>
              <span className="text-gray-400 dark:text-stone-500 text-xs uppercase font-medium block mb-1">Notes</span>
              {entry.notes && <p className="text-sm text-gray-700 dark:text-stone-200">{entry.notes}</p>}
              {entry.photoAnalysis && (
                <p className="text-xs text-gray-400 dark:text-stone-400 mt-0.5 italic">📷 {entry.photoAnalysis}</p>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {confirmDelete ? (
              <div className="flex items-center justify-between gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 w-full">
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">Delete this entry?</span>
                <div className="flex gap-3">
                  <button onClick={() => onDelete(entry.id)} className="text-sm text-red-600 dark:text-red-400 font-semibold hover:underline">Yes, delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-500 dark:text-stone-400 hover:underline">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-400 hover:text-red-600 transition-colors">
                Delete entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
