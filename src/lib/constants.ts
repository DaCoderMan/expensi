import { ExpenseCategory } from '@/types';

export const CATEGORIES: ExpenseCategory[] = [
  'food',
  'transport',
  'housing',
  'entertainment',
  'utilities',
  'healthcare',
  'education',
  'shopping',
  'subscriptions',
  'travel',
  'personal',
  'other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#ef4444',
  transport: '#f97316',
  housing: '#eab308',
  entertainment: '#22c55e',
  utilities: '#06b6d4',
  healthcare: '#3b82f6',
  education: '#8b5cf6',
  shopping: '#ec4899',
  subscriptions: '#f43f5e',
  travel: '#14b8a6',
  personal: '#a855f7',
  other: '#6b7280',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  housing: 'Housing',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  education: 'Education',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
  travel: 'Travel',
  personal: 'Personal',
  other: 'Other',
};

export const LOCAL_STORAGE_KEY = 'claude-expense-tracker-data';
