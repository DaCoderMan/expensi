import { Schema, models, model } from 'mongoose';

const ExpenseSchema = new Schema({
  userId: { type: String, required: true, index: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  isAutoCategorized: { type: Boolean, default: false },
  source: { type: String, enum: ['manual', 'csv', 'excel', 'pdf', 'json', 'ofx'], default: 'manual' },
  notes: String,
  recurringRuleId: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
});

ExpenseSchema.index({ userId: 1, date: -1 });

export const Expense = models.Expense || model('Expense', ExpenseSchema);

const RecurringExpenseSchema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  frequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'], required: true },
  startDate: { type: String, required: true },
  endDate: String,
  nextDue: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  notes: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const RecurringExpenseModel = models.RecurringExpense || model('RecurringExpense', RecurringExpenseSchema);
