'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ExpenseCategory, CurrencyCode } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import { useExpenses } from '@/context/ExpenseContext';
import { CURRENCIES, validateAmount, findDuplicates, roundAmount, formatCurrency, AmountWarning, DuplicateMatch } from '@/lib/validation';
import { getAllPresets } from '@/lib/presets';

const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export default function ManualEntryForm() {
  const { addExpense, expenses } = useExpenses();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory | 'auto'>('auto');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const presetsPanelRef = useRef<HTMLDivElement>(null);

  // Smart math warnings
  const [amountWarnings, setAmountWarnings] = useState<AmountWarning[]>([]);
  // Duplicate detection
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [dismissedDuplicates, setDismissedDuplicates] = useState(false);

  const presets = useMemo(() => getAllPresets(), []);

  // Validate amount in real time
  useEffect(() => {
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountWarnings(validateAmount(parsed));
    } else {
      setAmountWarnings([]);
    }
  }, [amount]);

  // Check for duplicates when description/amount/date change
  useEffect(() => {
    const parsed = parseFloat(amount);
    if (description.trim() && !isNaN(parsed) && parsed > 0 && date) {
      const matches = findDuplicates(
        { description: description.trim(), amount: parsed, date },
        expenses
      );
      setDuplicates(matches);
      setDismissedDuplicates(false);
    } else {
      setDuplicates([]);
    }
  }, [description, amount, date, expenses]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowPresets(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!showPresets) return;
    function handleClickOutside(e: MouseEvent) {
      if (presetsPanelRef.current && !presetsPanelRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPresets]);

  function applyPreset(preset: { description: string; amount: number; category: ExpenseCategory; currency: CurrencyCode; notes?: string }) {
    setDescription(preset.description);
    setAmount(preset.amount.toFixed(2));
    setCategory(preset.category);
    setCurrency(preset.currency);
    setNotes(preset.notes || '');
    setShowPresets(false);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid description and amount.' });
      return;
    }

    // Warn about duplicates if not dismissed
    if (duplicates.length > 0 && !dismissedDuplicates) {
      setMessage({ type: 'error', text: 'Possible duplicate detected! Review the warning below or dismiss it to proceed.' });
      return;
    }

    setIsSubmitting(true);

    const finalAmount = roundAmount(parsedAmount);
    let finalCategory: ExpenseCategory = 'other';
    let isAutoCategorized = false;

    if (category === 'auto') {
      try {
        const res = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenses: [{ description: description.trim(), amount: finalAmount }],
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

    try {
      await addExpense({
        description: description.trim(),
        amount: finalAmount,
        date,
        category: finalCategory,
        currency,
        isAutoCategorized,
        source: 'manual',
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: `Added ${formatCurrency(finalAmount, currency)}${isAutoCategorized ? ` as ${CATEGORY_LABELS[finalCategory]}` : ''}!` });
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory('auto');
      setNotes('');
      setDuplicates([]);
      setDismissedDuplicates(false);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add expense.' });
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
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
        <div ref={presetsPanelRef} className="relative">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Presets
          </button>
          {/* Preset Quick-Select */}
          {showPresets && (
            <div className="absolute right-0 top-full mt-2 z-10 w-48 flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border/60 animate-fade-in shadow-lg">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-card border border-border/60 rounded-lg text-left hover:border-primary hover:bg-primary-light/30 transition-all text-xs group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary min-w-0 flex-1">{preset.name}</span>
                  <span className="text-muted font-semibold tabular-nums shrink-0">${preset.amount.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
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
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background"
            required
          />
        </div>

        {/* Amount + Currency row */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Amount</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="px-3 py-2.5 border border-border rounded-xl text-sm bg-background w-24 shrink-0"
            >
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].symbol} {code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background"
              required
            />
          </div>
          {amount !== '' && (parseFloat(amount) <= 0 || Number.isNaN(parseFloat(amount))) && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">Amount must be greater than 0</p>
          )}

          {/* Smart math warnings */}
          {amountWarnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {amountWarnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-xs"
                >
                  <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-amber-700 dark:text-amber-300">{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background dark:bg-gray-800 dark:text-foreground dark:[color-scheme:dark]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory | 'auto')}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background"
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
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background resize-none"
          />
        </div>
      </div>

      {/* Duplicate warning */}
      {duplicates.length > 0 && !dismissedDuplicates && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 animate-fade-in">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Possible duplicate{duplicates.length > 1 ? 's' : ''} found</p>
              {duplicates.slice(0, 2).map((d, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-1 truncate">{d.reason}</p>
              ))}
              <button
                type="button"
                onClick={() => setDismissedDuplicates(true)}
                className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
              >
                Dismiss &amp; add anyway
              </button>
            </div>
          </div>
        </div>
      )}

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
          <span className="flex-1">{message.text}</span>
          {message.type === 'error' && message.text.includes('sign in') && (
            <Link href="/auth/signin" className="shrink-0 font-semibold underline hover:no-underline">Sign in</Link>
          )}
          <button type="button" onClick={() => setMessage(null)} className="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" aria-label="Dismiss">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
