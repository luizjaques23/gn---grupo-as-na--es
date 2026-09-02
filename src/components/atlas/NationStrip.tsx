import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { GN_GROUPS } from '@/data/groups';
import { nationInk, nationInk2 } from '@/lib/nation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Flag from './Flag';

type Nation = { name: string; code: string; flag: string };

type Props = {
  nations: Nation[];
  onPick: (name: string) => void;
};

/**
 * A faixa das nações não anda sozinha: ela anda porque você está descendo.
 * O progresso vertical da seção vira deslocamento horizontal do trilho, então
 * a rolagem da página é literalmente uma travessia lateral pelo índice.
 */
export default function NationStrip({ nations, onPick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['4%', '-46%']);

  // Sem a deriva, metade das nações ficaria fora de alcance: quem pediu menos
  // movimento ganha um trilho que se arrasta com o dedo, sem duplicatas.
  const doubled = calm ? nations : [...nations, ...nations];

  return (
    <div
      ref={ref}
      className={`relative -mx-6 md:-mx-10 lg:-mx-14 py-2 ${
        calm ? 'overflow-x-auto no-bar snap-x' : 'overflow-hidden'
      }`}
    >
      {/* Régua de escala acima do trilho */}
      <div className="tick-rule mb-6 mx-6 md:mx-10 lg:mx-14" aria-hidden />

      <motion.div
        style={calm ? undefined : { x }}
        className={`drift-track bg-paper-raised border-l border-rule-soft ${calm ? 'px-6 md:px-10 lg:px-14' : ''}`}
      >
        {doubled.map((nation, i) => {
          const groups = GN_GROUPS.filter((g) => g.country === nation.name);
          const theme = groups[0]?.theme;
          const ink = theme ? nationInk(theme) : 'var(--ink)';
          const ink2 = theme ? nationInk2(theme) : ink;
          const original = i < nations.length;

          return (
            <button
              key={`${nation.name}-${i}`}
              type="button"
              tabIndex={original ? 0 : -1}
              aria-hidden={!original}
              data-nation={ink}
              data-nation-2={ink2}
              onClick={() => onPick(nation.name)}
              className="press relative w-[224px] sm:w-[252px] shrink-0 snap-start bg-paper-raised hover:bg-paper-sunk text-left px-5 py-6 cursor-pointer group border-r border-rule-soft"
            >
              {/* A bandeira de verdade, no desenho e na proporção oficiais */}
              <Flag
                code={nation.code}
                name={nation.name}
                colors={theme?.colors}
                className="h-11 mb-6"
              />

              {/* O código ISO continua sendo o rótulo de campo da prancha */}
              <span className="figure text-[9px] text-ink-4">{nation.code}</span>

              <h3 className="mt-3 font-plate-tight text-[1.25rem] leading-tight text-ink">
                {nation.name}
              </h3>

              <div className="mt-5 flex items-center justify-between">
                <span className="figure text-[0.7rem] text-ink-3">
                  {String(groups.length).padStart(2, '0')}{' '}
                  {groups.length === 1 ? 'grupo' : 'grupos'}
                </span>
                <span
                  className="legend text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: ink }}
                >
                  Abrir
                </span>
              </div>

              {/* Sublinhado que acende na cor da bandeira */}
              <span
                className="absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                style={{ background: ink }}
              />
            </button>
          );
        })}
      </motion.div>

      {/* Bordas esfumadas para o trilho não cortar seco */}
      {!calm && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[color:var(--paper)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[color:var(--paper)] to-transparent" />
        </>
      )}
    </div>
  );
}
