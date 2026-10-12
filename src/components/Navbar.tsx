import React from 'react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  activeBatchesCount: number;
  concludedBatchesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  activeBatchesCount,
  concludedBatchesCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#221C1A]/95 backdrop-blur-md border-t border-orange-500/15 shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-1">
        <button
          onClick={() => onChangeTab('lotes')}
          className={`flex flex-col items-center justify-center gap-1 transition relative min-h-[48px] rounded-2xl ${
            activeTab === 'lotes'
              ? 'text-[#D35400] dark:text-[#FFB07F] font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <div className="relative">
            <span className="text-xl">🥚</span>
            {activeBatchesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#D35400] text-white text-[10px] font-bold rounded-full">
                {activeBatchesCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Lotes</span>
          {activeTab === 'lotes' && (
            <span className="w-6 h-1 rounded-full bg-[#D35400] dark:bg-[#FFB07F] absolute bottom-1" />
          )}
        </button>

        <button
          onClick={() => onChangeTab('concluidos')}
          className={`flex flex-col items-center justify-center gap-1 transition relative min-h-[48px] rounded-2xl ${
            activeTab === 'concluidos'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <div className="relative">
            <span className="text-xl">🏁</span>
            {concludedBatchesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                {concludedBatchesCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Concluídos</span>
          {activeTab === 'concluidos' && (
            <span className="w-6 h-1 rounded-full bg-emerald-600 dark:text-emerald-400 absolute bottom-1" />
          )}
        </button>

        <button
          onClick={() => onChangeTab('financeiro')}
          className={`flex flex-col items-center justify-center gap-1 transition relative min-h-[48px] rounded-2xl ${
            activeTab === 'financeiro'
              ? 'text-[#2E7D32] dark:text-emerald-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px]">Financeiro</span>
          {activeTab === 'financeiro' && (
            <span className="w-6 h-1 rounded-full bg-[#2E7D32] dark:bg-emerald-400 absolute bottom-1" />
          )}
        </button>

        <button
          onClick={() => onChangeTab('guia')}
          className={`flex flex-col items-center justify-center gap-1 transition relative min-h-[48px] rounded-2xl ${
            activeTab === 'guia'
              ? 'text-[#7C3AED] dark:text-purple-300 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <span className="text-xl">🔦</span>
          <span className="text-[11px]">Guia</span>
          {activeTab === 'guia' && (
            <span className="w-6 h-1 rounded-full bg-[#7C3AED] dark:bg-purple-300 absolute bottom-1" />
          )}
        </button>
      </div>
    </nav>
  );
};
