import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BIBLE_VERSES } from '../data/groups';
import { chartEase } from './atlas/Plate';

/**
 * Cartela de legenda da carta — onde o cartógrafo assinava a intenção da
 * folha. Aqui ficam os versículos, um de cada vez.
 */
export default function BibleVerseTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BIBLE_VERSES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused]);

  const verse = BIBLE_VERSES[index];

  return (
    <figure
      id="bible-verse-ticker"
      className="relative flex-1 flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-4 h-4 mb-4">
        <span className="legend text-[8px] leading-none">Cartela</span>
        <span className="hairline flex-1" />
      </div>

      <div className="flex-1 min-h-[9.5rem] sm:min-h-[8rem] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: chartEase }}
          >
            <blockquote className="font-plate text-[clamp(1.1rem,2.6vw,1.6rem)] leading-[1.35] text-ink italic max-w-[54ch]"
              style={{ fontVariationSettings: '"SOFT" 30, "WONK" 1, "opsz" 60' }}>
              {verse.text}
            </blockquote>
            <figcaption className="legend text-[8px] mt-5">{verse.reference}</figcaption>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Índice das cartelas — marcações, não bolinhas */}
      <div className="flex items-end gap-1.5 mt-8 h-3 shrink-0">
        {BIBLE_VERSES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Cartela ${i + 1}`}
            onClick={() => setIndex(i)}
            className="w-4 flex items-end justify-start cursor-pointer group py-1"
          >
            <span
              className="block w-full transition-all duration-500"
              style={{
                height: i === index ? 10 : 4,
                background: i === index ? 'var(--nation)' : 'var(--rule)',
              }}
            />
          </button>
        ))}
      </div>
    </figure>
  );
}
