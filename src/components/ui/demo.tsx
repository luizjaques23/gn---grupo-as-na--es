import { ImageStreamHero, StreamImage } from "@/components/ui/image-stream-hero";

export const CHRISTIAN_IMAGES: StreamImage[] = [
  {
    src: "/images/sonaction/sonaction-1.jpg",
    alt: "Ministração da Palavra de Deus no culto Son Action — Igreja às Nações",
  },
  {
    src: "/images/sonaction/sonaction-2.jpg",
    alt: "Jovens e adolescentes de joelhos no altar em profunda oração",
  },
  {
    src: "/images/sonaction/sonaction-3.jpg",
    alt: "Momento íntimo de oração e reflexão com a Bíblia Sagrada aberta",
  },
  {
    src: "/images/sonaction/sonaction-4.jpg",
    alt: "Geração reunida em clamor, adoração e entrega a Deus",
  },
  {
    src: "/images/sonaction/sonaction-5.jpg",
    alt: "Rendição e louvor sincero na presença do Senhor",
  },
  {
    src: "/images/sonaction/sonaction-2.jpg",
    alt: "Comunhão e quebrantamento na presença do Espírito Santo",
  },
  {
    src: "/images/sonaction/sonaction-1.jpg",
    alt: "Pregação do Evangelho e edificação da juventude",
  },
  {
    src: "/images/sonaction/sonaction-3.jpg",
    alt: "Devocional e busca pelas Escrituras Sagradas",
  },
  {
    src: "/images/sonaction/sonaction-5.jpg",
    alt: "Jovem prostrado em oração e clamor a Jesus Cristo",
  },
  {
    src: "/images/sonaction/sonaction-4.jpg",
    alt: "Adolescentes e jovens firmados no propósito divino",
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <ImageStreamHero
      images={CHRISTIAN_IMAGES}
      className="h-[520px] md:h-[560px] w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12131C]/80 backdrop-blur-md shadow-xl"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-10 text-center pointer-events-none">
        <div className="px-6 space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 dark:from-purple-500/20 dark:via-blue-500/20 dark:to-emerald-500/20 border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.25em] text-black/70 dark:text-zinc-300">
            Nossa Vivência &amp; Adoração
          </span>
          <h2 className="text-balance text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Uma Geração Apaixonada
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 dark:from-purple-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              por Jesus Cristo
            </span>
          </h2>
        </div>
        <p className="max-w-md text-balance px-6 text-xs sm:text-sm text-black/70 dark:text-zinc-300 font-medium bg-white/90 dark:bg-black/70 backdrop-blur-sm py-2 px-4 rounded-full border border-black/5 dark:border-white/10 shadow-xs">
          Momentos reais de fé, quebrantamento, oração e o agir de Deus na juventude da Igreja às Nações e Son Action.
        </p>
      </div>
    </ImageStreamHero>
  );
}
