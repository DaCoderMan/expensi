import { RawExpenseInput, ParseResult } from '@/types';

export async function parseOfxFile(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();

    // Extract all <STMTTRN>...</STMTTRN> transaction blocks
    const txnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const matches = [...text.matchAll(txnRegex)];

    if (matches.length === 0) {
      // Try without closing tags (some OFX files use SGML without closing tags)
      return parseOfxSgml(text);
    }

    const expenses: RawExpenseInput[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < matches.length; i++) {
      const block = matches[i][1];
      const getValue = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}>([^<\\n]+)`));
        return m ? m[1].trim() : '';
      };

      const trnType = getValue('TRNTYPE');
      const amountStr = getValue('TRNAMT');
      const amount = parseFloat(amountStr);
      const name = getValue('NAME') || getValue('MEMO') || getValue('PAYEE');
      const dateStr = getValue('DTPOSTED');

      // Skip credits/deposits - only import debits (expenses)
      if (trnType === 'CREDIT' || trnType === 'DEP') continue;

      if (isNaN(amount) || amount === 0) {
        errors.push({ row: i + 1, message: `Invalid amount: "${amountStr}"` });
        continue;
      }
      if (!name) {
        errors.push({ row: i + 1, message: 'No description found in transaction' });
        continue;
      }

      // Parse OFX date format YYYYMMDD[HHMMSS[.XXX]]
      const date = parseOfxDate(dateStr);

      expenses.push({
        description: cleanOfxDescription(name),
        amount: Math.abs(amount),
        date: date || new Date().toISOString().slice(0, 10),
      });
    }

    return { expenses, errors, totalRows: matches.length, fileType: 'ofx' };
  } catch (error) {
    return {
      expenses: [],
      errors: [{ row: 0, message: `Failed to parse OFX file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      totalRows: 0,
      fileType: 'ofx',
    };
  }
}

// Fallback parser for SGML-style OFX without closing tags
function parseOfxSgml(text: string): ParseResult {
  // Find all TRNAMT entries and extract surrounding fields
  const lines = text.split('\n').map((l) => l.trim());
  const expenses: RawExpenseInput[] = [];
  const errors: { row: number; message: string }[] = [];
  let txnCount = 0;

  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith('<STMTTRN>')) {
      txnCount++;
      const txn: Record<string, string> = {};

      i++;
      while (i < lines.length && !lines[i].startsWith('<STMTTRN>') && !lines[i].startsWith('</STMTTRN>') && !lines[i].startsWith('</BANKTRANLIST>')) {
        const tagMatch = lines[i].match(/^<(\w+)>(.+)/);
        if (tagMatch) {
          txn[tagMatch[1]] = tagMatch[2].trim();
        }
        i++;
      }

      const amount = parseFloat(txn.TRNAMT || '');
      const name = txn.NAME || txn.MEMO || txn.PAYEE || '';
      const trnType = txn.TRNTYPE || '';

      if (trnType === 'CREDIT' || trnType === 'DEP') continue;

      if (isNaN(amount) || amount === 0) {
        errors.push({ row: txnCount, message: `Invalid amount` });
        continue;
      }
      if (!name) {
        errors.push({ row: txnCount, message: 'No description found' });
        continue;
      }

      expenses.push({
        description: cleanOfxDescription(name),
        amount: Math.abs(amount),
        date: parseOfxDate(txn.DTPOSTED || '') || new Date().toISOString().slice(0, 10),
      });
    } else {
      i++;
    }
  }

  if (expenses.length === 0 && errors.length === 0) {
    errors.push({ row: 0, message: 'No transactions found in OFX/QFX file.' });
  }

  return { expenses, errors, totalRows: txnCount, fileType: 'ofx' };
}

function parseOfxDate(dateStr: string): string | null {
  if (!dateStr || dateStr.length < 8) return null;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

function cleanOfxDescription(name: string): string {
  // Remove extra whitespace and common bank prefixes
  return name
    .replace(/\s+/g, ' ')
    .replace(/^(POS |DEBIT |ACH |CHECK |WIRE )/i, '')
    .trim();
}
