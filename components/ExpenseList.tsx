
import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { Expense, Category } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, categories, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-400 text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const category = categories.find(c => c.id === expense.categoryId);
        return (
          <div 
            key={expense.id} 
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
              >
                {category?.icon || '📦'}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">{expense.description || category?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                      {category?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">
                -₹{expense.amount.toLocaleString()}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(expense.id);
                }}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
