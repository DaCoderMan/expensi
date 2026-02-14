import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { RecurringExpenseModel } from '@/models/Expense';
import type { RecurringFrequency } from '@/types';

/**
 * Computes the next due date given a frequency and a current date.
 * Accepts a date string in YYYY-MM-DD format and returns the next
 * occurrence in the same format.
 */
export function computeNextDue(frequency: RecurringFrequency, currentDate: string): string {
  const date = new Date(currentDate + 'T00:00:00Z');

  switch (frequency) {
    case 'daily':
      date.setUTCDate(date.getUTCDate() + 1);
      break;
    case 'weekly':
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case 'biweekly':
      date.setUTCDate(date.getUTCDate() + 14);
      break;
    case 'monthly':
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
    case 'yearly':
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/recurring
 * Returns all recurring expense rules for the authenticated user,
 * sorted by nextDue ascending (soonest first).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const rules = await RecurringExpenseModel.find({ userId: session.user.id })
    .sort({ nextDue: 1 })
    .lean();

  const mapped = rules.map((r) => ({
    id: r._id.toString(),
    userId: r.userId,
    name: r.name,
    description: r.description,
    amount: r.amount,
    category: r.category,
    currency: r.currency || 'USD',
    frequency: r.frequency,
    startDate: r.startDate,
    endDate: r.endDate || undefined,
    nextDue: r.nextDue,
    isActive: r.isActive,
    notes: r.notes || undefined,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ recurringExpenses: mapped });
}

const VALID_FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/recurring
 * Creates a new recurring expense rule for the authenticated user.
 *
 * Required body fields: name, description, amount, category, frequency, startDate
 * Optional body fields: currency, endDate, notes, isActive
 *
 * The nextDue field is automatically computed from startDate and frequency.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, description, amount, category, frequency, startDate, endDate, currency, notes, isActive } = body;

  // Validate required fields
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
  }
  if (!description || typeof description !== 'string') {
    return NextResponse.json({ error: 'description is required and must be a string' }, { status: 400 });
  }
  if (amount == null || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount is required and must be a positive number' }, { status: 400 });
  }
  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'category is required and must be a string' }, { status: 400 });
  }
  if (!frequency || !VALID_FREQUENCIES.includes(frequency as RecurringFrequency)) {
    return NextResponse.json(
      { error: `frequency is required and must be one of: ${VALID_FREQUENCIES.join(', ')}` },
      { status: 400 }
    );
  }
  if (!startDate || typeof startDate !== 'string' || !DATE_REGEX.test(startDate)) {
    return NextResponse.json({ error: 'startDate is required in YYYY-MM-DD format' }, { status: 400 });
  }
  if (endDate !== undefined && endDate !== null) {
    if (typeof endDate !== 'string' || !DATE_REGEX.test(endDate)) {
      return NextResponse.json({ error: 'endDate must be in YYYY-MM-DD format if provided' }, { status: 400 });
    }
    if (endDate < startDate) {
      return NextResponse.json({ error: 'endDate must not be before startDate' }, { status: 400 });
    }
  }

  await connectDB();

  // Compute the initial nextDue from the startDate.
  // If startDate is in the future, it is itself the first due date.
  // Otherwise, advance from startDate until we reach a future (or today) date.
  const today = new Date().toISOString().slice(0, 10);
  let nextDue = startDate as string;
  while (nextDue < today) {
    nextDue = computeNextDue(frequency as RecurringFrequency, nextDue);
  }

  const doc = await RecurringExpenseModel.create({
    userId: session.user.id,
    name,
    description,
    amount,
    category,
    currency: currency || 'USD',
    frequency,
    startDate,
    endDate: endDate || undefined,
    nextDue,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    notes: notes || undefined,
  });

  const created = {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    amount: doc.amount,
    category: doc.category,
    currency: doc.currency,
    frequency: doc.frequency,
    startDate: doc.startDate,
    endDate: doc.endDate || undefined,
    nextDue: doc.nextDue,
    isActive: doc.isActive,
    notes: doc.notes || undefined,
    createdAt: doc.createdAt,
  };

  return NextResponse.json({ recurringExpense: created }, { status: 201 });
}

/**
 * DELETE /api/recurring
 * Deletes a recurring expense rule by ruleId, if owned by the authenticated user.
 *
 * Required body field: ruleId
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ruleId } = body;

  if (!ruleId || typeof ruleId !== 'string') {
    return NextResponse.json({ error: 'ruleId is required and must be a string' }, { status: 400 });
  }

  await connectDB();

  const deleted = await RecurringExpenseModel.findOneAndDelete({
    _id: ruleId,
    userId: session.user.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: 'Recurring rule not found or not owned by user' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Recurring rule deleted', id: ruleId });
}
