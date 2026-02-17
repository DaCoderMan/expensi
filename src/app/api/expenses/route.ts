import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';
import { User } from '@/models/User';
import { FREE_TIER_LIMIT } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const expenses = await Expense.find({ userId: session.user.id })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const mapped = expenses.map((e) => ({
    id: e._id.toString(),
    userId: e.userId,
    description: e.description,
    amount: e.amount,
    date: e.date,
    category: e.category,
    currency: e.currency || 'USD',
    isAutoCategorized: e.isAutoCategorized || false,
    source: e.source || 'manual',
    notes: e.notes,
    createdAt: e.createdAt,
  }));

  return NextResponse.json({ expenses: mapped });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  // Check free tier limit (premium or within trial = unlimited)
  const user = await User.findById(session.user.id).lean();
  const sub = (user && typeof user === 'object' && 'subscription' in user)
    ? (user.subscription as { tier?: string; trialEndsAt?: Date }) : null;
  const tier = sub?.tier || 'free';
  const inTrial = sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
  const isFreeTier = tier === 'free' && !inTrial;

  if (isFreeTier) {
    const count = await Expense.countDocuments({ userId: session.user.id });
    const body = await request.json();
    const incoming = Array.isArray(body.expenses) ? body.expenses.length : 1;

    if (count + incoming > FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: `Free plan limited to ${FREE_TIER_LIMIT} expenses. You have ${count}. Upgrade to PRO for unlimited.` },
        { status: 403 }
      );
    }
  }

  const body = await request.clone().json();

  // Support both single expense and batch import
  const expensesData = Array.isArray(body.expenses) ? body.expenses : [body];

  const docs = expensesData.map((e: Record<string, unknown>) => ({
    userId: session.user.id,
    description: e.description,
    amount: e.amount,
    date: e.date,
    category: e.category || 'other',
    currency: e.currency || 'USD',
    isAutoCategorized: e.isAutoCategorized || false,
    source: e.source || 'manual',
    notes: e.notes || undefined,
    createdAt: e.createdAt || new Date().toISOString(),
  }));

  const inserted = await Expense.insertMany(docs);

  const mapped = inserted.map((e) => ({
    id: e._id.toString(),
    userId: e.userId,
    description: e.description,
    amount: e.amount,
    date: e.date,
    category: e.category,
    currency: e.currency || 'USD',
    isAutoCategorized: e.isAutoCategorized,
    source: e.source,
    notes: e.notes,
    createdAt: e.createdAt,
  }));

  return NextResponse.json({ expenses: mapped }, { status: 201 });
}
