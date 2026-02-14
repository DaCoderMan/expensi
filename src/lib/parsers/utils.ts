export const AMOUNT_COLUMNS = ['amount', 'total', 'price', 'cost', 'value', 'debit'];
export const DESCRIPTION_COLUMNS = ['description', 'desc', 'name', 'memo', 'details', 'merchant', 'payee', 'transaction'];
export const DATE_COLUMNS = ['date', 'transaction_date', 'trans_date', 'posted_date', 'transaction date', 'posted date'];
export const CATEGORY_COLUMNS = ['category', 'type', 'tag', 'group'];

export function findColumn(headers: string[], candidates: string[]): string | null {
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

export function parseDate(value: string): string | null {
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

export function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') return Math.abs(value);
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.abs(num);
}
