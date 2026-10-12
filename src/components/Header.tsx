import React from 'react';
import { Download, HardDriveDownload, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBackup: () => void;
  onOpenInstall: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenBackup,
  onOpenInstall,
  isInstallable,
  isIOS,
  isInstalled
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#221C1A]/95 backdrop-blur-md border-b border-orange-500/15 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E67E22] to-[#D35400] flex items-center justify-center text-xl shadow-md text-white">
            🐣
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#D35400] dark:text-[#FFB07F] leading-tight">
              Chocadeira Fácil
            </h1>
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Controle de Incubação & Virada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(!isInstalled && (isInstallable || isIOS)) && (
            <button
              onClick={onOpenInstall}
              title="Instalar App"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#D35400] dark:text-[#FFB07F] text-xs font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/80 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          <button
            onClick={onOpenBackup}
            title="Backup & Restauração"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-neutral-800 transition"
          >
            <HardDriveDownload className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-neutral-800 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
