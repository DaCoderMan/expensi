'use client';

import { useExpenses } from '@/context/ExpenseContext';
import SpendingSummaryCards from '@/components/dashboard/SpendingSummaryCards';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function DashboardPage() {
  const { expenses, isHydrated } = useExpenses();

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Your spending overview at a glance</p>
      </div>

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
