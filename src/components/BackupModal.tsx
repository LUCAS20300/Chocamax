import React, { useRef, useState } from 'react';
import { IncubationBatch } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: IncubationBatch[];
  onImportBatches: (imported: IncubationBatch[]) => void;
  onToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  batches,
  onImportBatches,
  onToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJSON(batches);
    onToast('Backup exportado com sucesso! Arquivo JSON salvo.');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Deseja restaurar os dados deste arquivo? Os lotes serão importados com segurança.')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setImporting(true);
      const imported = await importBackupJSON(file);
      onImportBatches(imported);
      onToast(`Backup restaurado! ${imported.length} lote(s) carregados.`);
      onClose();
    } catch (err: unknown) {
      alert('Falha ao restaurar backup: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#221C1A] p-6 shadow-2xl border border-orange-500/20 text-[#2C2523] dark:text-[#EFE9E4]">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💾</span>
            <h3 className="text-lg font-bold">Backup & Segurança</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Os dados ficam salvos na memória do seu navegador (localStorage). Para nunca perder suas ninhadas e histórico financeiro caso troque de celular ou limpe o histórico, exporte um arquivo de backup em JSON.
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#D35400] text-white font-semibold text-sm shadow hover:bg-[#B84500] active:scale-98 transition"
          >
            <span>📥</span>
            <span>Exportar Backup (Baixar JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-orange-400/60 dark:border-orange-500/40 text-[#D35400] dark:text-[#FFB07F] font-semibold text-sm hover:bg-orange-50 dark:hover:bg-orange-950/30 active:scale-98 transition"
          >
            <span>📤</span>
            <span>{importing ? 'Importando...' : 'Restaurar Backup (Arquivo JSON)'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <span>Lotes atuais: {batches.length}</span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
