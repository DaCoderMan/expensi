import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/deepseek';
import { buildCategorizationPrompt } from '@/lib/prompts';
import { CATEGORIES } from '@/lib/constants';
import { ExpenseCategory } from '@/types';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured. Add DEEPSEEK_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const expenses = body.expenses;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses provided' }, { status: 400 });
    }

    if (expenses.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 expenses per request' }, { status: 400 });
    }

    const { system, user } = buildCategorizationPrompt(expenses);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek');
    }

    const parsed = JSON.parse(content);
    const categorizations = (parsed.categorizations || []).map(
      (c: { index: number; category: string; confidence: number }) => ({
        index: c.index,
        category: CATEGORIES.includes(c.category as ExpenseCategory)
          ? c.category
          : 'other',
        confidence: Math.min(1, Math.max(0, c.confidence || 0.5)),
      })
    );

    return NextResponse.json({ categorizations });
  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize expenses. Please try again.' },
      { status: 500 }
    );
  }
}
