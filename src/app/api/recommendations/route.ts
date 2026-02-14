import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/deepseek';
import { buildRecommendationsPrompt } from '@/lib/prompts';
import { Expense, ExpenseCategory, SpendingSummary } from '@/types';

function buildSummary(expenses: Expense[], period: string): SpendingSummary {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = expenses.length;

  // Calculate date range for average daily spend
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const days = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
  const avgDaily = total / days;

  // Group by category
  const catMap = new Map<ExpenseCategory, { total: number; count: number }>();
  for (const e of expenses) {
    const existing = catMap.get(e.category) || { total: 0, count: 0 };
    catMap.set(e.category, {
      total: existing.total + e.amount,
      count: existing.count + 1,
    });
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Top 3 expenses
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((e) => ({
      description: e.description,
      amount: e.amount,
      category: e.category,
    }));

  return { total, transactionCount, avgDaily, period, byCategory, topExpenses };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured. Add DEEPSEEK_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { expenses, period = 'all time' } = body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses provided' }, { status: 400 });
    }

    const summary = buildSummary(expenses, period);
    const { system, user } = buildRecommendationsPrompt(summary);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek');
    }

    const parsed = JSON.parse(content);
    const recommendations = (parsed.recommendations || []).map(
      (r: { title: string; description: string; potentialSavings?: string; priority?: string; category?: string }, i: number) => ({
        id: `rec-${Date.now()}-${i}`,
        title: r.title || 'Recommendation',
        description: r.description || '',
        potentialSavings: r.potentialSavings,
        priority: ['high', 'medium', 'low'].includes(r.priority || '') ? r.priority : 'medium',
        category: r.category,
      })
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Please try again.' },
      { status: 500 }
    );
  }
}
