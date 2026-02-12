
import React from 'react';
import { TrendingUp, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  count: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ total, count }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <TrendingUp className="absolute -right-2 -bottom-2 text-white/10" size={80} />
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Spent</p>
          <p className="text-2xl font-bold">${total.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <CreditCard className="absolute -right-2 -bottom-2 text-slate-50" size={80} />
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-medium mb-1">Transactions</p>
          <p className="text-2xl font-bold text-slate-800">{count}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
