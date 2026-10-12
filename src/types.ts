export interface TurnRecord {
  id: string;
  timestamp: number; // Unix time in ms
}

export interface IncubationBatch {
  id: string;
  nome: string;
  especie: string;
  emoji: string;
  diasTotais: number;
  diaOvoscopia1: number;
  diaOvoscopia2: number;
  diaPararVirada: number;
  dataInicio: string; // ISO string YYYY-MM-DDTHH:mm
  temperaturaIdeal: number; // e.g. 37.7
  umidadeInicial: number; // e.g. 55%
  umidadeEclosao: number; // e.g. 75%
  intervaloViradaHoras: number; // 0 = desligado, 2, 3, 4, 6, 8, 12
  metaViradasDia: number; // 2 to 6
  notificacoesLigadas: boolean;
  totalOvos: number;
  ovosFerteis?: number;
  ovosNascidos?: number;
  anotacoes?: string;
  arquivado: boolean;
  concluido?: boolean;
  dataSaida?: string; // Data e hora que saiu/concluiu a incubação
  
  // Histórico de viradas
  viradas: TurnRecord[];

  // Campos Financeiros
  investimento: number; // R$
  ovosPerdidos: number;
  valorCadaPinto: number; // R$
  valorRecebido?: number; // R$
}

export interface SpeciesPreset {
  id: string;
  nome: string;
  emoji: string;
  diasTotais: number;
  diaOvoscopia1: number;
  diaOvoscopia2: number;
  diaPararVirada: number;
  temperatura: number;
  umidadeInicial: number;
  umidadeEclosao: number;
  intervaloViradaPadrao: number;
  metaViradasPadrao: number;
  descricao: string;
}

export type TabType = 'lotes' | 'concluidos' | 'financeiro' | 'guia';
