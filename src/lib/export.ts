import { Expense } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { CURRENCIES, CurrencyCode } from '@/lib/validation';

/**
 * Escapes a value for safe inclusion in a CSV cell.
 * Wraps the value in double quotes if it contains commas, double quotes,
 * or newlines. Any existing double quotes are doubled per RFC 4180.
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a numeric amount as a currency string with two decimal places.
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Triggers a browser file download.
 */
function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getCurrencySymbol(currency?: string): string {
  if (!currency) return '$';
  return CURRENCIES[currency as CurrencyCode]?.symbol || '$';
}

/**
 * Generates a CSV string from an array of expenses and triggers a browser
 * download. Includes currency column.
 */
export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Amount', 'Currency', 'Category', 'Source', 'Notes'];
  const headerRow = headers.join(',');

  const dataRows = expenses.map((expense) => {
    const row = [
      escapeCSVValue(expense.date),
      escapeCSVValue(expense.description),
      formatAmount(expense.amount),
      escapeCSVValue(expense.currency || 'USD'),
      escapeCSVValue(CATEGORY_LABELS[expense.category] || expense.category),
      escapeCSVValue(expense.source),
      escapeCSVValue(expense.notes || ''),
    ];
    return row.join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\n');
  const filename = `expenses-${getTodayDateString()}.csv`;

  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Opens a new browser window with a styled HTML table and triggers print (Save as PDF).
 */
export function exportToPDF(expenses: Expense[]): void {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dateRange = getDateRange(expenses);

  const tableRows = expenses
    .map(
      (expense) => `
      <tr>
        <td>${escapeHTML(expense.date)}</td>
        <td>${escapeHTML(expense.description)}</td>
        <td class="amount">${escapeHTML(getCurrencySymbol(expense.currency))}${formatAmount(expense.amount)}</td>
        <td>${escapeHTML(expense.currency || 'USD')}</td>
        <td>${escapeHTML(CATEGORY_LABELS[expense.category] || expense.category)}</td>
        <td>${escapeHTML(expense.notes || '-')}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Expense Report - ${getTodayDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a; padding: 40px; background: #ffffff;
    }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0d9488; }
    .header h1 { font-size: 24px; font-weight: 700; color: #0d9488; margin-bottom: 8px; }
    .header .subtitle { font-size: 13px; color: #6b7280; }
    .summary { display: flex; justify-content: center; gap: 40px; margin-bottom: 32px; padding: 16px 0; }
    .summary-item { text-align: center; }
    .summary-item .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .summary-item .value { font-size: 20px; font-weight: 600; color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { background-color: #f0fdfa; color: #0d9488; font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 2px solid #0d9488; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tbody tr:nth-child(even) { background-color: #f9fafb; }
    td.amount { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
    th:nth-child(3) { text-align: right; }
    .total-row { font-weight: 700; border-top: 2px solid #0d9488; }
    .total-row td { padding-top: 12px; border-bottom: none; }
    .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 20px; } .summary { gap: 24px; } table { font-size: 11px; } thead th, tbody td { padding: 6px 8px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Expense Report</h1>
    <div class="subtitle">Generated on ${escapeHTML(getTodayDateString())}${dateRange ? ` &middot; Period: ${escapeHTML(dateRange)}` : ''}</div>
  </div>
  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Expenses</div>
      <div class="value">$${formatAmount(totalAmount)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Transactions</div>
      <div class="value">${expenses.length}</div>
    </div>
    <div class="summary-item">
      <div class="label">Average</div>
      <div class="value">$${expenses.length > 0 ? formatAmount(totalAmount / expenses.length) : '0.00'}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Currency</th>
        <th>Category</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td class="amount">$${formatAmount(totalAmount)}</td>
        <td colspan="3"></td>
      </tr>
    </tbody>
  </table>
  <div class="footer">Financi AI &middot; Expense Report</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHTML(value: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return value.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Computes the date range string from expenses.
 */
function getDateRange(expenses: Expense[]): string | null {
  if (expenses.length === 0) return null;
  const dates = expenses.map((e) => e.date).sort();
  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  if (earliest === latest) return earliest;
  return `${earliest} to ${latest}`;
}
