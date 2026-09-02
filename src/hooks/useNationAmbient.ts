import { useEffect } from 'react';

/**
 * A cor de fundo da carta segue a nação que está no centro da tela.
 *
 * Um único listener para a página inteira. Cada registro se declara com
 * `data-nation` (tinta principal) e `data-nation-2`; o que estiver mais perto
 * do meio da janela ganha e escreve as variáveis na raiz. A transição de cor
 * fica por conta do CSS.
 */
export function useNationAmbient(deps: unknown[] = []) {
  useEffect(() => {
    const root = document.documentElement;
    const base = { one: '', two: '' };
    let frame = 0;
    let last = '';

    const pick = () => {
      frame = 0;
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nation]')
      );

      if (nodes.length === 0) {
        if (last !== '') {
          root.style.removeProperty('--nation');
          root.style.removeProperty('--nation-2');
          last = '';
        }
        return;
      }

      const center = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let bestGap = Infinity;

      for (const node of nodes) {
        const box = node.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) continue;
        const gap = Math.abs(box.top + box.height / 2 - center);
        if (gap < bestGap) {
          bestGap = gap;
          best = node;
        }
      }

      if (!best) {
        if (last !== '') {
          root.style.removeProperty('--nation');
          root.style.removeProperty('--nation-2');
          last = '';
        }
        return;
      }

      const one = best.dataset.nation ?? base.one;
      const two = best.dataset.nation2 ?? one;
      if (one === last) return;

      last = one;
      root.style.setProperty('--nation', one);
      root.style.setProperty('--nation-2', two);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.documentElement.style.removeProperty('--nation');
      document.documentElement.style.removeProperty('--nation-2');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
