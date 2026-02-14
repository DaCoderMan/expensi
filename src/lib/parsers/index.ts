import { ParseResult, ImportFileType } from '@/types';
import { parseCsvFile } from './csv-parser';
import { parseExcelFile } from './excel-parser';
import { parseJsonFile } from './json-parser';
import { parseOfxFile } from './ofx-parser';

const EXTENSION_MAP: Record<string, ImportFileType> = {
  csv: 'csv',
  xlsx: 'excel',
  xls: 'excel',
  json: 'json',
  ofx: 'ofx',
  qfx: 'ofx',
  pdf: 'pdf',
};

const MAX_FILE_SIZES: Record<ImportFileType, number> = {
  csv: 10 * 1024 * 1024,
  excel: 10 * 1024 * 1024,
  json: 5 * 1024 * 1024,
  ofx: 5 * 1024 * 1024,
  pdf: 20 * 1024 * 1024,
};

const FILE_TYPE_LABELS: Record<ImportFileType, string> = {
  csv: 'CSV',
  excel: 'Excel',
  pdf: 'PDF',
  json: 'JSON',
  ofx: 'OFX/QFX',
};

export const ACCEPTED_FILE_INPUT = '.csv,.xlsx,.xls,.json,.ofx,.qfx,.pdf';

export function getFileTypeLabel(type: ImportFileType): string {
  return FILE_TYPE_LABELS[type] || type.toUpperCase();
}

export function detectFileType(file: File): ImportFileType | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_MAP[ext] || null;
}

export function validateFileSize(file: File, fileType: ImportFileType): string | null {
  const max = MAX_FILE_SIZES[fileType];
  if (file.size > max) {
    return `File too large. Maximum size for ${FILE_TYPE_LABELS[fileType]} is ${max / (1024 * 1024)}MB.`;
  }
  return null;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const fileType = detectFileType(file);
  if (!fileType) {
    return {
      expenses: [],
      errors: [{ row: 0, message: `Unsupported file type. Accepted formats: CSV, Excel (.xlsx/.xls), PDF, JSON, OFX/QFX.` }],
      totalRows: 0,
      fileType: 'csv',
    };
  }

  const sizeError = validateFileSize(file, fileType);
  if (sizeError) {
    return { expenses: [], errors: [{ row: 0, message: sizeError }], totalRows: 0, fileType };
  }

  switch (fileType) {
    case 'csv':
      return parseCsvFile(file);
    case 'excel':
      return parseExcelFile(file);
    case 'json':
      return parseJsonFile(file);
    case 'ofx':
      return parseOfxFile(file);
    case 'pdf':
      return parsePdfFile(file);
    default:
      return { expenses: [], errors: [{ row: 0, message: 'Unknown file type' }], totalRows: 0, fileType };
  }
}

async function parsePdfFile(file: File): Promise<ParseResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/import/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'PDF parsing failed' }));
      return {
        expenses: [],
        errors: [{ row: 0, message: err.error || 'Failed to parse PDF' }],
        totalRows: 0,
        fileType: 'pdf',
      };
    }

    const data = await res.json();
    return {
      expenses: data.expenses || [],
      errors: data.errors || [],
      totalRows: data.totalRows || data.expenses?.length || 0,
      fileType: 'pdf',
    };
  } catch (error) {
    return {
      expenses: [],
      errors: [{ row: 0, message: `PDF upload failed: ${error instanceof Error ? error.message : 'Network error'}` }],
      totalRows: 0,
      fileType: 'pdf',
    };
  }
}
