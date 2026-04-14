import { useState } from 'react';
import type { BabyProfile } from '../../utils/profile';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (profile: BabyProfile) => void;
  initialProfile: BabyProfile;
}

export default function SettingsModal({ open, onClose, onSave, initialProfile }: SettingsModalProps) {
  const [name, setName] = useState(initialProfile.babyName);
  const [dob, setDob] = useState(initialProfile.dob ?? '');
  const [startDate, setStartDate] = useState(initialProfile.startDate ?? '');

  if (!open) return null;

  const handleSave = () => {
    onSave({ babyName: name.trim() || 'Baby', dob: dob || undefined, startDate: startDate || undefined });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-stone-700">
          <h2 className="font-bold text-gray-800 dark:text-stone-100">Baby Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-stone-200 mb-1.5">
              Baby's name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Emma"
              className="w-full border border-gray-200 dark:border-stone-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-stone-100 bg-white dark:bg-stone-700 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-stone-200 mb-1.5">
              Date of birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full border border-gray-200 dark:border-stone-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-stone-100 bg-white dark:bg-stone-700 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-stone-200 mb-1.5">
              Solids start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-stone-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-stone-100 bg-white dark:bg-stone-700 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
            />
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 dark:border-stone-700">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={name.trim() === ''}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
