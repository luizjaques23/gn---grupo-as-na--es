export default function CompassRose({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="58" stroke="var(--rule)" strokeWidth="0.8" />
      <circle cx="60" cy="60" r="44" stroke="var(--rule)" strokeWidth="0.5" strokeDasharray="2 4" />

      {/* Graduação de 360° */}
      {Array.from({ length: 72 }).map((_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const major = i % 9 === 0;
        const r1 = major ? 48 : 53;
        return (
          <line
            key={i}
            x1={60 + Math.sin(a) * r1}
            y1={60 - Math.cos(a) * r1}
            x2={60 + Math.sin(a) * 58}
            y2={60 - Math.cos(a) * 58}
            stroke="var(--ink-4)"
            strokeWidth={major ? 0.9 : 0.4}
          />
        );
      })}

      {/* Agulha: norte na cor do selo, sul em tinta */}
      <path d="M60 10 L68 60 L60 52 L52 60 Z" fill="var(--seal)" />
      <path d="M60 110 L52 60 L60 68 L68 60 Z" fill="var(--ink-2)" />
      <path d="M10 60 L60 52 L52 60 L60 68 Z" fill="var(--ink-4)" opacity="0.55" />
      <path d="M110 60 L60 68 L68 60 L60 52 Z" fill="var(--ink-4)" opacity="0.55" />

      <circle cx="60" cy="60" r="3.2" fill="var(--paper-raised)" stroke="var(--ink-2)" strokeWidth="0.9" />

      <text x="60" y="7" textAnchor="middle" fontSize="7" fill="var(--ink-3)"
        fontFamily="var(--font-mono)" letterSpacing="1">N</text>
    </svg>
  );
}
