import { useState } from 'react';

type Props = {
  /** ISO 3166-1 alpha-2, como vem de `countryCode`. */
  code: string;
  /** Nome da nação, usado no texto alternativo. */
  name: string;
  /** Altura via classe utilitária — a largura acompanha a proporção real. */
  className?: string;
  /** Cores da bandeira, usadas se o arquivo não carregar. */
  colors?: string[];
};

/**
 * A bandeira de verdade, no desenho oficial e na proporção real do país.
 * Os arquivos ficam em `public/flags/<iso>.svg`; se um deles faltar, a peça
 * cai de volta na faixa de cores, que é o desenho antigo desta prancha.
 */
export default function Flag({ code, name, className = 'h-9', colors }: Props) {
  const [failed, setFailed] = useState(false);
  const iso = code.toLowerCase();

  if (failed || !code) {
    return (
      <span className={`flag-band ${className} w-14`} role="img" aria-label={`Bandeira de ${name}`}>
        {(colors ?? ['var(--ink)']).map((c, i) => (
          <span key={`${c}-${i}`} style={{ background: c }} />
        ))}
      </span>
    );
  }

  return (
    <img
      src={`/flags/${iso}.svg`}
      alt={`Bandeira de ${name}`}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      className={`flag-plate w-auto ${className}`}
    />
  );
}
