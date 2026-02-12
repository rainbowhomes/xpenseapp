
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#f87171', icon: '🍔' },
  { id: '2', name: 'Transport', color: '#60a5fa', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#c084fc', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#facc15', icon: '🎬' },
  { id: '5', name: 'Bills & Utilities', color: '#4ade80', icon: '💡' },
  { id: '6', name: 'Others', color: '#94a3b8', icon: '📦' },
];

export const STORAGE_KEY_EXPENSES = 'xpense_data_v1';
export const STORAGE_KEY_CATEGORIES = 'xpense_categories_v1';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
