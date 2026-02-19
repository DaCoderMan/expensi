'use client';

import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseCategory, Expense, FREE_TIER_LIMIT } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import { useSubscription } from '@/hooks/useSubscription';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { CURRENCIES, CurrencyCode } from '@/lib/validation';
import CategoryBadge from '@/components/expenses/CategoryBadge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

function getCurrencySymbol(currency?: string): string {
  if (!currency) return '$';
  return CURRENCIES[currency as CurrencyCode]?.symbol || '$';
}

export default function ExpensesPage() {
  const { filteredExpenses, filters, setFilters, deleteExpense, updateExpense, clearAllExpenses, isHydrated } = useExpenses();
  const { isFree, expenseCount, isAtLimit, trialExpired } = useSubscription();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [isClearing, setIsClearing] = useState(false);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-muted/30 border-t-primary" />
      </div>
    );
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setEditForm({ description: expense.description, amount: expense.amount, date: expense.date, category: expense.category });
  }

  async function saveEdit(expense: Expense) {
    await updateExpense({
      ...expense,
      description: editForm.description || expense.description,
      amount: editForm.amount || expense.amount,
      date: editForm.date || expense.date,
      category: (editForm.category || expense.category) as ExpenseCategory,
    });
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) return;
    if (!confirm('This will permanently remove all your expense data. Continue?')) return;
    setIsClearing(true);
    try {
      await clearAllExpenses();
    } catch {
      // Error handled in context
    }
    setIsClearing(false);
  }

  if (filteredExpenses.length === 0 && !filters.category && !filters.searchQuery && !filters.dateFrom) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted mt-1">Manage and track all your transactions</p>
        </div>
        <EmptyState
          title="No expenses yet"
          description="Import a CSV file or add expenses manually to see your expense list."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/import" className="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
                Import Expenses
              </Link>
              <Link href="/import#quick-add" className="px-6 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                Add manually
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted mt-1">Manage and track all your transactions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/import#quick-add" className="flex items-center gap-1.5 px-3 py-2 bg-primary-light text-primary border border-primary/30 rounded-xl text-xs font-medium hover:bg-primary-light/80 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add manually
          </Link>
          {/* Export buttons */}
          {filteredExpenses.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(filteredExpenses)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button
                onClick={() => exportToPDF(filteredExpenses)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF
              </button>
            </>
          )}
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-danger border border-red-200 rounded-xl text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isClearing ? 'Clearing...' : 'Clear All'}
          </button>
          <Link
            href="/import"
            className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New
          </Link>
        </div>
      </div>

      {/* Trial ended — must pay */}
      {trialExpired && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-100 border border-amber-300 text-sm dark:bg-amber-900/30 dark:border-amber-700">
          <svg className="w-5 h-5 text-amber-600 shrink-0 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-900 font-medium dark:text-amber-200">
            Your free trial has ended. Pay to get PRO for unlimited expenses and AI features.{' '}
            <Link href="/pricing" className="text-primary underline font-bold">Upgrade now</Link>
          </p>
        </div>
      )}

      {/* Free Tier Limit Banner */}
      {isFree && isAtLimit && !trialExpired && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm">
          <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-800 font-medium">
            You&apos;ve reached the {FREE_TIER_LIMIT} expense limit on the free plan.{' '}
            <Link href="/pricing" className="text-primary underline font-bold">Upgrade to PRO</Link> for unlimited expenses.
          </p>
        </div>
      )}

      {isFree && !isAtLimit && expenseCount >= FREE_TIER_LIMIT * 0.8 && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-sm">
          <p className="text-blue-800">
            {expenseCount}/{FREE_TIER_LIMIT} expenses used.{' '}
            <Link href="/pricing" className="text-primary underline font-medium">Upgrade to PRO</Link> for unlimited.
          </p>
        </div>
      )}

      {/* Filters */}
      <Card className="!p-4">
        <div className="space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ searchQuery: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm bg-white"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ category: (e.target.value || undefined) as ExpenseCategory | undefined })}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white w-full"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white w-full"
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white w-full"
            />
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as ['date' | 'amount' | 'category', 'asc' | 'desc'];
                setFilters({ sortBy, sortOrder });
              }}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white w-full"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
              <option value="category-asc">Category (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted font-medium">
        {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-border/60 rounded-2xl bg-card shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Description</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Source</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border/30 last:border-0 hover:bg-primary-light/20 transition-colors">
                {editingId === expense.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input type="date" value={editForm.date || ''} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="px-2 py-1.5 border border-border rounded-lg text-sm w-full bg-white" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="px-2 py-1.5 border border-border rounded-lg text-sm w-full bg-white" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" value={editForm.amount || ''} onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })} className="px-2 py-1.5 border border-border rounded-lg text-sm w-24 text-right bg-white" step="0.01" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })} className="px-2 py-1.5 border border-border rounded-lg text-sm bg-white">
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted capitalize hidden md:table-cell">{expense.source}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => saveEdit(expense)} className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover mr-1.5">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-100 text-foreground rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3.5 text-muted whitespace-nowrap font-mono text-xs">{expense.date}</td>
                    <td className="px-4 py-3.5 font-medium text-foreground max-w-[200px] truncate">{expense.description}</td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                      {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                      {expense.currency && expense.currency !== 'USD' && (
                        <span className="text-muted text-[10px] ml-1">{expense.currency}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><CategoryBadge category={expense.category} /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        expense.source === 'csv' ? 'bg-accent-light text-accent' : 'bg-gray-100 text-muted'
                      }`}>
                        {expense.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(expense)} className="text-primary hover:text-primary-hover text-xs font-medium mr-2.5">Edit</button>
                      <button onClick={() => handleDelete(expense.id)} className="text-danger hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
