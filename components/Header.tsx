
import React from 'react';
import { Wallet } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Xpense</h1>
            <p className="text-xs font-medium text-slate-400">Personal Wealth Tracker</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
          <img src="https://picsum.photos/seed/xpense/100/100" alt="Profile" />
        </div>
      </div>
    </header>
  );
};

export default Header;
