export type Category = 'MENINAS' | 'MENINOS' | 'MISTO' | 'KIDS';

export type CategorySpec = {
  key: Category;
  note: string;
  /** Rótulo curto de quem se reúne ali. */
  who: string;
  /** Tinta própria da categoria — cada uma tem a sua, para se distinguirem. */
  ink: string;
};

/**
 * Cada categoria tem uma tinta. As variáveis vêm do `index.css` para que a
 * folha clara e a folha escura tenham versões legíveis da mesma cor.
 */
export const CATEGORIES: CategorySpec[] = [
  { key: 'MENINAS', note: 'Adolescentes', who: 'Só meninas', ink: 'var(--cat-meninas)' },
  { key: 'MENINOS', note: 'Adolescentes', who: 'Só meninos', ink: 'var(--cat-meninos)' },
  { key: 'MISTO', note: 'Meninas e meninos', who: 'Os dois juntos', ink: 'var(--cat-misto)' },
  { key: 'KIDS', note: 'Crianças', who: 'Criançada', ink: 'var(--cat-kids)' },
];

export function categoryInk(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.ink ?? 'var(--ink-3)';
}
