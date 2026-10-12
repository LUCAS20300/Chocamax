import React, { useState } from 'react';
import { IncubationBatch } from '../types';
import { formatBRL } from '../utils/incubation';
import { AlertTriangle, Calculator, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface FinanceTabProps {
  batches: IncubationBatch[];
  selectedBatchId: string | 'all';
  onSelectBatchId: (id: string | 'all') => void;
  onUpdateBatch: (updated: IncubationBatch) => void;
  onToast: (msg: string) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onUpdateBatch,
  onToast
}) => {
  const [customSimPrice, setCustomSimPrice] = useState<number>(12);

  // Helper to parse input values supporting commas and dots
  const parseNumberInput = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const activeBatch = batches.find((b) => b.id === selectedBatchId);

  // Handlers for active batch editing
  const handleFieldChange = (field: keyof IncubationBatch, value: number) => {
    if (!activeBatch) return;
    const updated: IncubationBatch = {
      ...activeBatch,
      [field]: value
    };
    // Sync ovosNascidos with pintos nascidos
    if (field === 'ovosNascidos') {
      updated.ovosNascidos = value;
    }
    onUpdateBatch(updated);
  };

  // Calculations for single batch
  const investment = activeBatch?.investimento ?? 0;
  const totalEggs = activeBatch?.totalOvos ?? 0;
  const lostEggs = activeBatch?.ovosPerdidos ?? 0;
  const hatchedChicks = activeBatch?.ovosNascidos ?? 0;
  const pricePerChick = activeBatch?.valorCadaPinto ?? 5;
  const actualReceived = activeBatch?.valorRecebido ?? 0;
  const fertileEggs = activeBatch?.ovosFerteis ?? 0;

  // Hatch rate on total
  const hatchRateTotal = totalEggs > 0 ? (hatchedChicks / totalEggs) * 100 : 0;
  // Hatch rate on fertile
  const hatchRateFertile = fertileEggs > 0 ? (hatchedChicks / fertileEggs) * 100 : null;
  // Loss rate
  const lossRate = totalEggs > 0 ? (lostEggs / totalEggs) * 100 : 0;

  // Financial metrics
  const totalProjected = hatchedChicks * pricePerChick;
  const profitOrLoss = totalProjected - investment;
  const costPerChick = hatchedChicks > 0 ? investment / hatchedChicks : null;
  const breakevenPrice = hatchedChicks > 0 ? investment / hatchedChicks : null;

  // Warning check
  const isOverEggs = hatchedChicks + lostEggs > totalEggs && totalEggs > 0;

  // Summary for "Todos os lotes"
  const totalAllInvestment = batches.reduce((acc, b) => acc + (b.investimento || 0), 0);
  const totalAllEggs = batches.reduce((acc, b) => acc + (b.totalOvos || 0), 0);
  const totalAllLosses = batches.reduce((acc, b) => acc + (b.ovosPerdidos || 0), 0);
  const totalAllHatched = batches.reduce((acc, b) => acc + (b.ovosNascidos || 0), 0);
  const totalAllProjected = batches.reduce((acc, b) => acc + ((b.ovosNascidos || 0) * (b.valorCadaPinto || 0)), 0);
  const totalAllProfit = totalAllProjected - totalAllInvestment;
  const overallHatchRate = totalAllEggs > 0 ? (totalAllHatched / totalAllEggs) * 100 : 0;

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Title & Selector */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h2 className="text-lg font-black text-[#2C2523] dark:text-[#EFE9E4]">
              Financeiro da Chocadeira
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#2E7D32] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Controle de Custos & Lucro
          </span>
        </div>

        {/* Lote Selector Dropdown */}
        <div>
          <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1.5">
            Selecione o Lote para Gestão Financeira:
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => onSelectBatchId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-[#2C2523] dark:text-[#EFE9E4] focus:outline-none focus:border-[#D35400]"
          >
            <option value="all">📊 Todos os lotes (resumo geral)</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.emoji} {b.nome} ({b.totalOvos} ovos)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW: TODOS OS LOTES (RESUMO GERAL) */}
      {selectedBatchId === 'all' ? (
        <div className="space-y-4">
          {/* Card Resumo Geral */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
              <span>Resumo Consolidado de Todas as Ninhadas</span>
            </h3>

            {/* Big Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-semibold">
                  Investimento Total
                </span>
                <span className="text-lg font-black text-[#D35400] dark:text-[#FFB07F]">
                  {formatBRL(totalAllInvestment)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-semibold">
                  Receita Prevista
                </span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-300">
                  {formatBRL(totalAllProjected)}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border col-span-2 ${
                totalAllProfit >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold block uppercase tracking-wider">
                      {totalAllProfit >= 0 ? 'Lucro Total Estimado' : 'Prejuízo Total Estimado'}
                    </span>
                    <span className="text-2xl font-black">
                      {formatBRL(totalAllProfit)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-black/20">
                    {totalAllProfit >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Egg counts */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <span className="text-[10px] text-neutral-400 block">Total Ovos</span>
                <strong className="text-sm">{totalAllEggs}</strong>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <span className="text-[10px] text-neutral-400 block">Perdas</span>
                <strong className="text-sm text-red-500">{totalAllLosses}</strong>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <span className="text-[10px] text-neutral-400 block">Nascidos</span>
                <strong className="text-sm text-emerald-600">{totalAllHatched}</strong>
              </div>
            </div>

            {/* Hatch rate banner */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Taxa Geral de Eclosão:</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                {overallHatchRate.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Lista de Lucro por Lote */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Detalhamento de Lucro por Lote
            </h3>

            {batches.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Nenhum lote cadastrado no momento.</p>
            ) : (
              <div className="space-y-2">
                {batches.map((b) => {
                  const bHatched = b.ovosNascidos || 0;
                  const bPrice = b.valorCadaPinto || 0;
                  const bRevenue = bHatched * bPrice;
                  const bProfit = bRevenue - (b.investimento || 0);
                  return (
                    <div
                      key={b.id}
                      onClick={() => onSelectBatchId(b.id)}
                      className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-400 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{b.emoji}</span>
                        <div>
                          <strong className="text-xs text-neutral-800 dark:text-neutral-200 block line-clamp-1">
                            {b.nome}
                          </strong>
                          <span className="text-[10px] text-neutral-400">
                            {bHatched} pintos • Custo {formatBRL(b.investimento || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black block ${
                          bProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}>
                          {bProfit >= 0 ? `+${formatBRL(bProfit)}` : formatBRL(bProfit)}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {bProfit >= 0 ? 'Lucro' : 'Prejuízo'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : activeBatch ? (
        /* VIEW: LOTE ESPECÍFICO */
        <div className="space-y-4">
          {/* Card: Dados Financeiros do Lote */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeBatch.emoji}</span>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                  {activeBatch.nome}
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-semibold">
                Edite os valores abaixo
              </span>
            </div>

            {/* Inputs de Gestão */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Valor de investimento (R$)
                </label>
                <input
                  type="text"
                  defaultValue={activeBatch.investimento}
                  onBlur={(e) => handleFieldChange('investimento', parseNumberInput(e.target.value))}
                  placeholder="Gasto com ovos, ração, luz etc."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold focus:outline-none focus:border-[#D35400]"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Ex: 150 ou 150,00
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total de ovos colocados
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={activeBatch.totalOvos}
                    onChange={(e) => handleFieldChange('totalOvos', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ovos perdidos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activeBatch.ovosPerdidos || ''}
                    onChange={(e) => handleFieldChange('ovosPerdidos', Number(e.target.value))}
                    placeholder="Claros, anel, quebra"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Pintos nascidos 🐣
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activeBatch.ovosNascidos ?? ''}
                    onChange={(e) => handleFieldChange('ovosNascidos', Number(e.target.value))}
                    placeholder="Ex: 25"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Valor de cada pinto (R$)
                  </label>
                  <input
                    type="text"
                    defaultValue={activeBatch.valorCadaPinto || 5}
                    onBlur={(e) => handleFieldChange('valorCadaPinto', parseNumberInput(e.target.value))}
                    placeholder="Preço de venda"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-[#D35400] dark:text-[#FFB07F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Valor realmente recebido (R$) (opcional)
                </label>
                <input
                  type="text"
                  defaultValue={activeBatch.valorRecebido || ''}
                  onBlur={(e) => handleFieldChange('valorRecebido', parseNumberInput(e.target.value))}
                  placeholder="Para quando já vendeu os pintinhos"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold focus:outline-none focus:border-[#D35400]"
                />
              </div>
            </div>

            {/* ALERTA SE NASCIDOS + PERDIDOS > TOTAL DE OVOS */}
            {isOverEggs && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2.5 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Confira os números: nascidos + perdidos passam do total de ovos.</span>
              </div>
            )}
          </div>

          {/* Card: Cálculos Automáticos */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400" />
              <span>Resultados & Taxas em Tempo Real</span>
            </h3>

            {/* Taxa de Eclosão com Barra Colorida */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Taxa de Eclosão (Geral):
                </span>
                <span className={`font-black text-sm ${
                  hatchRateTotal >= 80 ? 'text-emerald-600' : hatchRateTotal >= 60 ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {totalEggs > 0 ? `${hatchRateTotal.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hatchRateTotal >= 80 ? 'bg-emerald-500' : hatchRateTotal >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, hatchRateTotal))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>0%</span>
                <span>Alerta (&lt;60%)</span>
                <span>Bom (60-80%)</span>
                <span>Excelente (&gt;80%)</span>
              </div>
            </div>

            {/* Outras Taxas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-semibold">Eclosão s/ Férteis</span>
                <strong className="text-sm text-purple-600 dark:text-purple-300">
                  {hatchRateFertile !== null ? `${hatchRateFertile.toFixed(1)}%` : '— (sem dados de férteis)'}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-semibold">Taxa de Perda</span>
                <strong className="text-sm text-red-500">
                  {totalEggs > 0 ? `${lossRate.toFixed(1)}%` : '—'}
                </strong>
              </div>
            </div>

            {/* Destaque Financeiro: Valor Previsto e Lucro */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-semibold">
                  Valor Total Previsto
                </span>
                <strong className="text-base text-blue-600 dark:text-blue-300 font-black">
                  {formatBRL(totalProjected)}
                </strong>
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  ({hatchedChicks} pintos × {formatBRL(pricePerChick)})
                </span>
              </div>

              <div className={`p-3 rounded-2xl border ${
                profitOrLoss >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200'
              }`}>
                <span className="text-[10px] block font-semibold">
                  {profitOrLoss >= 0 ? 'Lucro Estimado' : 'Prejuízo Estimado'}
                </span>
                <strong className="text-base font-black">
                  {formatBRL(profitOrLoss)}
                </strong>
                <span className="text-[9px] opacity-80 block mt-0.5">
                  Receita − Investimento
                </span>
              </div>
            </div>

            {/* Custo por pinto & Ponto de Equilíbrio */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-semibold">Custo por Pinto</span>
                <strong className="text-sm text-neutral-800 dark:text-neutral-200">
                  {costPerChick !== null ? formatBRL(costPerChick) : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-semibold">Preço Mínimo (Zero Prejuízo)</span>
                <strong className="text-sm text-neutral-800 dark:text-neutral-200">
                  {breakevenPrice !== null ? formatBRL(breakevenPrice) : '—'}
                </strong>
              </div>
            </div>
          </div>

          {/* Simulador de Preços */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <span>💡</span>
                <span>Simulador: &quot;E se eu vender por...?&quot;</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Veja o lucro com os {hatchedChicks} pintos nascidos deste lote em diferentes preços:
              </p>
            </div>

            <div className="space-y-2">
              {[3, 5, 7, 10].map((simPrice) => {
                const simRevenue = hatchedChicks * simPrice;
                const simProfit = simRevenue - investment;
                return (
                  <div
                    key={simPrice}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-neutral-800 dark:text-neutral-200 text-sm">
                        R$ {simPrice},00 / pinto
                      </strong>
                      <span className="text-[10px] text-neutral-400 block">
                        Receita: {formatBRL(simRevenue)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm ${
                        simProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        {simProfit >= 0 ? `+${formatBRL(simProfit)}` : formatBRL(simProfit)}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {simProfit >= 0 ? 'Lucro' : 'Prejuízo'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Preço Customizado */}
              <div className="p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D35400] dark:text-[#FFB07F]">
                    Preço Personalizado:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">R$</span>
                    <input
                      type="number"
                      min="1"
                      value={customSimPrice}
                      onChange={(e) => setCustomSimPrice(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                {(() => {
                  const customRevenue = hatchedChicks * (customSimPrice || 0);
                  const customProfit = customRevenue - investment;
                  return (
                    <div className="flex items-center justify-between pt-1 border-t border-orange-200 dark:border-orange-900/40 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Receita Prevista:</span>
                        <strong className="text-neutral-800 dark:text-neutral-200">{formatBRL(customRevenue)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block">Resultado:</span>
                        <strong className={`font-black text-sm ${
                          customProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}>
                          {customProfit >= 0 ? `+${formatBRL(customProfit)}` : formatBRL(customProfit)}
                        </strong>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-[#221C1A] rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 text-sm">Nenhum lote selecionado.</p>
        </div>
      )}
    </div>
  );
};
