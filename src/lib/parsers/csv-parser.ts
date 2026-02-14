import Papa from 'papaparse';
import { RawExpenseInput, ParseResult } from '@/types';
import {
  findColumn,
  parseDate,
  parseAmount,
  AMOUNT_COLUMNS,
  DESCRIPTION_COLUMNS,
  DATE_COLUMNS,
  CATEGORY_COLUMNS,
} from './utils';

export function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        if (!results.data.length || !results.meta.fields?.length) {
          resolve({ expenses: [], errors: [{ row: 0, message: 'No data found in CSV' }], totalRows: 0, fileType: 'csv' });
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
            fileType: 'csv',
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

        resolve({ expenses, errors, totalRows: results.data.length, fileType: 'csv' });
      },
      error(error: Error) {
        resolve({ expenses: [], errors: [{ row: 0, message: error.message }], totalRows: 0, fileType: 'csv' });
      },
    });
  });
}
