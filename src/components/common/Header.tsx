import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <div className="relative flex items-center justify-between px-5 py-4 bg-transparent z-10">
      {onBack ? (
        <button
          onClick={onBack}
          type="button"
          aria-label="Kembali"
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-100 text-slate-800 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
        </button>
      ) : (
        <div className="w-10 h-10" />
      )}

      <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center flex-1">
        {title}
      </h1>

      <div className="w-10 h-10 flex items-center justify-end">
        {rightAction}
      </div>
    </div>
  );
};
