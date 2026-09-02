import { useScroll, useTransform, motion } from 'motion/react';

/**
 * O fundo da carta: retícula de latitude/longitude, arcos de meridiano e um
 * halo com a cor da nação em foco. Três profundidades de parallax, todas em
 * `transform`, todas atrás de `pointer-events: none`.
 */
export default function Graticule() {
  const { scrollY } = useScroll();

  const gridY = useTransform(scrollY, [0, 4000], [0, -140]);
  const arcY = useTransform(scrollY, [0, 4000], [0, -420]);
  const arcRotate = useTransform(scrollY, [0, 4000], [0, 26]);
  const haloY = useTransform(scrollY, [0, 4000], [0, -700]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Halo da nação em foco — a única fonte de cor no fundo */}
      <motion.div
        style={{ y: haloY }}
        className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[140vw] h-[110vh]"
      >
        <div
          className="w-full h-full opacity-[0.13] dark:opacity-[0.22] transition-[background] duration-[1200ms] ease-out"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 35%, var(--nation) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Retícula: linhas finas a cada 68px, linha forte a cada 5ª */}
      <motion.div
        style={{ y: gridY }}
        className="absolute -inset-y-[20%] inset-x-0"
        aria-hidden
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--graticule) 1px, transparent 1px),
              linear-gradient(to bottom, var(--graticule) 1px, transparent 1px),
              linear-gradient(to right, var(--graticule-major) 1px, transparent 1px),
              linear-gradient(to bottom, var(--graticule-major) 1px, transparent 1px)
            `,
            backgroundSize: '68px 68px, 68px 68px, 340px 340px, 340px 340px',
          }}
        />
      </motion.div>

      {/* Arcos de meridiano — o globo visto de perto, saindo pela borda */}
      <motion.svg
        style={{ y: arcY, rotate: arcRotate }}
        className="absolute -right-[28vw] top-[8vh] w-[86vw] h-[86vw] max-w-[1100px] max-h-[1100px] text-ink-4 opacity-[0.28] dark:opacity-[0.34]"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden
      >
        <circle cx="200" cy="200" r="199" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 5" />
        {[30, 60, 90, 120, 150].map((r) => (
          <ellipse
            key={r}
            cx="200"
            cy="200"
            rx={r * 1.32}
            ry="199"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = 200 - (lat / 90) * 199;
          const half = Math.sqrt(Math.max(0, 199 * 199 - (y - 200) * (y - 200)));
          return (
            <line
              key={lat}
              x1={200 - half}
              y1={y}
              x2={200 + half}
              y2={y}
              stroke="currentColor"
              strokeWidth={lat === 0 ? 0.9 : 0.5}
            />
          );
        })}
      </motion.svg>

      {/* Vinheta: as bordas da prancha sempre escurecem */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, transparent 45%, var(--paper-sunk) 100%)',
          opacity: 0.55,
        }}
      />
    </div>
  );
}
