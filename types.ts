
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
