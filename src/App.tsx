import React, { useState, useEffect, useCallback } from 'react';
import { IncubationBatch, TabType } from './types';
import { loadBatches, saveBatches, createSampleBatch } from './utils/storage';
import { calculateIncubationStatus } from './utils/incubation';
import { playChirpSound, triggerVibration, showBrowserNotification } from './utils/audio';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { BatchCard } from './components/BatchCard';
import { BatchModal } from './components/BatchModal';
import { BatchDetail } from './components/BatchDetail';
import { ConcludedTab } from './components/ConcludedTab';
import { FinanceTab } from './components/FinanceTab';
import { GuideTab } from './components/GuideTab';
import { BackupModal } from './components/BackupModal';
import { InstallModal } from './components/InstallModal';
import { Toast } from './components/Toast';
import { AlertCircle, AlertTriangle, Archive, CheckCircle, PlusCircle, RotateCw, Sparkles } from 'lucide-react';

export default function App() {
  const [batches, setBatches] = useState<IncubationBatch[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('lotes');
  const [selectedBatchId, setSelectedBatchId] = useState<string | 'all'>('all');
  const [detailBatch, setDetailBatch] = useState<IncubationBatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<IncubationBatch | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chocadeira_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chocadeira_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chocadeira_theme', 'light');
    }
  }, [darkMode]);

  // Load batches on mount
  useEffect(() => {
    const loaded = loadBatches();
    setBatches(loaded);
  }, []);

  // Sync batches to localStorage whenever they change
  const updateBatchesState = useCallback((newBatches: IncubationBatch[]) => {
    setBatches(newBatches);
    saveBatches(newBatches);
    // Also sync currently viewed detail batch if updated
    if (detailBatch) {
      const match = newBatches.find((b) => b.id === detailBatch.id);
      setDetailBatch(match || null);
    }
  }, [detailBatch]);

  // Toast trigger
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Quick Turn from Card or Detail
  const handleRecordTurn = useCallback((batchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const target = batches.find((b) => b.id === batchId);
    if (!target) return;

    const newTurn = {
      id: `turn-${Date.now()}`,
      timestamp: Date.now()
    };

    const updatedBatch: IncubationBatch = {
      ...target,
      viradas: [...(target.viradas || []), newTurn]
    };

    const newBatches = batches.map((b) => (b.id === batchId ? updatedBatch : b));
    updateBatchesState(newBatches);

    playChirpSound();
    triggerVibration([150]);
    showToast('Virada rápida registrada! 🔄');
  }, [batches, updateBatchesState, showToast]);

  // Background check for notifications while app is open
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      batches.forEach((b) => {
        if (!b.notificacoesLigadas || b.arquivado) return;
        const status = calculateIncubationStatus(b, now);

        if (status.isLockdown) {
          // Check if we need to remind about lockdown
          // Only if interval matches or newly reached
          return;
        }

        if (b.intervaloViradaHoras > 0 && status.proximaViradaDate) {
          const timeUntil = status.proximaViradaDate.getTime() - now.getTime();
          // If within 10 seconds of scheduled time
          if (timeUntil <= 0 && timeUntil > -30000) {
            showBrowserNotification('🔄 Hora de virar os ovos!', {
              body: `${b.nome} • Dia ${status.diaAtual} de ${b.diasTotais}`
            });
          }
        }
      });
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [batches]);

  // Create / Edit Batch save
  const handleSaveBatch = (batchData: Omit<IncubationBatch, 'id' | 'viradas'>, editId?: string) => {
    if (editId) {
      // Edit existing
      const updated = batches.map((b) => {
        if (b.id === editId) {
          return {
            ...b,
            ...batchData
          };
        }
        return b;
      });
      updateBatchesState(updated);
      showToast('Lote atualizado com sucesso!');
    } else {
      // Create new
      const newBatch: IncubationBatch = {
        ...batchData,
        id: `batch-${Date.now()}`,
        viradas: []
      };
      updateBatchesState([newBatch, ...batches]);
      showToast('Nova ninhada agendada com sucesso! 🐣');
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    const remaining = batches.filter((b) => b.id !== batchId);
    updateBatchesState(remaining);
    if (selectedBatchId === batchId) setSelectedBatchId('all');
    showToast('Lote removido com sucesso.');
  };

  const handleArchiveToggle = (batchId: string) => {
    const updated = batches.map((b) => {
      if (b.id === batchId) {
        const nextState = !b.arquivado;
        showToast(nextState ? 'Lote arquivado.' : 'Lote desarquivado.');
        return { ...b, arquivado: nextState };
      }
      return b;
    });
    updateBatchesState(updated);
  };

  const handleUpdateBatchSingle = (updated: IncubationBatch) => {
    const list = batches.map((b) => (b.id === updated.id ? updated : b));
    updateBatchesState(list);
  };

  const handleToggleComplete = (batchId: string) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;
    const status = calculateIncubationStatus(target);
    const isAlreadyDone = status.isConcluido || target.concluido;

    if (isAlreadyDone) {
      const updated = batches.map((b) => {
        if (b.id === batchId) {
          return {
            ...b,
            concluido: false,
            dataSaida: undefined
          };
        }
        return b;
      });
      updateBatchesState(updated);
      showToast('Lote reaberto para a lista de lotes ativos.');
    } else {
      const nowIso = new Date().toISOString();
      const updated = batches.map((b) => {
        if (b.id === batchId) {
          return {
            ...b,
            concluido: true,
            dataSaida: nowIso
          };
        }
        return b;
      });
      updateBatchesState(updated);
      showToast('Ciclo concluído com sucesso e salvo na aba Concluídos! 🏁');
    }
  };

  // Filter batches
  const activeBatches = batches.filter((b) => !b.arquivado);
  const archivedBatches = batches.filter((b) => b.arquivado);

  const ongoingBatches = activeBatches.filter((b) => {
    const s = calculateIncubationStatus(b);
    return !s.isConcluido && !b.concluido;
  });

  const concludedBatches = batches.filter((b) => {
    const s = calculateIncubationStatus(b);
    return s.isConcluido || b.concluido;
  });

  const completedBatches = activeBatches.filter((b) => {
    const s = calculateIncubationStatus(b);
    return s.isConcluido || b.concluido;
  });

  // Overdue turns across ongoing active batches
  const overdueBatches = ongoingBatches.filter((b) => {
    const s = calculateIncubationStatus(b);
    return s.horasAtrasadas > 0 && !s.isLockdown;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#171311] text-[#2C2523] dark:text-[#EFE9E4] font-sans flex flex-col selection:bg-orange-200">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

      {/* Overdue Alert Banner if turns are delayed */}
      {overdueBatches.length > 0 && activeTab === 'lotes' && (
        <div className="max-w-md mx-auto px-4 pt-3 w-full">
          {overdueBatches.map((b) => {
            const s = calculateIncubationStatus(b);
            return (
              <div
                key={b.id}
                className="mb-2 p-3.5 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-between gap-3 text-xs font-semibold animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-black text-sm">Atenção na Virada!</span>
                    <span>
                      Você está <strong>{s.horasAtrasadas} hora{s.horasAtrasadas > 1 ? 's' : ''} atrasado</strong> na virada de {b.nome}.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRecordTurn(b.id)}
                  className="px-3 py-1.5 rounded-xl bg-white text-amber-800 font-bold text-xs hover:bg-neutral-100 shrink-0 shadow-xs"
                >
                  Virar Agora
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-md mx-auto w-full">
        {/* ABA 1: LOTES */}
        {activeTab === 'lotes' && (
          <div className="p-4 space-y-6 pb-28">
            {/* Botão Novo Lote */}
            <button
              onClick={() => {
                setEditingBatch(null);
                setIsModalOpen(true);
              }}
              className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 min-h-[52px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Agendar Nova Incubação</span>
            </button>

            {/* SE NÃO HOUVER LOTES */}
            {batches.length === 0 ? (
              <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-6 border-2 border-dashed border-orange-200 dark:border-neutral-800 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-3xl">
                  🐣
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
                    Nenhuma ninhada agendada
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed max-w-xs mx-auto">
                    Nenhuma ninhada agendada. Cadastre sua chocadeira! Escolha a espécie (Galinha 21 dias, Codorna 17 dias, Pato, etc.) e a data em que colocou os ovos. O app calcula o nascimento e avisa as viradas automaticamente.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingBatch(null);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-[#D35400] text-white font-semibold text-xs shadow hover:bg-[#B84500] transition"
                  >
                    Cadastrar Minha Chocadeira Agora
                  </button>
                  <button
                    onClick={() => {
                      const sample = createSampleBatch();
                      updateBatchesState([sample]);
                      showToast('Lote de exemplo adicionado!');
                    }}
                    className="w-full py-2.5 rounded-2xl border border-orange-300 dark:border-neutral-700 text-[#D35400] dark:text-[#FFB07F] font-semibold text-xs hover:bg-orange-50 dark:hover:bg-neutral-800 transition"
                  >
                    Carregar Lote de Exemplo (Galinha 21d)
                  </button>
                </div>
              </div>
            ) : (
              /* LISTA DE LOTES EM ANDAMENTO */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-black text-sm text-[#D35400] dark:text-[#FFB07F] tracking-wide uppercase flex items-center gap-2">
                    <span>Lotes em Andamento ({ongoingBatches.length})</span>
                  </h2>
                </div>

                {ongoingBatches.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-500 text-center">
                    Nenhum lote em andamento no momento.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {ongoingBatches.map((batch) => (
                      <BatchCard
                        key={batch.id}
                        batch={batch}
                        onSelect={(b) => setDetailBatch(b)}
                        onQuickTurn={handleRecordTurn}
                      />
                    ))}
                  </div>
                )}

                {/* LOTES CONCLUÍDOS */}
                {completedBatches.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-bold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                        Lotes Concluídos ({completedBatches.length})
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {completedBatches.map((batch) => (
                        <BatchCard
                          key={batch.id}
                          batch={batch}
                          onSelect={(b) => setDetailBatch(b)}
                          onQuickTurn={handleRecordTurn}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* LOTES ARQUIVADOS ACCORDION */}
                {archivedBatches.length > 0 && (
                  <div className="pt-3">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-semibold text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        <span>Lotes Arquivados ({archivedBatches.length})</span>
                      </div>
                      <span>{showArchived ? 'Ocultar ▲' : 'Ver ▼'}</span>
                    </button>

                    {showArchived && (
                      <div className="space-y-3 mt-3">
                        {archivedBatches.map((batch) => (
                          <BatchCard
                            key={batch.id}
                            batch={batch}
                            onSelect={(b) => setDetailBatch(b)}
                            onQuickTurn={handleRecordTurn}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ABA: CONCLUÍDOS */}
        {activeTab === 'concluidos' && (
          <ConcludedTab
            batches={batches}
            onSelectBatch={(b) => setDetailBatch(b)}
            onGoToFinance={(batchId) => {
              setSelectedBatchId(batchId);
              setActiveTab('financeiro');
              setDetailBatch(null);
            }}
            onReopenBatch={handleToggleComplete}
            onDeleteBatch={handleDeleteBatch}
            onToast={showToast}
          />
        )}

        {/* ABA: FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <FinanceTab
            batches={batches}
            selectedBatchId={selectedBatchId}
            onSelectBatchId={(id) => setSelectedBatchId(id)}
            onUpdateBatch={handleUpdateBatchSingle}
            onToast={showToast}
          />
        )}

        {/* ABA: GUIA */}
        {activeTab === 'guia' && <GuideTab />}
      </main>

      {/* Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={(t) => {
          setActiveTab(t);
          setDetailBatch(null);
        }}
        activeBatchesCount={ongoingBatches.length}
        concludedBatchesCount={concludedBatches.length}
      />

      {/* Modal: Agendar / Editar Lote */}
      <BatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBatch(null);
        }}
        onSave={handleSaveBatch}
        initialBatch={editingBatch}
      />

      {/* Tela de Detalhes do Lote (Full Overlay) */}
      {detailBatch && (
        <BatchDetail
          batch={detailBatch}
          onClose={() => setDetailBatch(null)}
          onEdit={(b) => {
            setEditingBatch(b);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteBatch}
          onArchiveToggle={handleArchiveToggle}
          onRecordTurn={(id) => handleRecordTurn(id)}
          onUpdateBatch={handleUpdateBatchSingle}
          onGoToFinance={(batchId) => {
            setSelectedBatchId(batchId);
            setActiveTab('financeiro');
            setDetailBatch(null);
          }}
          onToggleComplete={handleToggleComplete}
          onToast={showToast}
        />
      )}

      {/* Modal: Backup JSON */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        batches={batches}
        onImportBatches={(imported) => {
          updateBatchesState(imported);
        }}
        onToast={showToast}
      />

      {/* Modal: Instalar PWA */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        isIOS={isIOS}
        onInstallPrompt={install}
      />
    </div>
  );
}
