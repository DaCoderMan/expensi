'use client';

import { useState } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import { useExpenses } from '@/context/ExpenseContext';

export default function ManualEntryForm() {
  const { addExpense } = useExpenses();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory | 'auto'>('auto');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid description and amount.' });
      return;
    }

    setIsSubmitting(true);

    let finalCategory: ExpenseCategory = 'other';
    let isAutoCategorized = false;

    if (category === 'auto') {
      try {
        const res = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenses: [{ description: description.trim(), amount: parsedAmount }],
          }),
        });
        const data = await res.json();
        if (data.categorizations?.[0]) {
          finalCategory = data.categorizations[0].category;
          isAutoCategorized = true;
        }
      } catch {
        // Fall back to 'other' if AI fails
      }
    } else {
      finalCategory = category;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parsedAmount,
      date,
      category: finalCategory,
      isAutoCategorized,
      source: 'manual',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addExpense(expense);
    setMessage({ type: 'success', text: `Added${isAutoCategorized ? ` as ${CATEGORY_LABELS[finalCategory]}` : ''}!` });
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory('auto');
    setNotes('');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Quick Add</h3>
          <p className="text-xs text-muted">Add a single expense</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Grocery shopping"
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory | 'auto')}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
          >
            <option value="auto">Auto-detect (AI)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Notes <span className="text-muted font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white resize-none"
          />
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
        }`}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {message.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Adding...
          </span>
        ) : (
          'Add Expense'
        )}
      </button>
    </form>
  );
}
