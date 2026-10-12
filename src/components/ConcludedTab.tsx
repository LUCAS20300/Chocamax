import React from 'react';
import { IncubationBatch } from '../types';
import { calculateIncubationStatus, formatBRDate, formatBRDateTime, formatBRL } from '../utils/incubation';
import { Calendar, CheckCircle2, ChevronRight, DollarSign, Eye, History, RotateCcw, Trash2, TrendingUp } from 'lucide-react';

interface ConcludedTabProps {
  batches: IncubationBatch[];
  onSelectBatch: (batch: IncubationBatch) => void;
  onGoToFinance: (batchId: string) => void;
  onReopenBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  onToast: (msg: string) => void;
}

export const ConcludedTab: React.FC<ConcludedTabProps> = ({
  batches,
  onSelectBatch,
  onGoToFinance,
  onReopenBatch,
  onDeleteBatch,
  onToast
}) => {
  // Concluded batches: either manually finished or current day > total days
  const concludedBatches = batches.filter((b) => {
    const status = calculateIncubationStatus(b);
    return status.isConcluido || b.concluido;
  });

  // Calculate historical aggregates
  const totalChicksHatched = concludedBatches.reduce((acc, b) => acc + (b.ovosNascidos || 0), 0);
  const totalEggsPlaced = concludedBatches.reduce((acc, b) => acc + (b.totalOvos || 0), 0);
  const averageHatchRate = totalEggsPlaced > 0 ? (totalChicksHatched / totalEggsPlaced) * 100 : 0;
  const totalHistoricalProfit = concludedBatches.reduce((acc, b) => {
    const revenue = (b.ovosNascidos || 0) * (b.valorCadaPinto || 0);
    return acc + (revenue - (b.investimento || 0));
  }, 0);

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl">
              🏁
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2C2523] dark:text-[#EFE9E4]">
                Ciclos Concluídos
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Histórico com dia de início e dia que saiu
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {concludedBatches.length} {concludedBatches.length === 1 ? 'lote salvo' : 'lotes salvos'}
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          Toda vez que uma incubação é finalizada, ela fica salva aqui com a data exata em que você colocou os ovos e o dia em que o ciclo saiu da chocadeira.
        </p>
      </div>

      {/* Aggregate Cards */}
      {concludedBatches.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#221C1A] border border-orange-200/60 dark:border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 block font-semibold">Total Nascidos</span>
            <strong className="text-base text-emerald-600 dark:text-emerald-400 font-black">
              {totalChicksHatched}
            </strong>
            <span className="text-[9px] text-neutral-400 block">pintinhos</span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#221C1A] border border-orange-200/60 dark:border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 block font-semibold">Média Eclosão</span>
            <strong className="text-base text-[#D35400] dark:text-[#FFB07F] font-black">
              {averageHatchRate.toFixed(0)}%
            </strong>
            <span className="text-[9px] text-neutral-400 block">histórica</span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#221C1A] border border-orange-200/60 dark:border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 block font-semibold">Lucro Total</span>
            <strong className={`text-base font-black ${
              totalHistoricalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}>
              {formatBRL(totalHistoricalProfit)}
            </strong>
            <span className="text-[9px] text-neutral-400 block">acumulado</span>
          </div>
        </div>
      )}

      {/* Concluded List */}
      {concludedBatches.length === 0 ? (
        <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-3xl">
            🐣
          </div>
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            Nenhum ciclo finalizado ainda
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Assim que uma ninhada atingir o tempo total ou você clicar em &quot;Concluir Ciclo&quot;, ela será salva automaticamente nesta aba com o dia que iniciou e o dia que saiu!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {concludedBatches.map((batch) => {
            const status = calculateIncubationStatus(batch);
            const startDate = status.dataInicioDate;
            const exitDate = status.dataSaidaDate;
            const hatched = batch.ovosNascidos || 0;
            const eggs = batch.totalOvos || 1;
            const hatchRate = Math.round((hatched / eggs) * 100);
            const revenue = hatched * (batch.valorCadaPinto || 0);
            const profit = revenue - (batch.investimento || 0);

            return (
              <div
                key={batch.id}
                className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-emerald-200/80 dark:border-neutral-800 shadow-sm space-y-3.5 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-2xl shadow-xs">
                      {batch.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#2C2523] dark:text-[#EFE9E4] leading-snug line-clamp-1">
                        {batch.nome}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {batch.especie} • {batch.diasTotais} dias de incubação
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Concluído</span>
                  </span>
                </div>

                {/* DESTAQUE PRINCIPAL: DIA QUE INICIOU E DIA QUE SAIU */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-neutral-900/80 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        📅 Dia que Iniciou
                      </span>
                      <strong className="text-xs text-neutral-800 dark:text-neutral-200 block mt-0.5 font-bold">
                        {formatBRDate(startDate)}
                      </strong>
                      <span className="text-[10px] text-neutral-500 block">
                        Colocação dos ovos
                      </span>
                    </div>

                    <div className="border-l border-emerald-200 dark:border-neutral-800 pl-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
                        🐣 Dia que Saiu
                      </span>
                      <strong className="text-xs text-emerald-800 dark:text-emerald-300 block mt-0.5 font-bold">
                        {formatBRDate(exitDate)}
                      </strong>
                      <span className="text-[10px] text-neutral-500 block">
                        Término da chocadeira
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resultados da Eclosão */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Ovos Colocados</span>
                    <strong className="text-xs text-neutral-700 dark:text-neutral-300">
                      {batch.totalOvos}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Nascidos</span>
                    <strong className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                      {hatched} pintos
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Taxa Eclosão</span>
                    <strong className={`text-xs font-bold ${
                      hatchRate >= 80 ? 'text-emerald-600' : hatchRate >= 60 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {hatchRate}%
                    </strong>
                  </div>
                </div>

                {/* Balanço Financeiro do Lote */}
                <div className="p-3 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Resultado Financeiro:</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      Custo {formatBRL(batch.investimento || 0)} • Receita {formatBRL(revenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className={`text-xs font-black block ${
                      profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}>
                      {profit >= 0 ? `+${formatBRL(profit)}` : formatBRL(profit)}
                    </strong>
                    <span className="text-[9px] text-neutral-400">
                      {profit >= 0 ? 'Lucro Líquido' : 'Prejuízo'}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => onSelectBatch(batch)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#D35400] dark:text-[#FFB07F] font-bold text-xs hover:bg-orange-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalhes</span>
                  </button>

                  <button
                    onClick={() => onGoToFinance(batch.id)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-200 transition flex items-center justify-center gap-1.5"
                    title="Ver no Financeiro"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Financeiro</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja reabrir o lote '${batch.nome}' para a aba de Lotes Ativos?`)) {
                        onReopenBatch(batch.id);
                        onToast('Lote reaberto com sucesso!');
                      }
                    }}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
                    title="Reabrir Ninhada"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja apagar permanentemente o lote histórico '${batch.nome}'?`)) {
                        onDeleteBatch(batch.id);
                        onToast('Registro histórico excluído.');
                      }
                    }}
                    className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Excluir Registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
