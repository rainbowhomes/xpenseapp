
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, PieChart as PieChartIcon, List, Settings, ChevronRight, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Category, Expense } from './types';
import { DEFAULT_CATEGORIES, STORAGE_KEY_EXPENSES, STORAGE_KEY_CATEGORIES, MONTH_NAMES } from './constants';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import ExpenseList from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import CategoryManager from './components/CategoryManager';

function parseDate(val: string): string | null {
  const s = val.trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function parseAmount(val: string): number | null {
  const n = parseFloat(val.trim().replace(/[₹,$\s]/g, ''));
  return isNaN(n) ? null : n;
}

function matchCategory(csvCat: string, categories: Category[]): Category | null {
  const n = csvCat.trim().toLowerCase();
  if (!n) return null;
  for (const c of categories) {
    if (c.name.toLowerCase() === n || c.name.toLowerCase().includes(n) || n.includes(c.name.toLowerCase())) return c;
  }
  return null;
}

function parseCsvToExpenses(
  csvText: string,
  categories: Category[]
): { expenses: Omit<Expense, 'id'>[]; imported: number; skipped: number; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  const result = { imported: 0, skipped: 0, errors: [] as string[] };
  const DATE_ALIASES = ['date', 'dates', 'transaction date', 'transaction_date'];
  const CATEGORY_ALIASES = ['category', 'categories', 'expense category', 'expense_category', 'type'];
  const AMOUNT_ALIASES = ['amount', 'amounts', 'value', 'price', 'cost', 'expense', 'debit'];

  if (lines.length < 2) {
    result.errors.push('CSV must have a header row and at least one data row');
    return { expenses: [], ...result };
  }

  const parseRow = (row: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    out.push(cur.trim());
    return out;
  };

  const norm = (h: string) => h.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  const findCol = (headers: string[], aliases: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      const n = norm(headers[i]);
      for (const a of aliases) if (n.includes(a) || a.includes(n)) return i;
    }
    return -1;
  };

  const headers = parseRow(lines[0]);
  const dateIdx = findCol(headers, DATE_ALIASES);
  const catIdx = findCol(headers, CATEGORY_ALIASES);
  const amtIdx = findCol(headers, AMOUNT_ALIASES);

  if (dateIdx < 0) result.errors.push('Could not detect Date column');
  if (catIdx < 0) result.errors.push('Could not detect Expense Category column');
  if (amtIdx < 0) result.errors.push('Could not detect Amount column');
  if (dateIdx < 0 || catIdx < 0 || amtIdx < 0) return { expenses: [], ...result };

  const expenses: Omit<Expense, 'id'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    const dateVal = parseDate(cols[dateIdx] ?? '');
    const amtVal = parseAmount(cols[amtIdx] ?? '');
    const cat = matchCategory(cols[catIdx] ?? '', categories);
    if (!dateVal || !amtVal || amtVal <= 0 || !cat) { result.skipped++; continue; }
    expenses.push({ amount: amtVal, categoryId: cat.id, description: cols[catIdx] ?? '', date: dateVal });
  }
  result.imported = expenses.length;
  return { expenses, ...result };
}

