import type { GNGroupTheme } from '@/data/groups';

/** Luminância relativa aproximada, 0 (preto) a 1 (branco). */
function luminance(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * A tinta da nação: a primeira cor da bandeira que aguenta ser usada como
 * traço. Bandeiras com branco e amarelo claro somem no papel — descartadas.
 */
export function nationInk(theme: GNGroupTheme): string {
  const usable = theme.colors.filter((c) => {
    const l = luminance(c);
    return l > 0.06 && l < 0.78;
  });
  return usable[0] ?? theme.primary;
}

/** Segunda tinta, para o halo e os detalhes. */
export function nationInk2(theme: GNGroupTheme): string {
  const ink = nationInk(theme);
  const usable = theme.colors.filter((c) => {
    const l = luminance(c);
    return l > 0.06 && l < 0.78 && c.toLowerCase() !== ink.toLowerCase();
  });
  return usable[0] ?? ink;
}
