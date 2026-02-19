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
      <div className="space-y-8 animate-fade-in">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Financi AI</h1>
          <p className="text-sm text-muted">Follow these steps to start tracking your spending.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link href="/import" className="group">
            <Card className="h-full text-center hover:border-primary/40 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <h3 className="font-semibold text-foreground text-sm">Import or Add</h3>
                <p className="text-xs text-muted">Upload a file or add expenses manually</p>
              </div>
            </Card>
          </Link>

          <Card className="h-full text-center opacity-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                <span className="text-sm font-bold text-muted">2</span>
              </div>
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-semibold text-foreground text-sm">View Dashboard</h3>
              <p className="text-xs text-muted">See charts and spending summaries</p>
            </div>
          </Card>

          <Card className="h-full text-center opacity-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                <span className="text-sm font-bold text-muted">3</span>
              </div>
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-semibold text-foreground text-sm">Get AI Insights</h3>
              <p className="text-xs text-muted">Personalized savings recommendations</p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Link
            href="/import"
            className="inline-flex items-center gap-2 px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Expense
          </Link>
        </div>
      </div>
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
