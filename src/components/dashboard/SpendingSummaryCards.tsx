'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORY_LABELS } from '@/lib/constants';

const CARD_CONFIGS = [
  {
    key: 'total',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgClass: 'bg-primary-light',
    iconClass: 'text-primary',
  },
  {
    key: 'avg',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    bgClass: 'bg-accent-light',
    iconClass: 'text-accent',
  },
  {
    key: 'top',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bgClass: 'bg-warning-light',
    iconClass: 'text-warning',
  },
  {
    key: 'categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    bgClass: 'bg-success-light',
    iconClass: 'text-success',
  },
];

export default function SpendingSummaryCards() {
  const { expenses, totalSpending, expensesByCategory } = useExpenses();

  const avgPerDay = expenses.length > 0
    ? (() => {
        const dates = expenses.map((e) => new Date(e.date).getTime());
        const days = Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)));
        return totalSpending / days;
      })()
    : 0;

  const topCategory = expensesByCategory[0];

  const cards = [
    {
      ...CARD_CONFIGS[0],
      label: 'Total Spending',
      value: `$${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${expenses.length} transactions`,
    },
    {
      ...CARD_CONFIGS[1],
      label: 'Daily Average',
      value: `$${avgPerDay.toFixed(2)}`,
      sub: 'per day',
    },
    {
      ...CARD_CONFIGS[2],
      label: 'Top Category',
      value: topCategory ? CATEGORY_LABELS[topCategory.category] : 'N/A',
      sub: topCategory ? `$${topCategory.total.toFixed(2)} spent` : 'No data',
    },
    {
      ...CARD_CONFIGS[3],
      label: 'Categories',
      value: String(expensesByCategory.length),
      sub: `of 12 tracked`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm animate-slide-up"
          style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${card.bgClass} rounded-xl flex items-center justify-center`}>
              <span className={card.iconClass}>{card.icon}</span>
            </div>
            <p className="text-sm font-medium text-muted">{card.label}</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-light mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
