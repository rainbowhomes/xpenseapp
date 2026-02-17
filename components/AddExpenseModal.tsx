
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category, Expense } from '../types';

interface AddExpenseModalProps {
  categories: Category[];
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onUpdate?: (id: string, expense: Omit<Expense, 'id'>) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ categories, initialExpense, onClose, onSubmit, onUpdate }) => {
  const isEdit = !!initialExpense;
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialExpense) {
      setAmount(initialExpense.amount.toString());
      setCategoryId(initialExpense.categoryId);
      setDescription(initialExpense.description);
      setDate(initialExpense.date);
    } else {
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialExpense, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    
    const data = {
      amount: parseFloat(amount),
      categoryId,
      description,
      date,
    };

    if (isEdit && onUpdate) {
      onUpdate(initialExpense.id, data);
    } else {
      onSubmit(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                    categoryId === cat.id 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description (Optional)</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Check size={20} />
            {isEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
