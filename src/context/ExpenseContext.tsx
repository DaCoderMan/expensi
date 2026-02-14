'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import { Expense, ExpenseCategory, ExpenseFilters } from '@/types';
import { LOCAL_STORAGE_KEY } from '@/lib/constants';

interface ExpenseState {
  expenses: Expense[];
  filters: ExpenseFilters;
}

type ExpenseAction =
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_EXPENSES'; payload: Expense[] }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<ExpenseFilters> };

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'ADD_EXPENSES':
      return { ...state, expenses: [...action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

const initialFilters: ExpenseFilters = {
  sortBy: 'date',
  sortOrder: 'desc',
};

interface ExpenseContextValue {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filters: ExpenseFilters;
  isHydrated: boolean;
  totalSpending: number;
  expensesByCategory: { category: ExpenseCategory; total: number; count: number }[];
  monthlyTotals: { month: string; total: number }[];
  addExpense: (expense: Expense) => void;
  addExpenses: (expenses: Expense[]) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    filters: initialFilters,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_EXPENSES', payload: parsed });
        }
      }
    } catch (error) {
      console.error('Error loading expenses from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when expenses change (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  }, [state.expenses, isHydrated]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...state.expenses];
    const { category, dateFrom, dateTo, searchQuery, sortBy, sortOrder } = state.filters;

    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }
    if (dateFrom) {
      filtered = filtered.filter((e) => e.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((e) => e.date <= dateTo);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortBy === 'amount') cmp = a.amount - b.amount;
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return filtered;
  }, [state.expenses, state.filters]);

  const totalSpending = useMemo(
    () => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    [state.expenses]
  );

  const expensesByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, { total: number; count: number }>();
    for (const e of state.expenses) {
      const existing = map.get(e.category) || { total: 0, count: 0 };
      map.set(e.category, {
        total: existing.total + e.amount,
        count: existing.count + 1,
      });
    }
    return Array.from(map.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [state.expenses]);

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of state.expenses) {
      const month = e.date.slice(0, 7); // YYYY-MM
      map.set(month, (map.get(month) || 0) + e.amount);
    }
    return Array.from(map.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [state.expenses]);

  const addExpense = useCallback((expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  }, []);

  const addExpenses = useCallback((expenses: Expense[]) => {
    dispatch({ type: 'ADD_EXPENSES', payload: expenses });
  }, []);

  const updateExpense = useCallback((expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }, []);

  const setFilters = useCallback((filters: Partial<ExpenseFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const value: ExpenseContextValue = {
    expenses: state.expenses,
    filteredExpenses,
    filters: state.filters,
    isHydrated,
    totalSpending,
    expensesByCategory,
    monthlyTotals,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
    setFilters,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
