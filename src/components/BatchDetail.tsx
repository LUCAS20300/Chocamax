import React, { useState, useEffect } from 'react';
import { IncubationBatch } from '../types';
import { calculateIncubationStatus, formatBRDate, formatBRDateTime } from '../utils/incubation';
import { downloadICSFile } from '../utils/calendar';
import { playChirpSound, triggerVibration, showBrowserNotification, requestNotificationPermission } from '../utils/audio';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Edit,
  FolderArchive,
  RotateCw,
  Sparkles,
  Thermometer,
  Trash2,
  Volume2
} from 'lucide-react';

interface BatchDetailProps {
  batch: IncubationBatch;
  onClose: () => void;
  onEdit: (batch: IncubationBatch) => void;
  onDelete: (batchId: string) => void;
  onArchiveToggle: (batchId: string) => void;
  onRecordTurn: (batchId: string) => void;
  onUpdateBatch: (updated: IncubationBatch) => void;
  onGoToFinance: (batchId: string) => void;
  onToggleComplete: (batchId: string) => void;
  onToast: (msg: string) => void;
}

export const BatchDetail: React.FC<BatchDetailProps> = ({
  batch,
  onClose,
  onEdit,
  onDelete,
  onArchiveToggle,
  onRecordTurn,
  onUpdateBatch,
  onGoToFinance,
  onToggleComplete,
  onToast
}) => {
  const [editingStats, setEditingStats] = useState(false);
  const [totalOvos, setTotalOvos] = useState(batch.totalOvos);
  const [ovosFerteis, setOvosFerteis] = useState<number | ''>(batch.ovosFerteis ?? '');
  const [ovosNascidos, setOvosNascidos] = useState<number | ''>(batch.ovosNascidos ?? '');
  const [notes, setNotes] = useState(batch.anotacoes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [countdownText, setCountdownText] = useState<string>('');

  const status = calculateIncubationStatus(batch);

  // Update countdown
  useEffect(() => {
    const updateTimer = () => {
      if (!status.proximaViradaDate || status.isLockdown || status.isConcluido) {
        setCountdownText('');
        return;
      }
      const nowMs = Date.now();
      const targetMs = status.proximaViradaDate.getTime();
      const diffMs = targetMs - nowMs;

      if (diffMs <= 0) {
        setCountdownText('Virada atrasada ou pronta para girar!');
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setCountdownText(`${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status.proximaViradaDate, status.isLockdown, status.isConcluido]);

  const handleSaveStats = () => {
    const fertVal = ovosFerteis === '' ? undefined : Number(ovosFerteis);
    const nascVal = ovosNascidos === '' ? 0 : Number(ovosNascidos);

    const updated: IncubationBatch = {
      ...batch,
      totalOvos: Number(totalOvos),
      ovosFerteis: fertVal,
      ovosNascidos: nascVal
    };
    onUpdateBatch(updated);
    setEditingStats(false);
    onToast('Estatísticas e ovoscopia atualizadas!');
  };

  const handleSaveNotes = () => {
    onUpdateBatch({
      ...batch,
      anotacoes: notes
    });
    setIsEditingNotes(false);
    onToast('Anotações salvas!');
  };

  const handleTestNotifications = async () => {
    const granted = await requestNotificationPermission();
    playChirpSound();
    triggerVibration([200, 100, 200]);
    if (granted) {
      showBrowserNotification('🔔 Teste: Chocadeira Fácil', {
        body: `Lembretes ativos para ${batch.nome}! O som e a vibração funcionam perfeitamente.`
      });
      onToast('Notificação, som e vibração acionados!');
    } else {
      onToast('Som e vibração tocaram! Permissão do navegador não concedida.');
    }
  };

  const handleCalendarDownload = () => {
    downloadICSFile(batch);
    onToast('Calendário .ics baixado! Abra o arquivo para adicionar à sua agenda.');
  };

  const handleDelete = () => {
    if (confirm(`Excluir Lote? Tem certeza que deseja apagar o lote '${batch.nome}'? Todos os registros e lembretes serão cancelados.`)) {
      onDelete(batch.id);
      onClose();
    }
  };

  // Real hatch rate calculation
  const calculatedRealHatchRate = () => {
    const fert = batch.ovosFerteis ?? batch.totalOvos;
    const nasc = batch.ovosNascidos ?? 0;
    if (fert > 0) {
      return Math.round((nasc / fert) * 100);
    }
    return 0;
  };

  // Milestones array for chronological display
  const milestones = [
    {
      label: 'Início da Incubação',
      sub: 'Colocação dos ovos',
      dia: 1,
      date: status.dataInicioDate,
      isDone: status.diaAtual >= 1,
      isCurrent: status.diaAtual === 1 && !status.isFuturo,
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      label: '1ª Ovoscopia (Checagem)',
      sub: 'Descarte ovos claros',
      dia: batch.diaOvoscopia1,
      date: status.dataOvoscopia1Date,
      isDone: status.diaAtual > batch.diaOvoscopia1,
      isCurrent: status.diaAtual === batch.diaOvoscopia1,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: '2ª Ovoscopia (Embrião)',
      sub: 'Avaliação câmara de ar',
      dia: batch.diaOvoscopia2,
      date: status.dataOvoscopia2Date,
      isDone: status.diaAtual > batch.diaOvoscopia2,
      isCurrent: status.diaAtual === batch.diaOvoscopia2,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Parar Viragem (Lockdown)',
      sub: 'Trava roletes & umidade alta',
      dia: batch.diaPararVirada,
      date: status.dataLockdownDate,
      isDone: status.diaAtual > batch.diaPararVirada,
      isCurrent: status.diaAtual >= batch.diaPararVirada && !status.isConcluido,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      label: 'Nascimento / Eclosão 🐣',
      sub: 'Chegada dos pintinhos!',
      dia: batch.diasTotais,
      date: status.dataEclosaoDate,
      isDone: status.isConcluido,
      isCurrent: status.diaAtual === batch.diasTotais,
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex justify-center">
      <div className="w-full max-w-lg min-h-screen bg-[#FAF7F2] dark:bg-[#171311] text-[#2C2523] dark:text-[#EFE9E4] flex flex-col pb-20 shadow-2xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#221C1A]/95 backdrop-blur-md px-4 py-3.5 border-b border-orange-500/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 p-2 -ml-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-[#D35400] dark:text-[#FFB07F]" />
            <span className="font-semibold text-sm">Voltar aos Lotes</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(batch)}
              title="Editar Lote"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onArchiveToggle(batch.id)}
              title={batch.arquivado ? 'Desarquivar' : 'Arquivar'}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <FolderArchive className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Excluir Lote"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Main Hero Card */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-3xl shadow-xs">
                {batch.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#2C2523] dark:text-[#EFE9E4] leading-tight">
                    {batch.nome}
                  </h2>
                  {batch.arquivado && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Arquivado
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {batch.especie} • {batch.totalOvos} ovos
                </p>
              </div>
            </div>

            {/* Início e Saída */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-orange-50/60 dark:bg-neutral-900/60 p-3 rounded-2xl border border-orange-100 dark:border-neutral-800">
              <div>
                <span className="text-neutral-400 text-[11px] block font-semibold">
                  📅 Dia que Iniciou
                </span>
                <strong className="text-neutral-800 dark:text-neutral-200 block mt-0.5">
                  {formatBRDate(status.dataInicioDate)}
                </strong>
                <span className="text-[10px] text-neutral-400 block">
                  Colocação dos ovos
                </span>
              </div>
              <div className="border-l border-orange-200/60 dark:border-neutral-800 pl-2">
                <span className="text-neutral-400 text-[11px] block font-semibold">
                  {status.isConcluido ? '🐣 Dia que Saiu' : '🐣 Previsão de Saída'}
                </span>
                <strong className="text-[#D35400] dark:text-[#FFB07F] block mt-0.5">
                  {formatBRDate(status.dataSaidaDate)}
                </strong>
                <span className="text-[10px] text-neutral-400 block">
                  {status.isConcluido ? 'Término da incubação' : 'Data de eclosão'}
                </span>
              </div>
            </div>

            {/* Barra de Progresso e Dia */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#D35400] dark:text-[#FFB07F] text-sm">
                  {status.isFuturo
                    ? 'Aguardando início'
                    : status.isConcluido
                    ? 'Incubação Concluída!'
                    : `Dia ${status.diaAtual} de ${batch.diasTotais}`}
                </span>
                <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                  Progresso: {status.progressoPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
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
              <div className="flex justify-between items-center text-[11px] text-neutral-400 mt-1">
                <span>Dia 1</span>
                <span>
                  {status.isFuturo
                    ? `Faltam ${status.diasRestantes} dias`
                    : status.isConcluido
                    ? 'Finalizado'
                    : `Restam ${status.diasRestantes} dias`}
                </span>
                <span>Dia {batch.diasTotais}</span>
              </div>
            </div>
          </div>

          {/* Cronograma & Marcos da Incubação */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
                <span>Cronograma & Marcos da Incubação</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Datas calculadas automaticamente para {batch.especie}
              </p>
            </div>

            <div className="relative pl-6 space-y-4 border-l-2 border-orange-200 dark:border-neutral-800 ml-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot status indicator */}
                  <div className="absolute -left-[31px] top-0.5">
                    {m.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white dark:bg-[#221C1A] rounded-full" />
                    ) : m.isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#D35400] bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#D35400] animate-ping" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-700 bg-white dark:bg-[#221C1A] rounded-full" />
                    )}
                  </div>

                  <div className={`p-3 rounded-2xl border transition ${
                    m.isCurrent
                      ? 'border-[#D35400] bg-orange-50/60 dark:bg-orange-950/30'
                      : m.isDone
                      ? 'border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-900/40'
                      : 'border-dashed border-neutral-200 dark:border-neutral-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                          m.isCurrent
                            ? 'bg-[#D35400] text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          D{m.dia}
                        </span>
                        <strong className="text-xs text-neutral-800 dark:text-neutral-200">
                          {m.label}
                        </strong>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {formatBRDate(m.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 pl-0.5">
                      {m.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parâmetros Recomendados da Chocadeira */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
              <span>Parâmetros Recomendados da Chocadeira</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Temperatura</span>
                <span className="text-base font-black text-amber-700 dark:text-amber-300">
                  {batch.temperaturaIdeal}°C
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">Constante</span>
              </div>

              <div className={`p-3 rounded-2xl border transition ${
                !status.isLockdown && !status.isConcluido
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
              }`}>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Umidade Inicial</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-300">
                  {batch.umidadeInicial}%
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">Dias 1 ao {batch.diaPararVirada - 1}</span>
              </div>

              <div className={`p-3 rounded-2xl border transition ${
                status.isLockdown
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
              }`}>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">Umidade Eclosão</span>
                <span className="text-base font-black text-red-600 dark:text-red-300">
                  {batch.umidadeEclosao}%
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">Fase Lockdown</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
              💡 <strong>Dica de Umidade:</strong> {status.isLockdown
                ? `Fase atual: Eleve a umidade imediatamente para ${batch.umidadeEclosao}% adicionando água nas canaletas extras para amaciar as membranas do ovo.`
                : `Mantenha a umidade em torno de ${batch.umidadeInicial}% até o D${batch.diaPararVirada}. Não deixe faltar água no reservatório.`}
            </p>
          </div>

          {/* Cartão: Virada dos Ovos */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
                <span>Virada dos Ovos</span>
              </h3>
              <span className="text-xs font-bold text-[#D35400] dark:text-[#FFB07F]">
                Viradas hoje: {status.viradasHoje}/{batch.metaViradasDia}
              </span>
            </div>

            {status.isLockdown ? (
              /* AVISO VERMELHO NA FASE DE LOCKDOWN */
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-500 text-red-900 dark:text-red-100 space-y-2.5">
                <div className="flex items-center gap-2 text-base font-black text-red-600 dark:text-red-400">
                  <span className="text-2xl">🛑</span>
                  <span>Fase de Eclosão (Lockdown): NÃO VIRE MAIS OS OVOS!</span>
                </div>
                <p className="text-xs leading-relaxed font-semibold">
                  O embrião está se posicionando para piar a casca. Mantenha a chocadeira fechada.
                </p>
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800 text-xs font-bold space-y-1">
                  <p>⚠️ Trave a rolagem dos ovos!</p>
                  <p>💧 Aumente a umidade para {batch.umidadeEclosao}% e não abra a tampa.</p>
                </div>
              </div>
            ) : status.isConcluido ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs text-center font-bold">
                🎉 Incubação concluída! Os pintinhos já nasceram.
              </div>
            ) : (
              /* MODO NORMAL DE VIRADA */
              <div className="space-y-4">
                {/* Próximo lembrete countdown */}
                {batch.intervaloViradaHoras > 0 ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Próxima virada em:
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#D35400] dark:text-[#FFB07F]">
                      {countdownText || 'Calculando...'}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 italic">
                    Lembretes automáticos desligados para este lote.
                  </div>
                )}

                {/* Botão Registrar Virada Agora */}
                <button
                  onClick={() => onRecordTurn(batch.id)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-sm shadow hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Registrar Virada Agora</span>
                </button>

                {/* Histórico das Últimas Viradas */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
                    Últimas Viradas Registradas:
                  </h4>
                  {(!batch.viradas || batch.viradas.length === 0) ? (
                    <p className="text-xs text-neutral-400 italic">
                      Nenhuma virada registrada ainda. Use o botão acima para registrar a primeira!
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {[...batch.viradas]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 5)
                        .map((turn, i) => (
                          <div
                            key={turn.id || i}
                            className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800"
                          >
                            <span className="font-medium">
                              Virada #{batch.viradas.length - i}
                            </span>
                            <span className="font-mono text-[11px] text-neutral-500">
                              {formatBRDateTime(turn.timestamp)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cartão: Estatísticas & Ovoscopia */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Estatísticas & Ovoscopia</span>
              </h3>
              <button
                onClick={() => setEditingStats(!editingStats)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {editingStats ? 'Cancelar' : 'Atualizar Ovos & Ovoscopia'}
              </button>
            </div>

            {editingStats ? (
              <div className="space-y-3 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Total de Ovos Colocados
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalOvos}
                    onChange={(e) => setTotalOvos(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Ovos Férteis (após ovoscopia)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 34"
                    value={ovosFerteis}
                    onChange={(e) => setOvosFerteis(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Ovos que Eclodiram (Pintinhos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 28"
                    value={ovosNascidos}
                    onChange={(e) => setOvosNascidos(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <button
                  onClick={handleSaveStats}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
                >
                  Salvar Ovos & Ovoscopia
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Colocados</span>
                  <span className="text-lg font-black text-neutral-800 dark:text-neutral-200">
                    {batch.totalOvos}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
                  <span className="text-[10px] text-purple-600 dark:text-purple-300 block">Férteis</span>
                  <span className="text-lg font-black text-purple-700 dark:text-purple-300">
                    {batch.ovosFerteis ?? '—'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-300 block">Nascidos</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {batch.ovosNascidos ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* Taxa de Eclosão Real */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold block text-sm">
                Taxa de Eclosão Real: {calculatedRealHatchRate()}% dos ovos férteis nasceram!
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Calculado com base em {batch.ovosNascidos ?? 0} nascidos de {batch.ovosFerteis ?? batch.totalOvos} ovos analisados.
              </span>
            </div>
          </div>

          {/* Anotações do Lote */}
          <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Anotações do Lote
              </h3>
              <button
                onClick={() => {
                  if (isEditingNotes) handleSaveNotes();
                  else setIsEditingNotes(true);
                }}
                className="text-xs font-bold text-[#D35400] dark:text-[#FFB07F] hover:underline"
              >
                {isEditingNotes ? 'Salvar Anotação' : 'Editar'}
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs focus:outline-none focus:border-[#D35400]"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-2 rounded-xl bg-[#D35400] text-white font-bold text-xs"
                >
                  Concluir Anotação
                </button>
              </div>
            ) : (
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-2xl border border-neutral-200/50 dark:border-neutral-800">
                {batch.anotacoes ? batch.anotacoes : 'Nenhuma anotação registrada ainda.'}
              </p>
            )}
          </div>

          {/* Botões de Ação Especiais */}
          <div className="space-y-3">
            {/* Concluir ou Reabrir Ciclo */}
            <button
              onClick={() => onToggleComplete(batch.id)}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow transition flex items-center justify-center gap-2 min-h-[48px] active:scale-98 ${
                status.isConcluido
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 hover:opacity-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {status.isConcluido
                  ? 'Reabrir Ninhada para Lotes Ativos'
                  : '🏁 Concluir Ciclo & Salvar na Aba Concluídos'}
              </span>
            </button>

            {/* Ver Financeiro deste lote */}
            <button
              onClick={() => onGoToFinance(batch.id)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm shadow hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 min-h-[48px]"
            >
              <DollarSign className="w-4 h-4" />
              <span>Ver Financeiro deste lote 💰</span>
            </button>

            {/* Adicionar lembretes ao calendário */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
              <button
                onClick={handleCalendarDownload}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Adicionar lembretes ao calendário do celular (.ics)</span>
              </button>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-tight text-center">
                Toque no botão e abra o arquivo baixado para sincronizar todos os alarmes de virada e ovoscopia com o calendário do seu celular.
              </p>
            </div>

            {/* Testar Notificações */}
            <button
              onClick={handleTestNotifications}
              className="w-full py-3 px-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Testar Notificações (Som e Vibração)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
