
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { Expense, Category, ChartData } from '../types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ExpenseChartProps {
  expenses: Expense[];
  categories: Category[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, categories }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { monthYearOptions, filteredExpenses } = useMemo(() => {
    const options: { month: number; year: number }[] = [];
    const seen = new Set<string>();

    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    seen.add(currentKey);
    options.push({ month: now.getMonth() + 1, year: now.getFullYear() });

    expenses.forEach(expense => {
      const [y, m] = expense.date.split('-').map(Number);
      const key = `${y}-${m}`;
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ month: m, year: y });
      }
    });

    options.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    const filter = selectedMonth !== null && selectedYear !== null;
    const filtered = filter
      ? expenses.filter(e => {
          const [y, m] = e.date.split('-').map(Number);
          return m === selectedMonth && y === selectedYear;
        })
      : expenses;

    return { monthYearOptions: options, filteredExpenses: filtered };
  }, [expenses, selectedMonth, selectedYear]);

  const data: ChartData[] = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    filteredExpenses.forEach(expense => {
      categoryTotals[expense.categoryId] = (categoryTotals[expense.categoryId] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([catId, total]) => {
      const category = categories.find(c => c.id === catId);
      return {
        name: category?.name || 'Unknown',
        value: total,
        color: category?.color || '#cbd5e1'
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories]);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && monthYearOptions.length > 0) {
      hasInitialized.current = true;
      const latest = monthYearOptions[0];
      setSelectedMonth(latest.month);
      setSelectedYear(latest.year);
    }
  }, [monthYearOptions]);

  if (expenses.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">
        No expenses yet. Add one to see the chart!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <select
            value={selectedMonth !== null && selectedYear !== null ? `${selectedYear}-${selectedMonth}` : 'all'}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'all') {
                setSelectedMonth(null);
                setSelectedYear(null);
              } else {
                const [y, m] = v.split('-').map(Number);
                setSelectedMonth(m);
                setSelectedYear(y);
              }
            }}
            className="w-full appearance-none bg-slate-100 text-slate-800 font-semibold rounded-xl py-2.5 pl-4 pr-10 border-0 cursor-pointer text-sm focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All time</option>
            {monthYearOptions.map(({ month, year }) => (
              <option key={`${year}-${month}`} value={`${year}-${month}`}>
                {MONTH_NAMES[month - 1]} {year}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>
    <div className="h-64 w-full">
      {filteredExpenses.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
          No expenses for this period.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend 
             verticalAlign="bottom" 
             height={36} 
             iconType="circle"
             wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
      )}
    </div>
    </div>
  );
};

export default ExpenseChart;
