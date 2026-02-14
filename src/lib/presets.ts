import { ExpensePreset, ExpenseCategory, CurrencyCode } from '@/types';

const STORAGE_KEY = 'expensi-custom-presets';

export const DEFAULT_PRESETS: ExpensePreset[] = [
  {
    id: 'preset-coffee',
    name: 'Coffee',
    description: 'Morning coffee',
    amount: 5.00,
    category: 'food' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-lunch',
    name: 'Lunch',
    description: 'Lunch meal',
    amount: 15.00,
    category: 'food' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-gas',
    name: 'Gas/Fuel',
    description: 'Gas station fill-up',
    amount: 50.00,
    category: 'transport' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-uber',
    name: 'Uber/Rideshare',
    description: 'Rideshare trip',
    amount: 12.00,
    category: 'transport' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-groceries',
    name: 'Groceries',
    description: 'Weekly groceries',
    amount: 75.00,
    category: 'food' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-netflix',
    name: 'Netflix',
    description: 'Monthly Netflix subscription',
    amount: 15.99,
    category: 'subscriptions' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-gym',
    name: 'Gym Membership',
    description: 'Monthly gym membership',
    amount: 30.00,
    category: 'personal' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-electric',
    name: 'Electric Bill',
    description: 'Monthly electric bill',
    amount: 120.00,
    category: 'utilities' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
  {
    id: 'preset-internet',
    name: 'Internet',
    description: 'Monthly internet service',
    amount: 60.00,
    category: 'utilities' as ExpenseCategory,
    currency: 'USD' as CurrencyCode,
  },
];

export function getCustomPresets(): ExpensePreset[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as ExpensePreset[];
  } catch {
    return [];
  }
}

export function saveCustomPresets(presets: ExpensePreset[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    console.error('Failed to save custom presets to localStorage');
  }
}

export function getAllPresets(): ExpensePreset[] {
  return [...DEFAULT_PRESETS, ...getCustomPresets()];
}

export function addCustomPreset(preset: Omit<ExpensePreset, 'id'>): ExpensePreset {
  const newPreset: ExpensePreset = {
    ...preset,
    id: crypto.randomUUID(),
  };
  const customPresets = getCustomPresets();
  customPresets.push(newPreset);
  saveCustomPresets(customPresets);
  return newPreset;
}

export function removeCustomPreset(id: string): void {
  const customPresets = getCustomPresets();
  const filtered = customPresets.filter((preset) => preset.id !== id);
  saveCustomPresets(filtered);
}
