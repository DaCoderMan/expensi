'use client';

import { useState, useCallback } from 'react';
import { parseCsvFile } from '@/lib/csv-parser';
import { RawExpenseInput, Expense, ExpenseCategory } from '@/types';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORY_LABELS } from '@/lib/constants';
import CategoryBadge from './CategoryBadge';

interface ParsedRow extends RawExpenseInput {
  aiCategory?: ExpenseCategory;
}

export default function CsvUploader() {
  const { addExpenses } = useExpenses();
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; message: string }[]>([]);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please upload a CSV file.' });
      return;
    }
    setMessage(null);
    setIsImported(false);
    const result = await parseCsvFile(file);
    setParsedRows(result.expenses);
    setParseErrors(result.errors);

    if (result.expenses.length === 0 && result.errors.length > 0) {
      setMessage({ type: 'error', text: result.errors[0].message });
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleCategorize() {
    setIsCategorizing(true);
    setMessage(null);

    const BATCH_SIZE = 30;
    const updated = [...parsedRows];

    try {
      for (let i = 0; i < updated.length; i += BATCH_SIZE) {
        const batch = updated.slice(i, i + BATCH_SIZE);
        const res = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenses: batch.map((e) => ({ description: e.description, amount: e.amount })),
          }),
        });
        const data = await res.json();
        if (data.categorizations) {
          for (const cat of data.categorizations) {
            const globalIdx = i + cat.index;
            if (globalIdx < updated.length) {
              updated[globalIdx] = { ...updated[globalIdx], aiCategory: cat.category };
            }
          }
        }
      }
      setParsedRows(updated);
      setMessage({ type: 'success', text: 'Categorization complete! Review and import below.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to categorize. You can still import with default categories.' });
    }

    setIsCategorizing(false);
  }

  function handleImport() {
    const expenses: Expense[] = parsedRows.map((row) => ({
      id: crypto.randomUUID(),
      description: row.description,
      amount: row.amount,
      date: row.date,
      category: (row.aiCategory || row.category || 'other') as ExpenseCategory,
      isAutoCategorized: !!row.aiCategory,
      source: 'csv',
      notes: row.notes,
      createdAt: new Date().toISOString(),
    }));

    addExpenses(expenses);
    setIsImported(true);
    setMessage({ type: 'success', text: `Successfully imported ${expenses.length} expenses!` });
  }

  function handleReset() {
    setParsedRows([]);
    setParseErrors([]);
    setIsImported(false);
    setMessage(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Import from CSV</h3>
          <p className="text-xs text-muted">Upload your bank statement or expense file</p>
        </div>
      </div>

      {parsedRows.length === 0 && !isImported ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive ? 'border-primary bg-primary-light/50 scale-[1.01]' : 'border-border hover:border-muted-light'
          }`}
        >
          <svg className="w-12 h-12 mx-auto text-muted-light mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-muted mb-3">Drag & drop your CSV file here, or</p>
          <label className="inline-block px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            Browse Files
            <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
          </label>
          <p className="text-xs text-muted-light mt-4">
            CSV should have columns for description and amount. Date and category are optional.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-primary-light text-primary text-sm font-medium">
                {parsedRows.length} rows
              </span>
              {parseErrors.length > 0 && (
                <span className="text-xs text-warning">{parseErrors.length} skipped</span>
              )}
            </div>
            <div className="flex gap-2">
              {!isImported && (
                <>
                  <button
                    onClick={handleCategorize}
                    disabled={isCategorizing}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isCategorizing ? 'Categorizing...' : 'AI Categorize'}
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Import All
                  </button>
                </>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-foreground rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {isImported ? 'Upload Another' : 'Cancel'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border/60 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-primary-light/20">
                    <td className="px-4 py-3 text-muted font-mono text-xs">{row.date}</td>
                    <td className="px-4 py-3 font-medium">{row.description}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">${row.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {row.aiCategory ? (
                        <CategoryBadge category={row.aiCategory} />
                      ) : row.category ? (
                        <span className="text-muted text-xs">{CATEGORY_LABELS[row.category as ExpenseCategory] || row.category}</span>
                      ) : (
                        <span className="text-muted-light text-xs italic">Uncategorized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 20 && (
              <p className="px-4 py-2.5 text-xs text-muted bg-gray-50/50 border-t border-border/30">
                Showing 20 of {parsedRows.length} rows
              </p>
            )}
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
          {message.text}
        </div>
      )}
    </div>
  );
}
