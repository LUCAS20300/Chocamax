import React from 'react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onInstallPrompt?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, isIOS, onInstallPrompt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#221C1A] p-6 shadow-2xl border border-orange-500/20 text-[#2C2523] dark:text-[#EFE9E4]">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📲</span>
            <h3 className="text-lg font-bold">Instalar Chocadeira Fácil</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            Instale o aplicativo na tela inicial do seu celular para acesso rápido em 1 toque, funcionamento offline na chocadeira e notificações!
          </p>

          {isIOS ? (
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 space-y-2">
              <p className="font-semibold text-[#D35400] dark:text-[#FFB07F]">No iPhone / iPad (Safari):</p>
              <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                <li>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com seta para cima no Safari).</li>
                <li>Role as opções e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</li>
                <li>Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito.</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs">
                No Android e Chrome, clique no botão abaixo para adicionar diretamente à tela inicial do seu celular:
              </p>
              {onInstallPrompt && (
                <button
                  onClick={() => {
                    onInstallPrompt();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-[#D35400] text-white font-semibold shadow hover:bg-[#B84500] transition active:scale-95"
                >
                  Adicionar à Tela Inicial
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          Entendido, fechar
        </button>
      </div>
    </div>
  );
};
