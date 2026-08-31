import { ImageStreamHero, StreamImage } from "@/components/ui/image-stream-hero";

export interface GalleryPhotoItem {
  src: string;
  title: string;
  description: string;
  category: string;
  badgeColor: string;
}

export const CHRISTIAN_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    src: "/images/sonaction/sonaction-1.jpg",
    title: "Palavra & Ensinamento",
    description: "Ministração transformadora no palco da Son Action",
    category: "Ministração",
    badgeColor: "bg-orange-500",
  },
  {
    src: "/images/sonaction/sonaction-2.jpg",
    title: "Oração & Entrega",
    description: "Adolescentes e jovens de joelhos no altar em clamor a Deus",
    category: "Clamor & Fé",
    badgeColor: "bg-purple-600",
  },
  {
    src: "/images/sonaction/sonaction-3.jpg",
    title: "A Palavra de Deus",
    description: "Momento íntimo de oração e meditação na Bíblia Sagrada",
    category: "Devocional",
    badgeColor: "bg-blue-600",
  },
  {
    src: "/images/sonaction/sonaction-4.jpg",
    title: "Adoração & Reverência",
    description: "Geração unida em profunda busca pela presença do Senhor",
    category: "Juventude",
    badgeColor: "bg-emerald-600",
  },
  {
    src: "/images/sonaction/sonaction-5.jpg",
    title: "Rendição Total",
    description: "Quebrantamento e louvor sincero na presença de Deus",
    category: "Avivamento",
    badgeColor: "bg-pink-600",
  },
];

export const CHRISTIAN_IMAGES: StreamImage[] = CHRISTIAN_GALLERY_PHOTOS.map((item) => ({
  src: item.src,
  alt: item.title,
}));

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <div className="w-full py-8 space-y-6">
      <div className="relative overflow-hidden w-full py-4">
        <div className="animate-marquee-photos gap-4 px-2">
          {[...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS].map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="w-[280px] sm:w-[320px] h-[380px] sm:h-[400px] flex-shrink-0 bg-white dark:bg-[#12131C] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group select-none flex flex-col justify-end"
            >
              <img
                src={item.src}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity" />
              <div className="absolute top-4 left-4 z-10">
                <span className={`inline-block px-3 py-1 rounded-full ${item.badgeColor} text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md`}>
                  {item.category}
                </span>
              </div>
              <div className="relative z-10 p-5 space-y-1.5 text-left text-white">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-white/80 font-medium leading-snug line-clamp-2">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/60 uppercase">
                  <span>Igreja às Nações</span>
                  <span>·</span>
                  <span>Son Action</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
