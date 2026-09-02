import { useEffect } from 'react';
import { registerEngine } from '@/lib/scroll';

const LERP = 0.115;          // quanto do caminho restante é vencido por quadro
const SNAP = 0.5;            // abaixo disso já chegou
const KEY_STEP = 96;
const RESYNC_TOLERANCE = 3;  // px de divergência que ainda contam como "somos nós"

/**
 * Scroll interpolado no ponteiro fino (mouse / trackpad de desktop).
 *
 * Fica desligado no toque — iOS e Android já entregam momentum melhor — e em
 * `prefers-reduced-motion`, onde o movimento extra é justamente o problema.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!fine || calm) {
      registerEngine({ enabled: false });
      return;
    }

    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let running = false;
    let selfScroll = false;

    const limit = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const jump = (y: number) => {
      selfScroll = true;
      window.scrollTo(0, y);
    };

    const step = () => {
      const delta = target - current;

      if (Math.abs(delta) < SNAP) {
        current = target;
        jump(Math.round(current));
        running = false;
        return;
      }

      current += delta * LERP;
      jump(Math.round(current));
      frame = requestAnimationFrame(step);
    };

    const wake = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    /** Único caminho de escrita do alvo — usado pela roda, teclado e trilho. */
    const seek = (y: number, immediate = false) => {
      target = Math.max(0, Math.min(y, limit()));
      if (immediate) {
        current = target;
        jump(Math.round(current));
        return;
      }
      wake();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // zoom do navegador
      // Deixa passar o scroll de qualquer coisa que role por conta própria
      // (a galeria lateral, um select nativo, um overflow interno).
      let node = e.target as HTMLElement | null;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        const scrollsY =
          /auto|scroll/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
        const scrollsX =
          /auto|scroll/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
        if (scrollsY || scrollsX) return;
        node = node.parentElement;
      }

      e.preventDefault();

      // deltaMode 1 = linhas, 2 = páginas
      const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? window.innerHeight : 1;
      seek(target + e.deltaY * unit);
    };

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;

      const page = window.innerHeight * 0.85;
      let next: number | null = null;

      switch (e.key) {
        case 'ArrowDown': next = target + KEY_STEP; break;
        case 'ArrowUp':   next = target - KEY_STEP; break;
        case 'PageDown':  next = target + page; break;
        case 'PageUp':    next = target - page; break;
        case 'Home':      next = 0; break;
        case 'End':       next = limit(); break;
        case ' ':
          if (el && el.tagName === 'BUTTON') return;
          next = e.shiftKey ? target - page : target + page;
          break;
      }

      if (next === null) return;
      e.preventDefault();
      seek(next);
    };

    // Alguém que não é a engine mexeu no scroll: focus(), hash de URL, extensão.
    const onScroll = () => {
      if (selfScroll) {
        selfScroll = false;
        return;
      }
      if (Math.abs(window.scrollY - current) > RESYNC_TOLERANCE) {
        current = window.scrollY;
        target = window.scrollY;
      }
    };

    const onResize = () => {
      target = Math.min(target, limit());
      current = Math.min(current, limit());
    };

    registerEngine({ enabled: true, seek, getTarget: () => target });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      registerEngine({
        enabled: false,
        seek: () => {},
        getTarget: () => window.scrollY,
      });
    };
  }, []);
}
