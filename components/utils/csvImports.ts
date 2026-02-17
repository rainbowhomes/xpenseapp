
import { Expense, Category } from '../types';

const DATE_ALIASES = ['date', 'dates', 'transaction date', 'transaction_date', 'trans date', 'trans_date'];
const CATEGORY_ALIASES = ['category', 'categories', 'expense category', 'expense_category', 'expensecategory', 'type', 'description', 'expense type'];
const AMOUNT_ALIASES = ['amount', 'amounts', 'value', 'values', 'price', 'cost', 'expense', 'expenses', 'debit'];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const normalized = normalizeHeader(headers[i]);
    for (const alias of aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) return i;
    }
  }
  return -1;
}

function parseDate(val: string): string | null {
  const s = val.trim();
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function parseAmount(val: string): number | null {
  const s = val.trim().replace(/[₹,$\s]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function matchCategory(csvCategory: string, categories: Category[]): Category | null {
  const normalized = csvCategory.trim().toLowerCase();
  if (!normalized) return null;
  for (const cat of categories) {
    if (cat.name.toLowerCase() === normalized) return cat;
    if (cat.name.toLowerCase().includes(normalized)) return cat;
    if (normalized.includes(cat.name.toLowerCase())) return cat;
  }
  return null;
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function parseCsvToExpenses(
  csvText: string,
  categories: Category[],
  existingIds: Set<string>
): { expenses: Omit<Expense, 'id'>[]; result: CsvImportResult } {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const result: CsvImportResult = { imported: 0, skipped: 0, errors: [] };

  if (lines.length < 2) {
    result.errors.push('CSV must have a header row and at least one data row');
    return { expenses: [], result };
  }

  function parseCsvRow(row: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    out.push(cur.trim());
    return out;
  }

  const headers = parseCsvRow(lines[0]);
  const dateIdx = findColumnIndex(headers, DATE_ALIASES);
  const categoryIdx = findColumnIndex(headers, CATEGORY_ALIASES);
  const amountIdx = findColumnIndex(headers, AMOUNT_ALIASES);

  if (dateIdx < 0) result.errors.push('Could not detect Date column. Use headers like: Date, Transaction Date');
  if (categoryIdx < 0) result.errors.push('Could not detect Expense Category column. Use headers like: Category, Expense Category');
  if (amountIdx < 0) result.errors.push('Could not detect Amount column. Use headers like: Amount, Value, Expense');

  if (dateIdx < 0 || categoryIdx < 0 || amountIdx < 0) {
    return { expenses: [], result };
  }

  const expenses: Omit<Expense, 'id'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const dateVal = cols[dateIdx] ?? '';
    const categoryVal = cols[categoryIdx] ?? '';
    const amountVal = cols[amountIdx] ?? '';

    const date = parseDate(dateVal);
    const amount = parseAmount(amountVal);
    const matchedCat = matchCategory(categoryVal, categories);

    if (!date || !amount || amount <= 0) {
      result.skipped++;
      continue;
    }
    if (!matchedCat) {
      result.skipped++;
      continue;
    }

    expenses.push({
      amount,
      categoryId: matchedCat.id,
      description: categoryVal,
      date,
    });
  }

  result.imported = expenses.length;
  return { expenses, result };
}
