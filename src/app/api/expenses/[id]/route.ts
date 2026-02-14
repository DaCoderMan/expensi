import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const expense = await Expense.findById(id);
  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }
  if (expense.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.description !== undefined) updates.description = body.description;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.date !== undefined) updates.date = body.date;
  if (body.category !== undefined) updates.category = body.category;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.isAutoCategorized !== undefined) updates.isAutoCategorized = body.isAutoCategorized;

  const updated = await Expense.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({
    expense: {
      id: updated._id.toString(),
      userId: updated.userId,
      description: updated.description,
      amount: updated.amount,
      date: updated.date,
      category: updated.category,
      isAutoCategorized: updated.isAutoCategorized,
      source: updated.source,
      notes: updated.notes,
      createdAt: updated.createdAt,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const expense = await Expense.findById(id);
  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }
  if (expense.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Expense.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
