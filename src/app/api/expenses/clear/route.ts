import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const result = await Expense.deleteMany({ userId: session.user.id });

  return NextResponse.json({
    success: true,
    deletedCount: result.deletedCount,
  });
}
