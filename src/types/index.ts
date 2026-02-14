export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'shopping'
  | 'subscriptions'
  | 'travel'
  | 'personal'
  | 'other';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'BRL' | 'MXN' | 'NGN';

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  currency: CurrencyCode;
  isAutoCategorized: boolean;
  source: 'manual' | 'csv' | 'excel' | 'pdf' | 'json' | 'ofx';
  notes?: string;
  createdAt: string;
  /** If recurring, the ID of the recurring rule that created this */
  recurringRuleId?: string;
}

export interface ExpensePreset {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  currency: CurrencyCode;
  notes?: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  currency: CurrencyCode;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextDue: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'premium';

export interface UserSubscription {
  tier: SubscriptionTier;
  paypalSubscriptionId?: string;
  paypalPayerId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
}

export const FREE_TIER_LIMIT = 50;

export interface RawExpenseInput {
  description: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
}

export interface CategorizationRequest {
  expenses: { description: string; amount: number }[];
}

export interface CategorizationResponse {
  categorizations: {
    index: number;
    category: ExpenseCategory;
    confidence: number;
  }[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings?: string;
  priority: 'high' | 'medium' | 'low';
  category?: ExpenseCategory;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export type ImportFileType = 'csv' | 'excel' | 'pdf' | 'json' | 'ofx';

export interface ParseResult {
  expenses: RawExpenseInput[];
  errors: { row: number; message: string }[];
  totalRows: number;
  fileType: ImportFileType;
}

export interface SpendingSummary {
  total: number;
  transactionCount: number;
  avgDaily: number;
  period: string;
  byCategory: {
    category: ExpenseCategory;
    total: number;
    percentage: number;
    count: number;
  }[];
  topExpenses: {
    description: string;
    amount: number;
    category: ExpenseCategory;
  }[];
}