const App: React.FC = () => {
  const now = new Date();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isAllTime, setIsAllTime] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const filteredExpenses = useMemo(() => {
    if (isAllTime) return expenses;
    return expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return m === selectedMonth && y === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear, isAllTime]);

  const filteredTotal = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);
  const periodLabel = isAllTime ? 'All time' : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  // Load data from LocalStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save data to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses(prev => [newExpense, ...prev]);
    setIsAddModalOpen(false);
  };

  const updateExpense = (id: string, expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...expense, id } : e));
    setEditingExpense(null);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    // Prevent deleting categories that have expenses
    const hasExpenses = expenses.some(e => e.categoryId === id);
    if (hasExpenses) {
      alert("Cannot delete category with existing expenses. Please re-assign or delete those expenses first.");
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleExport = () => {
    const data = {
      expenses,
      categories,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `xpense_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvImportClick = () => {
    csvInputRef.current?.click();
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const { expenses: newExpenses, imported, skipped, errors } = parseCsvToExpenses(content, categories);

        if (errors.length > 0) {
          alert('CSV Import Issues:\n' + errors.join('\n') + (newExpenses.length > 0 ? '\n\nImported ' + imported + ' expenses. ' + skipped + ' rows skipped.' : ''));
        }
        if (newExpenses.length > 0) {
          const withIds = newExpenses.map((exp: Omit<Expense, 'id'>, i: number) => ({ ...exp, id: `csv-${Date.now()}-${i}` }));
          setExpenses(prev => [...withIds, ...prev]);
          alert(`Imported ${imported} expenses from CSV. ${skipped} rows skipped (unmatched category or invalid data).`);
        } else if (errors.length === 0) {
          alert('No valid expenses found in CSV. Ensure columns: Date, Expense Category, Amount. Category names must match your app categories.');
        }
      } catch (err) {
        alert('Failed to parse CSV file.');
        console.error(err);
      }
      if (csvInputRef.current) csvInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.expenses || !data.categories) {
          throw new Error("Invalid backup file format");
        }

        if (confirm("Importing this data will replace your current expenses and categories. Proceed?")) {
          setExpenses(data.expenses);
          setCategories(data.categories);
          alert("Data imported successfully!");
        }
      } catch (err) {
        alert("Failed to import data. Please ensure the file is a valid Xpense backup.");
        console.error(err);
      }
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-slate-50 shadow-xl overflow-hidden">
      <Header />
      
      <main className="px-4 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <SummaryCards 
              total={filteredTotal} 
              count={filteredExpenses.length} 
              periodLabel={periodLabel}
              onTotalClick={() => setActiveTab('history')}
            />
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <PieChartIcon size={20} className="text-blue-500" />
                Spending Breakdown
              </h2>
              <ExpenseChart 
                expenses={expenses} 
                categories={categories}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                isAllTime={isAllTime}
                onSelectionChange={(month: number, year: number, allTime: boolean) => {
                  setIsAllTime(allTime);
                  if (!allTime) {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }
                }}
              />
            </div>
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-blue-600 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <ExpenseList 
                expenses={filteredExpenses.slice(0, 5)} 
                categories={categories}
                onEdit={(exp: Expense) => setEditingExpense(exp)}
                onDelete={deleteExpense} 
              />
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              Transaction History {periodLabel && <span className="text-slate-500 font-normal text-base">({periodLabel})</span>}
            </h2>
            <ExpenseList 
              expenses={filteredExpenses} 
              categories={categories}
              onEdit={(exp: Expense) => setEditingExpense(exp)}
              onDelete={deleteExpense} 
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Categories</h2>
            <CategoryManager 
              categories={categories} 
              onAdd={addCategory}
              onEdit={updateCategory}
              onDelete={deleteCategory} 
            />
            <div className="p-4 bg-slate-100 rounded-3xl space-y-3">
                <h3 className="font-semibold text-slate-700 mb-1 px-1">Data Management</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-blue-600 font-bold rounded-xl border border-blue-50 shadow-sm active:scale-95 transition-transform"
                  >
                    <Download size={18} />
                    Export
                  </button>
                  <button 
                    onClick={handleImportClick}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-emerald-600 font-bold rounded-xl border border-emerald-50 shadow-sm active:scale-95 transition-transform"
                  >
                    <Upload size={18} />
                    Import
                  </button>
                  <button 
                    onClick={handleCsvImportClick}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-violet-600 font-bold rounded-xl border border-violet-50 shadow-sm active:scale-95 transition-transform col-span-2"
                  >
                    <FileSpreadsheet size={18} />
                    Import CSV
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <input 
                    type="file" 
                    ref={csvInputRef} 
                    className="hidden" 
                    accept=".csv"
                    onChange={handleCsvFileChange}
                  />
                </div>

                <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                      setExpenses([]);
                    }
                  }}
                  className="w-full py-3 bg-white text-red-500 font-bold rounded-xl border border-red-50 shadow-sm active:scale-95 transition-transform"
                >
                  Clear All Data
                </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <PieChartIcon size={24} />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <List size={24} />
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </nav>

      {(isAddModalOpen || editingExpense) && (
        <AddExpenseModal 
          categories={categories}
          initialExpense={editingExpense}
          onClose={() => { setIsAddModalOpen(false); setEditingExpense(null); }} 
          onSubmit={addExpense}
          onUpdate={updateExpense}
        />
      )}
    </div>
  );
};

export default App;
