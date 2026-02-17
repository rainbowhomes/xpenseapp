
import React, { useState } from 'react';
import { Plus, Trash2, Tag, Pencil } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onEdit: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const PRESET_ICONS = ['🍔', '🚗', '🛍️', '🎬', '💡', '🏠', '🎁', '🩺', '🎓', '✈️', '🎾', '💻', '📦', '🍕', '☕', '🎵', '📱', '💳'];
const COLORS = ['#f87171', '#60a5fa', '#c084fc', '#facc15', '#4ade80', '#94a3b8', '#fb923c', '#2dd4bf'];

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onEdit, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newColor, setNewColor] = useState('#64748b');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: newName.trim(),
      icon: newIcon || '📦',
      color: newColor
    });
    setNewName('');
    setNewIcon('📦');
    setIsAdding(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewIcon(cat.icon);
    setNewColor(cat.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !newName.trim()) return;
    onEdit(editingId, { name: newName.trim(), icon: newIcon || '📦', color: newColor });
    setEditingId(null);
    setNewName('');
    setNewIcon('📦');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewIcon('📦');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="font-bold text-slate-700">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleEdit(cat)}
                className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => onDelete(cat.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId ? (
        <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-lg animate-in zoom-in-95 duration-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Pencil size={16} className="text-blue-500" />
            Edit Category
          </h3>
          <div className="space-y-4">
            <input 
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category Name"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium outline-none ring-2 ring-transparent focus:ring-blue-500"
            />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Icon</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_ICONS.map(function(icon) {
                  return (
                    <button 
                      key={String(icon)}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={'text-xl p-2 rounded-lg transition-all ' + (newIcon === icon ? 'bg-blue-600 shadow-md scale-110' : 'bg-slate-100')}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value || '📦')}
                placeholder="Or type emoji"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium text-2xl text-center"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((colorVal) => {
                  const btnStyle = { backgroundColor: colorVal };
                  return (
                    <button 
                      key={colorVal}
                      type="button"
                      onClick={() => setNewColor(colorVal)}
                      className={'w-8 h-8 rounded-full transition-all ' + (newColor === colorVal ? 'ring-2 ring-slate-800 ring-offset-2 scale-110' : '')}
                      style={btnStyle}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={cancelEdit} className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} className="flex-1 py-3 text-white font-bold text-sm bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : !isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Plus size={20} />
          Add Custom Category
        </button>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-lg animate-in zoom-in-95 duration-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Tag size={16} className="text-blue-500" />
            New Category
          </h3>
          <div className="space-y-4">
            <input 
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category Name"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium outline-none ring-2 ring-transparent focus:ring-blue-500"
            />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Icon</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_ICONS.map(function(icon) {
                  return (
                    <button 
                      key={String(icon)}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={'text-xl p-2 rounded-lg transition-all ' + (newIcon === icon ? 'bg-blue-600 shadow-md scale-110' : 'bg-slate-100')}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value || '📦')}
                placeholder="Or type emoji"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium text-2xl text-center"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((colorVal) => {
                  const btnStyle = { backgroundColor: colorVal };
                  return (
                    <button 
                      key={colorVal}
                      type="button"
                      onClick={() => setNewColor(colorVal)}
                      className={'w-8 h-8 rounded-full transition-all ' + (newColor === colorVal ? 'ring-2 ring-slate-800 ring-offset-2 scale-110' : '')}
                      style={btnStyle}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="button" onClick={handleAdd} className="flex-1 py-3 text-white font-bold text-sm bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
