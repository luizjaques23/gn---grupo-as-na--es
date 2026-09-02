import React from 'react';
import { motion } from 'motion/react';

/* ------------------------------------------------------------------
   Primitivas da prancha — a mesma gramática em todas as seções:
   um número de folha, uma linha de corte, uma legenda, o conteúdo.
   ------------------------------------------------------------------ */

export const chartEase = [0.19, 1, 0.22, 1] as const;

/** Entrada padrão: sobe pouco, demora o suficiente para ser notada. */
export const enter = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.8, ease: chartEase },
};

/** Título revelado por máscara — o texto sobe de trás da linha de corte. */
export function MaskedTitle({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  // Quem observa a viewport é o invólucro, não o texto: o IntersectionObserver
  // recorta contra o `overflow: hidden` do pai, e o texto deslocado 108% para
  // baixo está fora desse recorte — ou seja, nunca "entraria em vista".
  return (
    <motion.span
      className="block overflow-hidden"
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: '-60px' }}
    >
      <motion.span
        className={`block ${className}`}
        variants={{ oculto: { y: '108%' }, visivel: { y: '0%' } }}
        transition={{ duration: 1.05, ease: chartEase, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Linha de nanquim puxada da esquerda para a direita. */
export function DrawnRule({
  className = '',
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`hairline origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: chartEase, delay }}
    />
  );
}

/* ------------------------------------------------------------------
   Cabeçalho de seção
   ------------------------------------------------------------------ */

type PlateProps = {
  id: string;
  sheet: string;          // número da folha: "02"
  eyebrow: string;        // rótulo pequeno em mono
  title: React.ReactNode;
  note?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Plate({
  id,
  sheet,
  eyebrow,
  title,
  note,
  right,
  children,
  className = '',
}: PlateProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {/* Faixa de identificação da folha */}
      <div className="flex items-end gap-4">
        <span className="figure text-[10px] font-semibold text-ink-4 leading-none pb-[3px]">
          {sheet}
        </span>
        <DrawnRule className="flex-1 mb-1" />
        <span className="legend text-[8px] leading-none pb-[3px]">{eyebrow}</span>
      </div>

      {/* Título + nota */}
      <div className="mt-7 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div className="max-w-2xl">
          <h2 className="font-plate text-[clamp(1.9rem,5vw,3.1rem)] leading-[0.98] text-ink">
            <MaskedTitle>{title}</MaskedTitle>
          </h2>
          {note && (
            <motion.p
              {...enter}
              transition={{ duration: 0.8, ease: chartEase, delay: 0.12 }}
              className="mt-4 text-[0.875rem] leading-relaxed text-ink-2 max-w-lg"
            >
              {note}
            </motion.p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className="mt-10">{children}</div>
    </section>
  );
}
