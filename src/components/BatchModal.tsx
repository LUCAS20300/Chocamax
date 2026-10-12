import React, { useState, useEffect } from 'react';
import { IncubationBatch, SpeciesPreset } from '../types';
import { SPECIES_PRESETS } from '../data/species';
import { formatBRDate } from '../utils/incubation';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batchData: Omit<IncubationBatch, 'id' | 'viradas'>, editId?: string) => void;
  initialBatch?: IncubationBatch | null;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBatch
}) => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('galinha');
  const [nome, setNome] = useState('');
  const [diasTotais, setDiasTotais] = useState(21);
  const [diaOvoscopia1, setDiaOvoscopia1] = useState(7);
  const [diaOvoscopia2, setDiaOvoscopia2] = useState(14);
  const [diaPararVirada, setDiaPararVirada] = useState(18);
  const [dataInicio, setDataInicio] = useState('');
  const [temperaturaIdeal, setTemperaturaIdeal] = useState(37.7);
  const [umidadeInicial, setUmidadeInicial] = useState(55);
  const [umidadeEclosao, setUmidadeEclosao] = useState(75);
  const [intervaloViradaHoras, setIntervaloViradaHoras] = useState(4);
  const [metaViradasDia, setMetaViradasDia] = useState(4);
  const [notificacoesLigadas, setNotificacoesLigadas] = useState(true);
  const [totalOvos, setTotalOvos] = useState(30);
  const [anotacoes, setAnotacoes] = useState('');

  // Initial load or edit mode
  useEffect(() => {
    if (initialBatch) {
      const match = SPECIES_PRESETS.find((s) => s.nome === initialBatch.especie);
      setSelectedSpeciesId(match ? match.id : 'personalizado');
      setNome(initialBatch.nome);
      setDiasTotais(initialBatch.diasTotais);
      setDiaOvoscopia1(initialBatch.diaOvoscopia1);
      setDiaOvoscopia2(initialBatch.diaOvoscopia2);
      setDiaPararVirada(initialBatch.diaPararVirada);
      setDataInicio(initialBatch.dataInicio);
      setTemperaturaIdeal(initialBatch.temperaturaIdeal);
      setUmidadeInicial(initialBatch.umidadeInicial);
      setUmidadeEclosao(initialBatch.umidadeEclosao);
      setIntervaloViradaHoras(initialBatch.intervaloViradaHoras);
      setMetaViradasDia(initialBatch.metaViradasDia);
      setNotificacoesLigadas(initialBatch.notificacoesLigadas);
      setTotalOvos(initialBatch.totalOvos);
      setAnotacoes(initialBatch.anotacoes || '');
    } else {
      // Default to Galinha with today's date
      const galinha = SPECIES_PRESETS[0];
      setSelectedSpeciesId(galinha.id);
      setNome('Lote de Galinha');
      setDiasTotais(galinha.diasTotais);
      setDiaOvoscopia1(galinha.diaOvoscopia1);
      setDiaOvoscopia2(galinha.diaOvoscopia2);
      setDiaPararVirada(galinha.diaPararVirada);
      setTemperaturaIdeal(galinha.temperatura);
      setUmidadeInicial(galinha.umidadeInicial);
      setUmidadeEclosao(galinha.umidadeEclosao);
      setIntervaloViradaHoras(galinha.intervaloViradaPadrao);
      setMetaViradasDia(galinha.metaViradasPadrao);
      setTotalOvos(30);
      setAnotacoes('');
      setNotificacoesLigadas(true);

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setDataInicio(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }
  }, [initialBatch, isOpen]);

  if (!isOpen) return null;

  const handleSelectSpecies = (preset: SpeciesPreset) => {
    setSelectedSpeciesId(preset.id);
    if (!initialBatch || nome.startsWith('Lote de ')) {
      setNome(`Lote de ${preset.nome.split('/')[0].trim()}`);
    }
    setDiasTotais(preset.diasTotais);
    setDiaOvoscopia1(preset.diaOvoscopia1);
    setDiaOvoscopia2(preset.diaOvoscopia2);
    setDiaPararVirada(preset.diaPararVirada);
    setTemperaturaIdeal(preset.temperatura);
    setUmidadeInicial(preset.umidadeInicial);
    setUmidadeEclosao(preset.umidadeEclosao);
    setIntervaloViradaHoras(preset.intervaloViradaPadrao);
    setMetaViradasDia(preset.metaViradasPadrao);
  };

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDataInicio(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  // Live preview calculation
  const startDate = dataInicio ? new Date(dataInicio) : new Date();
  const hatchDate = new Date(startDate.getTime() + diasTotais * 24 * 60 * 60 * 1000);
  const ovo1Date = new Date(startDate.getTime() + (diaOvoscopia1 - 1) * 24 * 60 * 60 * 1000);
  const ovo2Date = new Date(startDate.getTime() + (diaOvoscopia2 - 1) * 24 * 60 * 60 * 1000);
  const lockDate = new Date(startDate.getTime() + (diaPararVirada - 1) * 24 * 60 * 60 * 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o nome do lote.');
      return;
    }
    if (totalOvos <= 0) {
      alert('Informe a quantidade de ovos colocados.');
      return;
    }

    const currentSpecies = SPECIES_PRESETS.find((s) => s.id === selectedSpeciesId);

    const payload: Omit<IncubationBatch, 'id' | 'viradas'> = {
      nome: nome.trim(),
      especie: currentSpecies ? currentSpecies.nome : 'Personalizado',
      emoji: currentSpecies ? currentSpecies.emoji : '🐣',
      diasTotais: Number(diasTotais),
      diaOvoscopia1: Number(diaOvoscopia1),
      diaOvoscopia2: Number(diaOvoscopia2),
      diaPararVirada: Number(diaPararVirada),
      dataInicio: dataInicio || new Date().toISOString(),
      temperaturaIdeal: Number(temperaturaIdeal),
      umidadeInicial: Number(umidadeInicial),
      umidadeEclosao: Number(umidadeEclosao),
      intervaloViradaHoras: Number(intervaloViradaHoras),
      metaViradasDia: Number(metaViradasDia),
      notificacoesLigadas,
      totalOvos: Number(totalOvos),
      anotacoes: anotacoes.trim(),
      arquivado: initialBatch ? initialBatch.arquivado : false,
      ovosFerteis: initialBatch?.ovosFerteis,
      ovosNascidos: initialBatch?.ovosNascidos || 0,
      investimento: initialBatch?.investimento || 0,
      ovosPerdidos: initialBatch?.ovosPerdidos || 0,
      valorCadaPinto: initialBatch?.valorCadaPinto || 5,
      valorRecebido: initialBatch?.valorRecebido || 0
    };

    onSave(payload, initialBatch?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex justify-center">
      <div className="w-full max-w-lg min-h-screen bg-[#FAF7F2] dark:bg-[#171311] text-[#2C2523] dark:text-[#EFE9E4] flex flex-col pb-12 shadow-2xl">
        {/* Header with back button */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#221C1A]/95 backdrop-blur-md px-4 py-3.5 border-b border-orange-500/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 p-2 -ml-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-[#D35400] dark:text-[#FFB07F]" />
            <span className="font-semibold text-sm">Voltar</span>
          </button>
          <h2 className="font-bold text-base text-[#2C2523] dark:text-[#EFE9E4]">
            {initialBatch ? 'Editar Lote' : 'Agendar Nova Incubação'}
          </h2>
          <div className="w-12" />
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Seção Espécie & Duração */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#D35400] dark:text-[#FFB07F] flex items-center gap-2">
                <span>🐣</span>
                <span>Espécie & Duração</span>
              </label>
              <span className="text-xs text-neutral-400">Toque para selecionar</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SPECIES_PRESETS.map((preset) => {
                const isSelected = selectedSpeciesId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectSpecies(preset)}
                    className={`text-left p-3 rounded-2xl border transition relative min-h-[72px] flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D35400] bg-orange-50/80 dark:bg-orange-950/40 shadow-xs ring-2 ring-orange-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{preset.emoji}</span>
                      <span className="font-bold text-xs leading-tight line-clamp-1">{preset.nome.split('/')[0]}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Checagem: D{preset.diaOvoscopia1} e D{preset.diaOvoscopia2} • Trava: D{preset.diaPararVirada}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Bird Settings if 'personalizado' */}
            {selectedSpeciesId === 'personalizado' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3 mt-3">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Configurações Personalizadas:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Dias Totais
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={diasTotais}
                      onChange={(e) => setDiasTotais(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      1ª / 2ª Ovoscopia
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={diaOvoscopia1}
                        onChange={(e) => setDiaOvoscopia1(Number(e.target.value))}
                        className="w-1/2 px-2 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-center"
                      />
                      <span className="text-xs text-neutral-400">/</span>
                      <input
                        type="number"
                        min="2"
                        max="40"
                        value={diaOvoscopia2}
                        onChange={(e) => setDiaOvoscopia2(Number(e.target.value))}
                        className="w-1/2 px-2 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Parar Virada (D)
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="55"
                      value={diaPararVirada}
                      onChange={(e) => setDiaPararVirada(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm font-bold text-center text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Nome do Lote */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-2">
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block">
              Nome ou Identificação do Lote
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lote de Galinha Caipira #01"
              className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-semibold focus:outline-none focus:border-[#D35400] transition"
            />
          </section>

          {/* Início da Incubação */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block">
                  Início da Incubação
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Em qual dia os ovos foram ou serão colocados para chocar?
                </p>
              </div>
              <Calendar className="w-5 h-5 text-[#D35400] dark:text-[#FFB07F]" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSetQuickDate(0)}
                className="flex-1 py-2 px-3 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#D35400] dark:text-[#FFB07F] font-semibold text-xs hover:bg-orange-200 transition"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDate(-1)}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-200 transition"
              >
                Ontem
              </button>
            </div>

            <div>
              <input
                type="datetime-local"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-semibold focus:outline-none focus:border-[#D35400]"
              />
            </div>
          </section>

          {/* Ovos e Observações */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <div>
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                Quantidade Total de Ovos
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                required
                value={totalOvos}
                onChange={(e) => setTotalOvos(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-base font-bold focus:outline-none focus:border-[#D35400]"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                Observações (opcional: raça, fornecedor, etc.)
              </label>
              <textarea
                rows={2}
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                placeholder="Ex: Ovos de Índio Gigante e Brahma comprados em 12/10..."
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none focus:border-[#D35400]"
              />
            </div>
          </section>

          {/* Virada e Lembretes */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
                <span>Frequência dos Lembretes de Virada</span>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 2, label: '2h em 2h' },
                { val: 3, label: '3h em 3h' },
                { val: 4, label: '4h em 4h' },
                { val: 6, label: '6h em 6h' },
                { val: 8, label: '8h em 8h' },
                { val: 12, label: '12h em 12h' },
                { val: 0, label: 'Desligado' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setIntervaloViradaHoras(item.val)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                    intervaloViradaHoras === item.val
                      ? 'border-[#D35400] bg-orange-100 dark:bg-orange-950/60 text-[#D35400] dark:text-[#FFB07F]'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Meta diária */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <span>Meta diária de viragens:</span>
                <span className="text-[#D35400] dark:text-[#FFB07F] font-bold text-sm">
                  {metaViradasDia} viradas/dia
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={metaViradasDia}
                onChange={(e) => setMetaViradasDia(Number(e.target.value))}
                className="w-full accent-[#D35400]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>2x (mínimo)</span>
                <span>4x (recomendado)</span>
                <span>6x (alto)</span>
              </div>
            </div>

            {/* Switch lembrete */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Lembrete automático para girar os ovos durante a incubação
              </span>
              <button
                type="button"
                onClick={() => setNotificacoesLigadas(!notificacoesLigadas)}
                className={`w-12 h-6 rounded-full transition p-0.5 flex items-center ${
                  notificacoesLigadas ? 'bg-[#D35400] justify-end' : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </section>

          {/* Temperatura e Umidade */}
          <section className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Parâmetros da Chocadeira
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Temperatura
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperaturaIdeal}
                  onChange={(e) => setTemperaturaIdeal(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-center"
                />
                <span className="text-[10px] text-neutral-400 block text-center mt-0.5">°C</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Umidade Inicial
                </label>
                <input
                  type="number"
                  value={umidadeInicial}
                  onChange={(e) => setUmidadeInicial(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-center"
                />
                <span className="text-[10px] text-neutral-400 block text-center mt-0.5">%</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Umidade Eclosão
                </label>
                <input
                  type="number"
                  value={umidadeEclosao}
                  onChange={(e) => setUmidadeEclosao(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-center text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-[10px] text-neutral-400 block text-center mt-0.5">%</span>
              </div>
            </div>
          </section>

          {/* Prévia ao vivo / Calcular eclosão */}
          <section className="bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/5 dark:from-orange-950/40 dark:to-neutral-900 rounded-3xl p-5 border border-orange-400/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D35400] dark:text-[#FFB07F]">
              <Sparkles className="w-4 h-4" />
              <span>Calcular eclosão (Prévia ao Vivo)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#221C1A]/80 border border-orange-200 dark:border-orange-900/60 text-center space-y-1">
              <span className="text-[11px] font-black tracking-wider text-[#D35400] dark:text-[#FFB07F] uppercase">
                DATA PREVISTA DO NASCIMENTO 🐣
              </span>
              <div className="text-xl font-black text-[#2C2523] dark:text-[#EFE9E4]">
                {formatBRDate(hatchDate)}
              </div>
              <span className="text-xs text-neutral-500">
                ({diasTotais} dias de incubação)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[10px] text-neutral-400 block">1ª Ovoscopia</span>
                <strong className="text-purple-600 dark:text-purple-300">D{diaOvoscopia1}</strong>
                <span className="block text-[10px] text-neutral-500">{formatBRDate(ovo1Date)}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[10px] text-neutral-400 block">2ª Ovoscopia</span>
                <strong className="text-purple-600 dark:text-purple-300">D{diaOvoscopia2}</strong>
                <span className="block text-[10px] text-neutral-500">{formatBRDate(ovo2Date)}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[10px] text-neutral-400 block">Trava Virada</span>
                <strong className="text-red-600 dark:text-red-400">D{diaPararVirada}</strong>
                <span className="block text-[10px] text-neutral-500">{formatBRDate(lockDate)}</span>
              </div>
            </div>
          </section>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 min-h-[52px]"
            >
              <span>🐣</span>
              <span>{initialBatch ? 'Salvar Alterações' : 'Agendar e Iniciar Incubação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
