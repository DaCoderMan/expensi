'use client';

import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseCategory, Expense } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import CategoryBadge from '@/components/expenses/CategoryBadge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export default function ExpensesPage() {
  const { filteredExpenses, filters, setFilters, deleteExpense, updateExpense, isHydrated } = useExpenses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

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

  function saveEdit(expense: Expense) {
    updateExpense({
      ...expense,
      description: editForm.description || expense.description,
      amount: editForm.amount || expense.amount,
      date: editForm.date || expense.date,
      category: (editForm.category || expense.category) as ExpenseCategory,
    });
    setEditingId(null);
    setEditForm({});
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
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
            <Link href="/import" className="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
              Import Expenses
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted mt-1">Manage and track all your transactions</p>
        </div>
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
      <div className="overflow-x-auto border border-border/60 rounded-2xl bg-white shadow-sm">
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
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">${expense.amount.toFixed(2)}</td>
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
