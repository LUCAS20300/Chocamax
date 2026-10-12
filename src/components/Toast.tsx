import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#2C2523] dark:bg-[#FAF7F2] text-white dark:text-[#2C2523] shadow-2xl animate-bounce text-sm font-medium border border-orange-500/30">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-xs px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/10 hover:opacity-80"
      >
        ✕
      </button>
    </div>
  );
};
