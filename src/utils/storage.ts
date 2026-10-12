import { IncubationBatch } from '../types';

const STORAGE_KEY = 'chocadeira_facil_batches_v2';

export function loadBatches(): IncubationBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Erro ao carregar lotes do localStorage:', err);
    return [];
  }
}

export function saveBatches(batches: IncubationBatch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch (err) {
    console.error('Erro ao salvar lotes no localStorage:', err);
  }
}

export function exportBackupJSON(batches: IncubationBatch[]) {
  const data = {
    app: 'Chocadeira Fácil',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    batches
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `chocadeira_facil_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file: File): Promise<IncubationBatch[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.batches)) {
          resolve(parsed.batches);
        } else if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Formato de arquivo inválido.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file);
  });
}

export function createSampleBatch(): IncubationBatch {
  // Started 8 days ago
  const now = new Date();
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${eightDaysAgo.getFullYear()}-${pad(eightDaysAgo.getMonth() + 1)}-${pad(eightDaysAgo.getDate())}T08:00`;

  // Generate turns for today
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).getTime();
  const turns = [
    { id: 'turn-1', timestamp: startToday },
    { id: 'turn-2', timestamp: startToday + 4 * 3600 * 1000 }
  ];

  return {
    id: 'lote-exemplo-galinha',
    nome: 'Lote Caipira & Índio Gigante',
    especie: 'Galinha / Galináceos',
    emoji: '🐔',
    diasTotais: 21,
    diaOvoscopia1: 7,
    diaOvoscopia2: 14,
    diaPararVirada: 18,
    dataInicio: dateStr,
    temperaturaIdeal: 37.7,
    umidadeInicial: 55,
    umidadeEclosao: 75,
    intervaloViradaHoras: 4,
    metaViradasDia: 4,
    notificacoesLigadas: true,
    totalOvos: 40,
    ovosFerteis: 34,
    ovosNascidos: 0,
    anotacoes: 'Ovos férteis selecionados do criador Sítio Primavera. Ovoscopia do D7 descartou 6 ovos claros.',
    arquivado: false,
    viradas: turns,
    investimento: 180,
    ovosPerdidos: 6,
    valorCadaPinto: 8,
    valorRecebido: 0
  };
}
