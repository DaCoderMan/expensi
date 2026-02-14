'use client';

import { useExpenses } from '@/context/ExpenseContext';
import CategoryBadge from '@/components/expenses/CategoryBadge';
import Link from 'next/link';

export default function RecentExpenses() {
  const { expenses } = useExpenses();

  const recent = [...expenses]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Expenses</h3>
        <Link href="/expenses" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Description</th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-border/30 last:border-0 hover:bg-primary-light/30 transition-colors"
              >
                <td className="px-4 sm:px-6 py-3.5 text-muted whitespace-nowrap font-mono text-xs">{expense.date}</td>
                <td className="px-4 sm:px-6 py-3.5 font-medium text-foreground max-w-[180px] truncate">{expense.description}</td>
                <td className="px-4 sm:px-6 py-3.5 text-right font-semibold tabular-nums">${expense.amount.toFixed(2)}</td>
                <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                  <CategoryBadge category={expense.category} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
