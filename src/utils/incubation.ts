import { IncubationBatch } from '../types';

export interface IncubationStatus {
  dataInicioDate: Date;
  dataEclosaoDate: Date;
  dataSaidaDate: Date;
  diaAtual: number;
  diasRestantes: number;
  progressoPercent: number;
  isFuturo: boolean;
  isLockdown: boolean;
  isConcluido: boolean;
  viradasHoje: number;
  proximaViradaDate: Date | null;
  horasAtrasadas: number; // 0 if not overdue
  dataOvoscopia1Date: Date;
  dataOvoscopia2Date: Date;
  dataLockdownDate: Date;
}

export function calculateIncubationStatus(batch: IncubationBatch, now = new Date()): IncubationStatus {
  const startDate = new Date(batch.dataInicio);
  // Total incubation milliseconds
  const totalMs = batch.diasTotais * 24 * 60 * 60 * 1000;
  const dataEclosaoDate = new Date(startDate.getTime() + totalMs);

  const diffMs = now.getTime() - startDate.getTime();

  let diaAtual = 0;
  let isFuturo = false;

  if (diffMs < 0) {
    diaAtual = 0;
    isFuturo = true;
  } else {
    // Dia 1 begins immediately when eggs are placed
    const daysPassed = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    diaAtual = daysPassed + 1;
  }

  const isConcluido = Boolean(batch.concluido) || (diaAtual > batch.diasTotais);
  const isLockdown = !isFuturo && diaAtual >= batch.diaPararVirada && !isConcluido;

  const dataSaidaDate = batch.dataSaida
    ? new Date(batch.dataSaida)
    : dataEclosaoDate;

  let diasRestantes = 0;
  if (isFuturo) {
    diasRestantes = batch.diasTotais;
  } else if (diaAtual <= batch.diasTotais) {
    diasRestantes = batch.diasTotais - diaAtual + 1;
  } else {
    diasRestantes = 0;
  }

  let progressoPercent = 0;
  if (isFuturo) {
    progressoPercent = 0;
  } else if (batch.diasTotais > 0) {
    progressoPercent = Math.min(100, Math.max(0, Math.round((diaAtual / batch.diasTotais) * 100)));
  }

  // Count viradas today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  const viradasHoje = (batch.viradas || []).filter(
    (v) => v.timestamp >= startOfToday && v.timestamp < endOfToday
  ).length;

  // Milestone dates
  const dataOvoscopia1Date = new Date(startDate.getTime() + (batch.diaOvoscopia1 - 1) * 24 * 60 * 60 * 1000);
  const dataOvoscopia2Date = new Date(startDate.getTime() + (batch.diaOvoscopia2 - 1) * 24 * 60 * 60 * 1000);
  const dataLockdownDate = new Date(startDate.getTime() + (batch.diaPararVirada - 1) * 24 * 60 * 60 * 1000);

  // Next turn calculation
  let proximaViradaDate: Date | null = null;
  let horasAtrasadas = 0;

  if (batch.intervaloViradaHoras > 0 && !isLockdown && !isConcluido && !isFuturo) {
    const sortedTurns = [...(batch.viradas || [])].sort((a, b) => b.timestamp - a.timestamp);
    const lastTurnTime = sortedTurns.length > 0 ? sortedTurns[0].timestamp : startDate.getTime();

    const intervalMs = batch.intervaloViradaHoras * 60 * 60 * 1000;
    const nextTurnTime = lastTurnTime + intervalMs;
    proximaViradaDate = new Date(nextTurnTime);

    if (now.getTime() > nextTurnTime) {
      const overdueMs = now.getTime() - nextTurnTime;
      horasAtrasadas = Math.floor(overdueMs / (60 * 60 * 1000));
    }
  }

  return {
    dataInicioDate: startDate,
    dataEclosaoDate,
    dataSaidaDate,
    diaAtual,
    diasRestantes,
    progressoPercent,
    isFuturo,
    isLockdown,
    isConcluido,
    viradasHoje,
    proximaViradaDate,
    horasAtrasadas,
    dataOvoscopia1Date,
    dataOvoscopia2Date,
    dataLockdownDate
  };
}

// Brazilian Date formatting
export function formatBRDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatBRDateTime(date: Date | string | number): string {
  const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${mins}`;
}

export function formatBRL(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
