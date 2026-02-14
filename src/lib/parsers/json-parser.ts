import { RawExpenseInput, ParseResult } from '@/types';
import { parseDate, parseAmount } from './utils';

export async function parseJsonFile(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return { expenses: [], errors: [{ row: 0, message: 'Invalid JSON file. Could not parse contents.' }], totalRows: 0, fileType: 'json' };
    }

    // Accept [...] or { "expenses": [...] } or { "transactions": [...] } or { "data": [...] }
    let items: unknown[];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const arr = obj.expenses || obj.transactions || obj.data || obj.items;
      if (Array.isArray(arr)) {
        items = arr;
      } else {
        return {
          expenses: [],
          errors: [{ row: 0, message: 'JSON must be an array of expenses or an object with an "expenses", "transactions", "data", or "items" array.' }],
          totalRows: 0,
          fileType: 'json',
        };
      }
    } else {
      return {
        expenses: [],
        errors: [{ row: 0, message: 'JSON must be an array or object containing expense data.' }],
        totalRows: 0,
        fileType: 'json',
      };
    }

    if (items.length === 0) {
      return { expenses: [], errors: [{ row: 0, message: 'No expense entries found in JSON.' }], totalRows: 0, fileType: 'json' };
    }

    const expenses: RawExpenseInput[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown> | null;
      if (!item || typeof item !== 'object') {
        errors.push({ row: i + 1, message: 'Entry is not an object' });
        continue;
      }

      // Flexible field names
      const rawDesc = item.description || item.desc || item.name || item.memo || item.merchant || item.payee;
      const rawAmount = item.amount || item.total || item.price || item.cost || item.value;
      const rawDate = item.date || item.transaction_date || item.posted_date;

      const description = typeof rawDesc === 'string' ? rawDesc.trim() : '';
      const amount = parseAmount(rawAmount);
      const dateStr = rawDate ? String(rawDate) : '';
      const date = dateStr ? parseDate(dateStr) : new Date().toISOString().slice(0, 10);
      const category = typeof item.category === 'string' ? item.category.toLowerCase().trim() : undefined;
      const notes = typeof item.notes === 'string' ? item.notes : undefined;

      if (!description) {
        errors.push({ row: i + 1, message: 'Missing description' });
        continue;
      }
      if (amount === null || amount === 0) {
        errors.push({ row: i + 1, message: `Invalid amount: "${rawAmount}"` });
        continue;
      }

      expenses.push({
        description,
        amount,
        date: date || new Date().toISOString().slice(0, 10),
        category,
        notes,
      });
    }

    return { expenses, errors, totalRows: items.length, fileType: 'json' };
  } catch (error) {
    return {
      expenses: [],
      errors: [{ row: 0, message: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      totalRows: 0,
      fileType: 'json',
    };
  }
}
