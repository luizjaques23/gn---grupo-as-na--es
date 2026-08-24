export interface GNGroupTheme {
  primary: string;
  secondary: string;
  accent: string;
  colors: string[];
}

export interface GNGroup {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  name: string;
  leader: string;
  category: 'MENINAS' | 'MENINOS' | 'MISTO';
  time: string;
  city: string;
  neighborhood: string;
  zone: string;
  contact: string;
  contactRaw: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  theme: GNGroupTheme;
}

export interface BibleVerse {
  text: string;
  reference: string;
}

export const BIBLE_VERSES: BibleVerse[] = [
  {
    text: "Há mais de 20 anos promovendo o Evangelho de Jesus Cristo e fazendo discípulos de todas as nações.",
    reference: "Igreja às Nações"
  },
  {
    text: "Portanto, ide e fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho e do Espírito Santo;",
    reference: "Mateus 28:19"
  },
  {
    text: "Uma família para pertencer.",
    reference: "Igreja às Nações"
  },
  {
    text: "Ide por todo o mundo e pregai o evangelho a toda criatura.",
    reference: "Marcos 16:15"
  },
  {
    text: "Pede-me, e te darei as nações por herança e os confins da terra por tua posse.",
    reference: "Salmos 2:8"
  },
  {
    text: "E este evangelho do Reino será pregado em todo o mundo habitado, como testemunho a todas as nações.",
    reference: "Mateus 24:14"
  },
  {
    text: "Porque a terra se encherá do conhecimento da glória do Senhor, como as águas cobrem o mar.",
    reference: "Habacuque 2:14"
  }
];

export const GN_GROUPS: GNGroup[] = [
  {
    id: "mx-1",
    country: "México",
    countryCode: "MX",
    flag: "🇲🇽",
    name: "GN México",
    leader: "Luiz",
    category: "MENINOS",
    time: "Sábado — 19h30",
    city: "Porto Velho - RO",
    neighborhood: "COHAB",
    zone: "Zona Sul",
    contact: "69 92422-756",
    contactRaw: "5569992422756",
    coordinates: { latitude: -8.78866, longitude: -63.87488 },
    theme: {
      primary: "#006847", // Verde do México
      secondary: "#FFFFFF", // Branco
      accent: "#CE1126", // Vermelho do México
      colors: ["#006847", "#FFFFFF", "#CE1126"]
    }
  },
  {
    id: "gy-1",
    country: "Guiana Inglesa",
    countryCode: "GY",
    flag: "🇬🇾",
    name: "GN Guiana Inglesa",
    leader: "Jessica",
    category: "MENINAS",
    time: "Sábado — 19h30",
    city: "Porto Velho - RO",
    neighborhood: "COHAB",
    zone: "Zona Sul",
    contact: "69 99325-1700",
    contactRaw: "5569993251700",
    coordinates: { latitude: -8.78866, longitude: -63.87488 },
    theme: {
      primary: "#009E49", // Verde da Guiana
      secondary: "#FCD116", // Amarelo
      accent: "#CE1126", // Vermelho
      colors: ["#009E49", "#FCD116", "#000000", "#FFFFFF", "#CE1126"]
    }
  },
  {
    id: "py-1",
    country: "Paraguai",
    countryCode: "PY",
    flag: "🇵🇾",
    name: "GN Paraguai",
    leader: "Marcos Cezar",
    category: "MENINOS",
    time: "Sábado — 16h30",
    city: "Porto Velho - RO",
    neighborhood: "Agenor de Carvalho",
    zone: "Zona Leste",
    contact: "69 9302-0795",
    contactRaw: "5569993020795",
    coordinates: { latitude: -8.75620, longitude: -63.87240 },
    theme: {
      primary: "#D52B1E", // Vermelho do Paraguai
      secondary: "#FFFFFF", // Branco
      accent: "#0038A8", // Azul
      colors: ["#D52B1E", "#FFFFFF", "#0038A8"]
    }
  },
  {
    id: "uy-1",
    country: "Uruguai",
    countryCode: "UY",
    flag: "🇺🇾",
    name: "GN Uruguai",
    leader: "Marcos Cezar",
    category: "MENINOS",
    time: "Quarta-feira — 19h30",
    city: "Porto Velho - RO",
    neighborhood: "Centro",
    zone: "Centro",
    contact: "69 9302-0795",
    contactRaw: "5569993020795",
    coordinates: { latitude: -8.76080, longitude: -63.90390 },
    theme: {
      primary: "#0038A8", // Azul do Uruguai
      secondary: "#FFFFFF", // Branco
      accent: "#FCD116", // Sol de Mayo
      colors: ["#0038A8", "#FFFFFF", "#FCD116"]
    }
  },
  {
    id: "sr-1",
    country: "Suriname",
    countryCode: "SR",
    flag: "🇸🇷",
    name: "GN Suriname",
    leader: "Marcelo",
    category: "MENINOS",
    time: "Sábado — 18h30",
    city: "Porto Velho - RO",
    neighborhood: "Três Marias",
    zone: "Zona Leste",
    contact: "69 9302-0795",
    contactRaw: "5569993020795",
    coordinates: { latitude: -8.75910, longitude: -63.85040 },
    theme: {
      primary: "#377E3F", // Verde do Suriname
      secondary: "#B40A2D", // Vermelho
      accent: "#ECC81D", // Estrela Dourada
      colors: ["#377E3F", "#FFFFFF", "#B40A2D", "#ECC81D"]
    }
  }
];
