'use client';

import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const { expenses, isHydrated } = useExpenses();
  const { isInTrial, trialExpired, trialEndsAt, isPremium } = useSubscription();

  if (status === 'loading' || !isHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-muted/30 border-t-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-12 animate-fade-in py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Smart Expense Tracking with AI</h1>
          <p className="text-lg text-muted mb-6">
            Track expenses, get AI-powered insights, and take control of your finances.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 mb-8">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Start with a 3-day free trial &mdash; all PRO features, no credit card
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 gradient-bg text-white rounded-xl text-base font-semibold hover:opacity-90 shadow-md transition-opacity"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 border border-border rounded-xl text-base font-semibold text-foreground hover:bg-muted/30 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: 'AI Categorization',
              desc: 'Expenses auto-categorized by AI',
              icon: (
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              title: 'File Import',
              desc: 'CSV, Excel, PDF, JSON, OFX/QFX',
              icon: (
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              ),
            },
            {
              title: 'Smart Insights',
              desc: 'AI-powered spending recommendations',
              icon: (
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
            },
          ].map((f) => (
            <Card key={f.title} className="text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Welcome to Financi AI"
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
          Financi AI is a personal tool, not a professional accounting or financial device. Consult a professional for tax or investment advice.
        </p>
      </div>

      {isInTrial && !isPremium && (
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
