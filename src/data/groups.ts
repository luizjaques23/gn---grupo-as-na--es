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
  address: string;
  instagram: string;
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
    text: "Ide por todo o mundo e pregai o evangelho a toda criatura.",
    reference: "Marcos 16:15"
  },
  {
    text: "Uma família. Muitas nações. Um só propósito.",
    reference: "Igreja às Nações"
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
    text: "Portanto, ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.",
    reference: "Mateus 28:19"
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
    address: "R. Alecrim, 5624 - Cohab, Porto Velho - RO, 76807-534",
    instagram: "@gngrupoasnacoes.mx",
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
    address: "R. Alecrim, 5624 - Cohab, Porto Velho - RO, 76807-534",
    instagram: "@gngrupoasnacoes.gy",
    coordinates: { latitude: -8.78866, longitude: -63.87488 },
    theme: {
      primary: "#009E49", // Verde da Guiana
      secondary: "#FCD116", // Amarelo
      accent: "#CE1126", // Vermelho
      colors: ["#009E49", "#FCD116", "#000000", "#FFFFFF", "#CE1126"]
    }
  }
];
