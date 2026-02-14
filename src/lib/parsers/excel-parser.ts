import * as XLSX from 'xlsx';
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

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return { expenses: [], errors: [{ row: 0, message: 'No sheets found in Excel file' }], totalRows: 0, fileType: 'excel' };
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (!rows.length) {
      return { expenses: [], errors: [{ row: 0, message: 'No data found in Excel file' }], totalRows: 0, fileType: 'excel' };
    }

    const headers = Object.keys(rows[0]);
    const amountCol = findColumn(headers, AMOUNT_COLUMNS);
    const descCol = findColumn(headers, DESCRIPTION_COLUMNS);
    const dateCol = findColumn(headers, DATE_COLUMNS);
    const catCol = findColumn(headers, CATEGORY_COLUMNS);

    if (!amountCol || !descCol) {
      return {
        expenses: [],
        errors: [{
          row: 0,
          message: `Could not find required columns. Found: ${headers.join(', ')}. Need at least an amount and description column.`,
        }],
        totalRows: 0,
        fileType: 'excel',
      };
    }

    const expenses: RawExpenseInput[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const amount = parseAmount(row[amountCol]);
      const description = row[descCol] ? String(row[descCol]).trim() : '';

      // Excel dates can be serial numbers - handle that
      let dateStr = '';
      if (dateCol && row[dateCol] != null) {
        const rawDate = row[dateCol];
        if (typeof rawDate === 'number') {
          // Excel serial date number
          const excelDate = XLSX.SSF.parse_date_code(rawDate);
          if (excelDate) {
            dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
          }
        } else {
          dateStr = String(rawDate);
        }
      }

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

    return { expenses, errors, totalRows: rows.length, fileType: 'excel' };
  } catch (error) {
    return {
      expenses: [],
      errors: [{ row: 0, message: `Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      totalRows: 0,
      fileType: 'excel',
    };
  }
}
