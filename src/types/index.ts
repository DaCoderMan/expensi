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

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  isAutoCategorized: boolean;
  source: 'manual' | 'csv';
  notes?: string;
  createdAt: string;
}

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
