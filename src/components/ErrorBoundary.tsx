import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Chocadeira Fácil:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearDataAndReload = () => {
    if (confirm('Deseja limpar os dados temporários e recarregar o aplicativo? Se tiver dados importantes, tente recarregar primeiro.')) {
      try {
        localStorage.clear();
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      } catch (e) {
        console.warn(e);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C2523] flex flex-col items-center justify-center p-6 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-orange-200 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl">
              ⚠️
            </div>

            <h1 className="text-xl font-black text-[#D35400]">
              Ops! Algo deu errado ao carregar
            </h1>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Ocorreu uma falha inesperada na interface. Você pode tentar recarregar ou reiniciar a aplicação no seu navegador.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-neutral-100 text-left overflow-x-auto text-[11px] font-mono text-neutral-700 max-h-32 border border-neutral-200">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#D35400] text-white font-bold text-sm shadow hover:bg-[#B84500] active:scale-98 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicativo</span>
              </button>

              <button
                onClick={this.handleClearDataAndReload}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-600 font-semibold text-xs hover:bg-neutral-50 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Limpar Cache e Reiniciar</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
              Dica: Certifique-se de abrir no Google Chrome no Android para melhor compatibilidade.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
