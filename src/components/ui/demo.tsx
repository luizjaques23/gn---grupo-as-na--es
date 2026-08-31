import { ImageStreamHero, StreamImage } from "@/components/ui/image-stream-hero";

export const CHRISTIAN_IMAGES: StreamImage[] = [
  {
    src: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80",
    alt: "Mãos levantadas em adoração e louvor a Deus",
  },
  {
    src: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
    alt: "Bíblia Sagrada aberta iluminada pela luz do sol",
  },
  {
    src: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    alt: "Cruz de Cristo silhuetada ao amanhecer",
  },
  {
    src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    alt: "Jovens cristãos reunidos em comunhão e amizade",
  },
  {
    src: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
    alt: "Momento íntimo de louvor e música acústica para Deus",
  },
  {
    src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
    alt: "Comunidade de jovens celebrando a fé juntos",
  },
  {
    src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    alt: "Congregação reunida em culto de adoração",
  },
  {
    src: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    alt: "Estudo da Palavra de Deus e devocional",
  },
  {
    src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
    alt: "Momento de oração, gratidão e paz espiritual",
  },
  {
    src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    alt: "Culto de jovens com iluminação vibrante e louvor intenso",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    alt: "Amizades cristãs e companheirismo no GN",
  },
  {
    src: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    alt: "Celebração e avivamento espiritual",
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <ImageStreamHero
      images={CHRISTIAN_IMAGES}
      className="h-[560px] w-full rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-xl"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center pointer-events-none">
        <div className="px-6 space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border border-black/5 text-[10px] font-bold uppercase tracking-[0.25em] text-black/70">
            Nossa Vivência &amp; Adoração
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Uma Geração Apaixonada
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              por Jesus Cristo
            </span>
          </h2>
        </div>
        <p className="max-w-md text-balance px-6 text-xs sm:text-sm text-black/60 font-medium bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full border border-black/5 shadow-xs">
          Momentos de fé, comunhão nos GNs, celebração e o agir de Deus na juventude da Igreja às Nações.
        </p>
      </div>
    </ImageStreamHero>
  );
}
