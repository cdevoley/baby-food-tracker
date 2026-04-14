export type BabyProfile = {
  babyName: string;
  dob?: string;       // ISO date string, e.g. '2024-01-15'
  startDate?: string; // ISO date string — when solids started
};

const KEY = 'baby-food-tracker-profile';

export function loadProfile(): BabyProfile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { babyName: 'Baby' };
  } catch {
    return { babyName: 'Baby' };
  }
}

export function saveProfile(profile: BabyProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}
