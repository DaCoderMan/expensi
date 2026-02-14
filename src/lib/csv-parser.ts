import Papa from 'papaparse';
import { RawExpenseInput } from '@/types';

interface CsvParseResult {
  expenses: RawExpenseInput[];
  errors: { row: number; message: string }[];
  totalRows: number;
}

const AMOUNT_COLUMNS = ['amount', 'total', 'price', 'cost', 'value', 'debit'];
const DESCRIPTION_COLUMNS = ['description', 'desc', 'name', 'memo', 'details', 'merchant', 'payee', 'transaction'];
const DATE_COLUMNS = ['date', 'transaction_date', 'trans_date', 'posted_date', 'transaction date', 'posted date'];
const CATEGORY_COLUMNS = ['category', 'type', 'tag', 'group'];

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate);
    if (idx !== -1) return headers[idx];
  }
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const usMatch = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const shortMatch = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})$/);
  if (shortMatch) {
    const [, m, d, y] = shortMatch;
    const year = parseInt(y) > 50 ? `19${y}` : `20${y}`;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') return Math.abs(value);
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.abs(num);
}

export function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        if (!results.data.length || !results.meta.fields?.length) {
          resolve({ expenses: [], errors: [{ row: 0, message: 'No data found in CSV' }], totalRows: 0 });
          return;
        }

        const headers = results.meta.fields;
        const amountCol = findColumn(headers, AMOUNT_COLUMNS);
        const descCol = findColumn(headers, DESCRIPTION_COLUMNS);
        const dateCol = findColumn(headers, DATE_COLUMNS);
        const catCol = findColumn(headers, CATEGORY_COLUMNS);

        if (!amountCol || !descCol) {
          resolve({
            expenses: [],
            errors: [{
              row: 0,
              message: `Could not find required columns. Found: ${headers.join(', ')}. Need at least an amount and description column.`,
            }],
            totalRows: 0,
          });
          return;
        }

        const expenses: RawExpenseInput[] = [];
        const errors: { row: number; message: string }[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as Record<string, unknown>;
          const amount = parseAmount(row[amountCol]);
          const description = row[descCol] ? String(row[descCol]).trim() : '';
          const dateStr = dateCol ? String(row[dateCol] || '') : '';
          const date = dateStr ? parseDate(dateStr) : new Date().toISOString().slice(0, 10);
          const category = catCol ? String(row[catCol] || '').toLowerCase().trim() : undefined;

          if (amount === null || amount === 0) {
            errors.push({ row: i + 2, message: `Invalid amount: "${row[amountCol]}"` });
            continue;
          }
          if (!description) {
            errors.push({ row: i + 2, message: 'Empty description' });
            continue;
          }
          if (dateStr && !date) {
            errors.push({ row: i + 2, message: `Invalid date: "${dateStr}"` });
            continue;
          }

          expenses.push({
            description,
            amount,
            date: date || new Date().toISOString().slice(0, 10),
            category: category || undefined,
          });
        }

        resolve({ expenses, errors, totalRows: results.data.length });
      },
      error(error: Error) {
        resolve({ expenses: [], errors: [{ row: 0, message: error.message }], totalRows: 0 });
      },
    });
  });
}
