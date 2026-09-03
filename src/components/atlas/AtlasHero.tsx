import { motion, useScroll, useTransform } from 'motion/react';
import { chartEase } from './Plate';
import { scrollToId } from '@/lib/scroll';
import { numeral } from '@/lib/numeral';

type Props = {
  nations: number;
  groups: number;
  isLocating: boolean;
  onLocate: () => void;
};

export default function AtlasHero({ nations, groups, isLocating, onLocate }: Props) {
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 700], [0, -90]);
  const fade = useTransform(scrollY, [0, 520], [1, 0]);
  /* O globo desce devagar enquanto a folha sobe: dá profundidade sem tirar
     o texto do lugar. */
  const globeDrift = useTransform(scrollY, [0, 900], [0, 120]);

  return (
    <header
      id="folha-01"
      className="hero-dark relative isolate w-full lg:w-[calc(100%+5rem)] lg:-mr-20 min-h-[100svh] overflow-hidden flex flex-col justify-between"
    >
      {/* ---------------------------------------------------- fundo: o globo */}
      <motion.div style={{ y: globeDrift }} className="absolute inset-0 -z-10 bg-[#060B10]">
        <video
          className="hero-globe absolute inset-0 w-full h-full pointer-events-none select-none"
          autoPlay
          loop
          muted
          playsInline
          // @ts-expect-error atributo webkit para iOS Safari
          webkit-playsinline="true"
          disablePictureInPicture
          controls={false}
          preload="auto"
          poster="/hero-globo.gif"
          aria-hidden
        >
          <source src="/hero-globo.webm" type="video/webm" />
          <source src="/hero-globo.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Véus: escurece o suficiente para o texto pesar mais que o globo,
          e devolve a folha à cor do papel na borda de baixo. */}
      <div className="hero-veil absolute inset-0 -z-10" aria-hidden />
      <div className="hero-hem absolute inset-x-0 bottom-0 h-[34svh] -z-10" aria-hidden />

      {/* ------------------------------------------------------- conteúdo */}
      <motion.div
        style={{ y: lift }}
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 md:px-10 pt-28 pb-10 md:pt-32 md:pb-12 max-w-[1240px] mx-auto w-full"
      >
        {/* Identificação da folha */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: chartEase }}
          className="flex items-center gap-4 w-full max-w-[360px]"
        >
          <span className="legend text-[8px]">Folha 01</span>
          <span className="hairline flex-1" />
          <span className="legend text-[8px]">Índice geral</span>
        </motion.div>

        {/* Título */}
        <h1 className="mt-8 md:mt-10 font-plate text-ink leading-[0.86] text-[clamp(3.25rem,15vw,9rem)] md:text-[clamp(4rem,11vw,9.5rem)]">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.15, ease: chartEase, delay: 0.1 }}
            >
              {nations === 1 ? 'Uma nação' : `${cap(numeral(nations))} nações`}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block italic"
              style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1, "opsz" 144' }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.15, ease: chartEase, delay: 0.22 }}
            >
              uma cidade
            </motion.span>
          </span>
        </h1>

        <motion.div
          className="hairline mt-6 md:mt-8 w-full max-w-[420px]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: chartEase, delay: 0.45 }}
        />

        {/* Legenda da folha */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: chartEase, delay: 0.4 }}
          className="mt-6 md:mt-7 max-w-[46ch] text-[0.9375rem] md:text-base leading-relaxed text-ink-2 text-balance"
        >
          Cada GN carrega o nome de um país e as cores da bandeira dele. Todos se reúnem
          em Porto Velho, num bairro, num dia fixo da semana. São {numeral(groups, 'm')},
          e estão todos aqui.
        </motion.p>

        {/* Ações — centralizadas sob o título */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: chartEase, delay: 0.52 }}
          className="mt-8 md:mt-10 w-full grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:items-center"
        >
          <button
            type="button"
            id="btn-get-location"
            disabled={isLocating}
            onClick={onLocate}
            className="press group relative inline-flex w-full sm:w-auto justify-center items-center gap-3 px-5 sm:pr-6 py-4 bg-seal text-[color:var(--seal-ink)] disabled:opacity-60 cursor-pointer"
          >
            <span className="relative flex items-center justify-center w-2 h-2">
              <span className="w-2 h-2 rounded-full bg-current" />
              {!isLocating && (
                <span className="absolute inset-0 rounded-full ping-ring" />
              )}
            </span>
            <span className="legend-strong text-[10px] text-[color:var(--seal-ink)]">
              {isLocating ? 'Triangulando…' : 'Ordenar pelo mais perto'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToId('folha-03')}
            className="press inline-flex w-full sm:w-auto justify-center items-center gap-2 px-5 py-4 border border-rule hover:border-ink-3 backdrop-blur-[2px] cursor-pointer"
          >
            <span className="legend-strong text-[10px]">Ver os {numeral(groups, 'm')} grupos</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Rodapé da folha: os dados de campo */}
      <motion.div
        style={{ opacity: fade }}
        className="relative px-6 md:px-10 lg:px-14 pb-8 md:pb-10 max-w-[1240px] mx-auto w-full"
      >
        <div className="hairline mb-4" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-10 sm:justify-center">
          <Field label="Nações">{String(nations).padStart(2, '0')}</Field>
          <Field label="Grupos">{String(groups).padStart(2, '0')}</Field>
          <Field label="Cidade">Porto Velho — RO</Field>
          <Field label="Levantamento">Supervisão Resgate</Field>
        </dl>
      </motion.div>
    </header>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="legend text-[8px] mb-1.5">{label}</dt>
      <dd className="figure text-[0.7rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

function cap(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
