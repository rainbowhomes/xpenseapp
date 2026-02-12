
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, Category, ChartData } from '../types';

interface ExpenseChartProps {
  expenses: Expense[];
  categories: Category[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, categories }) => {
  const data: ChartData[] = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
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
  }, [expenses, categories]);

  if (expenses.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">
        No expenses yet. Add one to see the chart!
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
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
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
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
    </div>
  );
};

export default ExpenseChart;
