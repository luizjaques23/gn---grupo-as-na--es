import { GNGroup } from '../data/groups';

/**
 * O dia do encontro vive dentro de `time` ("Sábado — 19h30"). Aqui ele é
 * extraído e normalizado para virar filtro, sem mexer na base.
 */
export const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** Rótulo curto, para caber na linha de identificação do card. */
export function shortWeekday(day: Weekday) {
  return day.replace('-feira', '');
}

/** Dia do encontro, ou null quando o texto não começa por um dia conhecido. */
export function groupWeekday(group: GNGroup): Weekday | null {
  const head = group.time.split('—')[0].trim().toLowerCase();
  return WEEKDAYS.find((d) => d.toLowerCase() === head) ?? null;
}

/** Dias presentes na base, na ordem da semana. */
export function weekdaysInUse(groups: GNGroup[]): Weekday[] {
  const present = new Set(groups.map(groupWeekday).filter(Boolean) as Weekday[]);
  return WEEKDAYS.filter((d) => present.has(d));
}
