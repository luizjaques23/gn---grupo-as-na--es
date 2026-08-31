import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BIBLE_VERSES } from '../data/groups';

export default function BibleVerseTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % BIBLE_VERSES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const verse = BIBLE_VERSES[index];

  return (
    <div id="bible-verse-ticker" className="w-full max-w-2xl mx-auto px-4 py-5 text-center">
      <div className="min-h-[85px] flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-2.5"
          >
            <p className="text-xs md:text-sm font-normal italic text-[#1A1A1A] dark:text-zinc-200 leading-relaxed max-w-lg mx-auto">
              “{verse.text}”
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-black/50 dark:text-zinc-400">
              — {verse.reference}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
