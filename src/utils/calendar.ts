import { IncubationBatch } from '../types';
import { calculateIncubationStatus } from './incubation';

function toICSDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function generateBatchCalendarICS(batch: IncubationBatch): string {
  const status = calculateIncubationStatus(batch);
  const now = new Date();
  const nowICS = toICSDate(now);

  const cleanTitle = (str: string) => str.replace(/[,;]/g, ' ');

  let events = '';

  // 1. Recurring turning event if interval > 0
  if (batch.intervaloViradaHoras > 0) {
    const startTurning = status.dataInicioDate;
    const endTurning = status.dataLockdownDate; // Stop turn day
    const turnInterval = batch.intervaloViradaHoras;

    // Turn event duration: 15 minutes
    const turnEventEnd = new Date(startTurning.getTime() + 15 * 60 * 1000);

    events += `BEGIN:VEVENT
UID:turn-${batch.id}-${now.getTime()}@chocadeira-facil
DTSTAMP:${nowICS}
DTSTART:${toICSDate(startTurning)}
DTEND:${toICSDate(turnEventEnd)}
RRULE:FREQ=HOURLY;INTERVAL=${turnInterval};UNTIL=${toICSDate(endTurning)}
SUMMARY:🔄 Virar Ovos - ${cleanTitle(batch.nome)}
DESCRIPTION:Lembrete automático da Chocadeira Fácil: gire os ovos para evitar aderência da gema às membranas da casca. Meta diária: ${batch.metaViradasDia} viradas.
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Hora de virar os ovos da chocadeira! (${cleanTitle(batch.nome)})
TRIGGER:-PT0M
END:VALARM
END:VEVENT
`;
  }

  // 2. 1ª Ovoscopia
  const ovo1Start = status.dataOvoscopia1Date;
  const ovo1End = new Date(ovo1Start.getTime() + 30 * 60 * 1000);
  events += `BEGIN:VEVENT
UID:ovo1-${batch.id}@chocadeira-facil
DTSTAMP:${nowICS}
DTSTART:${toICSDate(ovo1Start)}
DTEND:${toICSDate(ovo1End)}
SUMMARY:🔦 1ª Ovoscopia - ${cleanTitle(batch.nome)} (Dia ${batch.diaOvoscopia1})
DESCRIPTION:Chocadeira Fácil: Realize a primeira checagem com lanterna em local escuro. Descarte ovos claros (inférteis) e ovos com anel de sangue.
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Hora da 1ª Ovoscopia do lote ${cleanTitle(batch.nome)}!
TRIGGER:-PT15M
END:VALARM
END:VEVENT
`;

  // 3. 2ª Ovoscopia
  const ovo2Start = status.dataOvoscopia2Date;
  const ovo2End = new Date(ovo2Start.getTime() + 30 * 60 * 1000);
  events += `BEGIN:VEVENT
UID:ovo2-${batch.id}@chocadeira-facil
DTSTAMP:${nowICS}
DTSTART:${toICSDate(ovo2Start)}
DTEND:${toICSDate(ovo2End)}
SUMMARY:🔦 2ª Ovoscopia - ${cleanTitle(batch.nome)} (Dia ${batch.diaOvoscopia2})
DESCRIPTION:Chocadeira Fácil: Segunda checagem do embrião. Verifique o crescimento e a câmara de ar antes da fase de lockdown.
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Hora da 2ª Ovoscopia do lote ${cleanTitle(batch.nome)}!
TRIGGER:-PT15M
END:VALARM
END:VEVENT
`;

  // 4. Parar Viragem (Lockdown)
  const lockStart = status.dataLockdownDate;
  const lockEnd = new Date(lockStart.getTime() + 60 * 60 * 1000);
  events += `BEGIN:VEVENT
UID:lockdown-${batch.id}@chocadeira-facil
DTSTAMP:${nowICS}
DTSTART:${toICSDate(lockStart)}
DTEND:${toICSDate(lockEnd)}
SUMMARY:🛑 FASE DE LOCKDOWN - ${cleanTitle(batch.nome)} (Dia ${batch.diaPararVirada})
DESCRIPTION:ATENÇÃO CHOCADEIRA FÁCIL: PARAR DE VIRAR OS OVOS! Trave a grade ou roletes, aumente a umidade para ${batch.umidadeEclosao}% e NÃO abra mais a chocadeira.
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:🛑 LOCKDOWN: Pare de virar os ovos e aumente a umidade para ${batch.umidadeEclosao}%!
TRIGGER:-PT0M
END:VALARM
END:VEVENT
`;

  // 5. Data Prevista de Nascimento / Eclosão
  const hatchStart = status.dataEclosaoDate;
  const hatchEnd = new Date(hatchStart.getTime() + 2 * 60 * 60 * 1000);
  events += `BEGIN:VEVENT
UID:hatch-${batch.id}@chocadeira-facil
DTSTAMP:${nowICS}
DTSTART:${toICSDate(hatchStart)}
DTEND:${toICSDate(hatchEnd)}
SUMMARY:🐣 Eclosão & Nascimento - ${cleanTitle(batch.nome)} (Dia ${batch.diasTotais})
DESCRIPTION:Data prevista de nascimento dos pintinhos! Monitore a chocadeira sem abrir bruscamente. Parabéns!
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:🐣 Grande dia! Eclosão prevista para o lote ${cleanTitle(batch.nome)}!
TRIGGER:-PT0M
END:VALARM
END:VEVENT
`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Chocadeira Facil//Incubacao Ovos//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Chocadeira Fácil - ${cleanTitle(batch.nome)}
X-WR-TIMEZONE:America/Sao_Paulo
${events}END:VCALENDAR`;
}

export function downloadICSFile(batch: IncubationBatch) {
  const icsContent = generateBatchCalendarICS(batch);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = batch.nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `lembretes_${safeName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
