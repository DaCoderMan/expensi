'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { useSubscription } from '@/hooks/useSubscription';
import SpendingSummaryCards from '@/components/dashboard/SpendingSummaryCards';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function DashboardPage() {
  const { expenses, isHydrated } = useExpenses();
  const { isInTrial, trialExpired, trialEndsAt } = useSubscription();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-muted/30 border-t-primary" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Welcome to Expensi"
        description="Start tracking your expenses by importing a CSV file or adding them manually. Get AI-powered insights to optimize your spending."
        action={
          <Link
            href="/import"
            className="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Get Started
          </Link>
        }
      />
    );
  }

  const trialDaysLeft = isInTrial && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Your spending overview at a glance</p>
        <p className="text-xs text-muted mt-2 italic">
          Expensi is a personal tool, not a professional accounting or financial device. Consult a professional for tax or investment advice.
        </p>
      </div>

      {isInTrial && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-amber-700 dark:text-amber-400">Free trial</span>
              {' — '}
              {trialDaysLeft === 0 ? 'Last day' : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`}. After that, upgrade to PRO for unlimited expenses and AI features.
            </p>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Upgrade to PRO
            </Link>
          </div>
        </Card>
      )}

      {trialExpired && (
        <Card className="border-amber-300 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Your trial has ended.</span>
              {' '}Upgrade to PRO for unlimited expenses, AI insights, and file import.
            </p>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Pay to continue — $9.99/mo
            </Link>
          </div>
        </Card>
      )}

      <SpendingSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CategoryPieChart />
        </Card>
        <Card>
          <MonthlyBarChart />
        </Card>
      </div>

      <Card>
        <RecentExpenses />
      </Card>
    </div>
  );
}
