import React from 'react';
import { IncubationBatch } from '../types';
import { calculateIncubationStatus, formatBRDate } from '../utils/incubation';
import { Calendar, RotateCw } from 'lucide-react';

interface BatchCardProps {
  batch: IncubationBatch;
  onSelect: (batch: IncubationBatch) => void;
  onQuickTurn: (batchId: string, e: React.MouseEvent) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  onSelect,
  onQuickTurn
}) => {
  const status = calculateIncubationStatus(batch);

  return (
    <div
      onClick={() => onSelect(batch)}
      className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 shadow-sm border border-orange-200/60 dark:border-neutral-800 transition hover:shadow-md hover:border-orange-400 active:scale-[0.99] cursor-pointer relative overflow-hidden"
    >
      {/* Top badges & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center text-2xl shadow-xs">
            {batch.emoji || '🥚'}
          </div>
          <div>
            <h3 className="font-bold text-base text-[#2C2523] dark:text-[#EFE9E4] leading-snug line-clamp-1">
              {batch.nome}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {batch.especie} • {batch.totalOvos} ovos
            </p>
          </div>
        </div>

        {/* Phase Badges */}
        <div className="flex flex-col items-end gap-1">
          {status.isLockdown && (
            <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-black tracking-wide animate-pulse">
              Lockdown 🛑
            </span>
          )}
          {status.isConcluido && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              Eclodido 🐣
            </span>
          )}
          {status.isFuturo && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
              Aguardando início ⏳
            </span>
          )}
        </div>
      </div>

      {/* Day Progress info */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-[#D35400] dark:text-[#FFB07F]">
            {status.isFuturo
              ? 'Aguardando início'
              : status.isConcluido
              ? 'Incubação Concluída!'
              : `Dia ${status.diaAtual} de ${batch.diasTotais}`}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">
            {status.progressoPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              status.isLockdown
                ? 'bg-gradient-to-r from-orange-500 to-red-600'
                : status.isConcluido
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-[#E67E22] to-[#D35400]'
            }`}
            style={{ width: `${status.progressoPercent}%` }}
          />
        </div>
      </div>

      {/* Meta dates and Turns stats */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>
            {status.isConcluido ? 'Saída: ' : 'Eclosão: '}
            <strong>
              {formatBRDate(status.isConcluido ? status.dataSaidaDate : status.dataEclosaoDate)}
            </strong>
          </span>
        </div>

        <div>
          Viradas hoje: <strong className="text-[#D35400] dark:text-[#FFB07F]">{status.viradasHoje}/{batch.metaViradasDia}</strong>
        </div>
      </div>

      {/* Quick Turn Button */}
      {!status.isLockdown && !status.isConcluido && (
        <div className="mt-3">
          <button
            onClick={(e) => onQuickTurn(batch.id, e)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-300/80 dark:border-orange-800/60 text-[#D35400] dark:text-[#FFB07F] font-semibold text-xs transition active:scale-97"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Virar Agora</span>
          </button>
        </div>
      )}
    </div>
  );
};
