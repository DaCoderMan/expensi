import { SpendingSummary } from '@/types';

export function buildPdfExtractionPrompt(pdfText: string) {
  const system = `You are a financial document parser. Extract expense/transaction data from the provided text extracted from a PDF (bank statement, credit card statement, or expense report).

Return valid JSON only:
{
  "expenses": [
    { "description": "Merchant or description", "amount": 42.50, "date": "2026-01-15", "category": "food" }
  ]
}

Rules:
- Extract every expense transaction you can identify
- "amount" must be a positive number (no currency symbols, no commas)
- "date" must be in YYYY-MM-DD format. If the year is ambiguous, use the current year
- "description" should be the merchant name or clean transaction description (remove bank codes, reference numbers)
- "category" is optional. If you can infer it, use one of: food, transport, housing, entertainment, utilities, healthcare, education, shopping, subscriptions, travel, personal, other
- Only extract debits/charges/expenses - skip deposits, credits, payments received, balance summaries, interest earned
- If the text is not a financial document or contains no transactions, return { "expenses": [] }
- Do NOT make up or hallucinate transactions - only extract what is clearly present in the text`;

  const user = `Extract all expense transactions from this document text:\n\n${pdfText}`;

  return { system, user };
}

export function buildCategorizationPrompt(
  expenses: { description: string; amount: number }[]
) {
  const system = `You are a financial expense categorizer. Classify each expense into exactly one of these categories: food, transport, housing, entertainment, utilities, healthcare, education, shopping, subscriptions, travel, personal, other.

Respond with valid JSON only. Format:
{
  "categorizations": [
    { "index": 0, "category": "food", "confidence": 0.95 },
    { "index": 1, "category": "transport", "confidence": 0.8 }
  ]
}

Rules:
- "index" matches the position of the expense in the input list (0-based)
- "confidence" is between 0 and 1
- If unsure, use "other" with low confidence
- Consider both the description text and the amount for context`;

  const user = `Categorize these expenses:\n${expenses
    .map((e, i) => `${i}. "${e.description}" - $${e.amount.toFixed(2)}`)
    .join('\n')}`;

  return { system, user };
}

export function buildRecommendationsPrompt(summary: SpendingSummary) {
  const system = `You are a personal finance advisor. Analyze the spending summary and provide 3-5 actionable, specific recommendations to manage spending better. Be concrete with dollar amounts, percentages, and specific categories.

Respond with valid JSON only. Format:
{
  "recommendations": [
    {
      "title": "Short title",
      "description": "Detailed actionable advice (2-3 sentences)",
      "potentialSavings": "$X-Y/month",
      "priority": "high",
      "category": "food"
    }
  ]
}

Rules:
- Prioritize high-impact areas (largest spending categories)
- Be realistic and specific, not generic
- If spending looks reasonable in a category, acknowledge it
- Consider the time period when suggesting savings
- priority must be "high", "medium", or "low"
- category is optional and should match one of: food, transport, housing, entertainment, utilities, healthcare, education, shopping, subscriptions, travel, personal, other`;

  const user = `Spending summary for ${summary.period}:
Total spent: $${summary.total.toFixed(2)}
Number of transactions: ${summary.transactionCount}

Breakdown by category:
${summary.byCategory
  .map(
    (c) =>
      `- ${c.category}: $${c.total.toFixed(2)} (${c.percentage.toFixed(1)}%, ${c.count} transactions)`
  )
  .join('\n')}

Top 3 single expenses:
${summary.topExpenses
  .map((e) => `- "${e.description}": $${e.amount.toFixed(2)} (${e.category})`)
  .join('\n')}

Average daily spend: $${summary.avgDaily.toFixed(2)}`;

  return { system, user };
}
