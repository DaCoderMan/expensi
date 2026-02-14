import { Expense } from '@/types';

// ---------------------------------------------------------------------------
// Currency Support
// ---------------------------------------------------------------------------

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { symbol: '\u20ac', name: 'Euro', rate: 0.92 },
  GBP: { symbol: '\u00a3', name: 'British Pound', rate: 0.79 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  JPY: { symbol: '\u00a5', name: 'Japanese Yen', rate: 149.5 },
  INR: { symbol: '\u20b9', name: 'Indian Rupee', rate: 83.1 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', rate: 4.97 },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', rate: 17.15 },
  NGN: { symbol: '\u20a6', name: 'Nigerian Naira', rate: 1550 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Convert an amount from a given currency to USD using the stored exchange
 * rates. The result is rounded to 2 decimal places.
 */
export function convertToUSD(amount: number, fromCurrency: CurrencyCode): number {
  const rate = CURRENCIES[fromCurrency].rate;
  return roundAmount(amount / rate);
}

/**
 * Format an amount with the appropriate currency symbol and locale-aware
 * number formatting. JPY amounts are shown without decimals since yen does
 * not use fractional units.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCIES[currency];
  const decimals = currency === 'JPY' ? 0 : 2;
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

// ---------------------------------------------------------------------------
// Smart Math Checks
// ---------------------------------------------------------------------------

export interface AmountWarning {
  type: 'large_amount' | 'excessive_decimals' | 'possible_decimal_error';
  message: string;
}

/**
 * Validate an expense amount and return an array of warnings. The function
 * does not reject the amount outright -- it merely flags conditions that the
 * user might want to review before saving.
 *
 * Checks performed:
 *  - Amount exceeds 10 000
 *  - Amount has more than 2 decimal places
 *  - Amount is an exact multiple of 1 000 (e.g. 1000, 2000) which could
 *    indicate the user accidentally typed "1000" instead of "10.00"
 */
export function validateAmount(amount: number): AmountWarning[] {
  const warnings: AmountWarning[] = [];

  if (amount > 10_000) {
    warnings.push({
      type: 'large_amount',
      message: 'Unusually large amount',
    });
  }

  // Check for more than 2 decimal places by comparing the rounded value to
  // the original. Using a string check avoids floating-point rounding issues
  // that arise when multiplying by 100.
  const decimalPart = amount.toString().split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    warnings.push({
      type: 'excessive_decimals',
      message: 'Amount will be rounded to 2 decimals',
    });
  }

  // Flag round-thousand amounts (1000, 2000, ...) that could be accidental.
  // We only flag amounts >= 1000 that are exact multiples of 1000 and where
  // dividing by 100 produces a "reasonable" everyday expense (i.e. < 100).
  if (amount >= 1000 && amount % 1000 === 0 && amount / 100 < 100) {
    warnings.push({
      type: 'possible_decimal_error',
      message: `Did you mean ${formatCurrency(amount / 100, 'USD')} instead of ${formatCurrency(amount, 'USD')}?`,
    });
  }

  return warnings;
}

/**
 * Round an amount to exactly 2 decimal places using the "round half away
 * from zero" strategy, which matches how most financial UIs behave.
 */
export function roundAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Duplicate Detection
// ---------------------------------------------------------------------------

export interface DuplicateMatch {
  expense: Expense;
  /** A value between 0 and 1 representing how similar the descriptions are. */
  similarity: number;
  /** Human-readable reason the expense was flagged as a potential duplicate. */
  reason: string;
}

/**
 * Compute the Levenshtein edit-distance between two strings. This is used
 * internally by `findDuplicates` to perform fuzzy description matching.
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Fast-path: one of the strings is empty.
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Use a single-row DP approach to save memory.
  let prev = Array.from({ length: bLen + 1 }, (_, i) => i);
  let curr = new Array<number>(bLen + 1);

  for (let i = 1; i <= aLen; i++) {
    curr[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[bLen];
}

/**
 * Compute a similarity score between two strings based on Levenshtein
 * distance, normalized to the range [0, 1] where 1 means identical.
 */
function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1; // both empty
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/**
 * Normalize a description string for comparison: lower-case, collapse
 * whitespace, and strip leading/trailing spaces.
 */
function normalizeDescription(description: string): string {
  return description.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Check whether two date strings refer to the same calendar day.
 * Handles both ISO-8601 full timestamps and plain YYYY-MM-DD strings.
 */
function isSameDate(dateA: string, dateB: string): boolean {
  const dayA = dateA.substring(0, 10);
  const dayB = dateB.substring(0, 10);
  return dayA === dayB;
}

/** Minimum description similarity (0-1) to consider two expenses duplicates. */
const DUPLICATE_SIMILARITY_THRESHOLD = 0.8;

/**
 * Search `existingExpenses` for entries that look like duplicates of
 * `newExpense`. A match requires:
 *
 *  1. The same amount (compared after rounding to 2 decimals).
 *  2. The same date (calendar day).
 *  3. A description similarity score >= 0.8 (fuzzy match via Levenshtein).
 *
 * Returns an array of `DuplicateMatch` objects sorted by similarity
 * (highest first). An empty array means no duplicates were found.
 */
export function findDuplicates(
  newExpense: Pick<Expense, 'description' | 'amount' | 'date'>,
  existingExpenses: Expense[],
): DuplicateMatch[] {
  const normalizedNew = normalizeDescription(newExpense.description);
  const roundedNewAmount = roundAmount(newExpense.amount);

  const matches: DuplicateMatch[] = [];

  for (const existing of existingExpenses) {
    // 1. Amount must match (after rounding).
    if (roundAmount(existing.amount) !== roundedNewAmount) {
      continue;
    }

    // 2. Date must match (same calendar day).
    if (!isSameDate(newExpense.date, existing.date)) {
      continue;
    }

    // 3. Description must be similar enough.
    const normalizedExisting = normalizeDescription(existing.description);
    const similarity = stringSimilarity(normalizedNew, normalizedExisting);

    if (similarity >= DUPLICATE_SIMILARITY_THRESHOLD) {
      const reason =
        similarity === 1
          ? `Exact duplicate: same description, amount (${formatCurrency(existing.amount, 'USD')}), and date`
          : `Similar duplicate (${Math.round(similarity * 100)}% match): "${existing.description}" with same amount and date`;

      matches.push({ expense: existing, similarity, reason });
    }
  }

  // Sort best matches first.
  matches.sort((a, b) => b.similarity - a.similarity);

  return matches;
}
