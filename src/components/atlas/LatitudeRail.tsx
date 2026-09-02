import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { scrollToY, maxScroll } from '@/lib/scroll';

export type RailStop = { id: string; label: string };

const TICKS = 61;          // ímpar: sobra uma marca exatamente no meio
const MAJOR_EVERY = 10;

type Props = {
  stops: RailStop[];
  /* Sobre a folha 01 o fundo é o vídeo: o trilho troca de tinta. */
  onDark?: boolean;
};

/**
 * Trilho de latitude — a barra de rolagem da carta.
 *
 * Serve como escala (onde estou), índice (o que vem antes e depois) e
 * controle (arrasta ou clica para ir). A barra do sistema fica escondida:
 * esta faz o trabalho dela e mais dois.
 */
export default function LatitudeRail({ stops, onDark = false }: Props) {
  const { scrollYProgress } = useScroll();
  const railRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);

  const top = useTransform(scrollYProgress, (p) => `${Math.min(Math.max(p, 0), 1) * 100}%`);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setProgress(Math.min(Math.max(p, 0), 1));
  });

  /* Onde cada seção cai na régua, em fração de 0 a 1 */
  const measure = useCallback(() => {
    const max = maxScroll();
    if (max <= 0) {
      setMarks(stops.map(() => 0));
      return;
    }
    setMarks(
      stops.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return 0;
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        return Math.min(Math.max(y / max, 0), 1);
      })
    );
  }, [stops]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /* Última seção já ultrapassada */
  let activeIndex = 0;
  marks.forEach((m, i) => {
    if (progress >= m - 0.008) activeIndex = i;
  });

  const scrubTo = useCallback((clientY: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const box = rail.getBoundingClientRect();
    const fraction = Math.min(Math.max((clientY - box.top) / box.height, 0), 1);
    scrollToY(fraction * maxScroll(), true);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    scrubTo(e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    scrubTo(e.clientY);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const pct = String(Math.round(progress * 100)).padStart(3, '0');

  return (
    <>
      {/* ---------- Telas largas: régua completa ---------- */}
      <div className={`hidden lg:block fixed right-0 top-0 h-screen w-32 z-40 pointer-events-none select-none ${
          onDark ? 'hero-dark' : ''
        }`}>
        <div className="relative h-full flex flex-col justify-center pr-5">
          <span className="absolute right-5 top-7 legend text-[8px] leading-none">N</span>
          <span className="absolute right-5 bottom-7 legend text-[8px] leading-none">S</span>

          <div
            ref={railRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative h-[70vh] pointer-events-auto cursor-ns-resize"
            role="scrollbar"
            aria-label="Percorrer a carta"
            aria-orientation="vertical"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Marcações da escala */}
            <div className="absolute right-0 inset-y-0 w-9 flex flex-col justify-between items-end">
              {Array.from({ length: TICKS }).map((_, i) => {
                const f = i / (TICKS - 1);
                const major = i % MAJOR_EVERY === 0;
                const passed = f <= progress;
                const near = Math.abs(f - progress) < 0.02;
                return (
                  <span
                    key={i}
                    data-passed={passed}
                    data-active={near}
                    className="rail-tick"
                    style={{ width: near ? 30 : major ? 18 : 8 }}
                  />
                );
              })}
            </div>

            {/* Cursor: leitura da posição + nome da seção */}
            <motion.div
              style={{ top }}
              className="absolute right-0 -translate-y-1/2 flex items-center gap-2 pr-0"
            >
              <span className="figure text-[9px] font-semibold text-ink tabular-nums whitespace-nowrap">
                {pct}
              </span>
              <span
                className="block h-px transition-all duration-200"
                style={{
                  width: dragging ? 38 : 30,
                  background: 'var(--nation)',
                }}
              />
            </motion.div>

            {/* Etiquetas das seções, ancoradas na fração real de cada uma */}
            <div className="absolute right-[74px] inset-y-0 w-px">
              {stops.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = document.getElementById(s.id);
                    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 80);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ top: `${(marks[i] ?? 0) * 100}%` }}
                  className="pointer-events-auto absolute right-0 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap group cursor-pointer"
                >
                  <span
                    className={`legend text-[8px] transition-all duration-300 ${
                      i === activeIndex
                        ? 'opacity-100 text-ink'
                        : 'opacity-0 group-hover:opacity-70'
                    }`}
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      background: i === activeIndex ? 'var(--nation)' : 'var(--ink-4)',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Telas estreitas: fio de progresso ---------- */}
      <div className={`lg:hidden fixed left-0 top-0 h-screen w-[2px] z-40 pointer-events-none ${
          onDark ? 'hero-dark' : ''
        }`}>
        <div className="h-full w-full bg-rule-soft" />
        <motion.div
          className="absolute top-0 left-0 w-full origin-top"
          style={{ height: top, background: 'var(--nation)' }}
        />
      </div>
    </>
  );
}
