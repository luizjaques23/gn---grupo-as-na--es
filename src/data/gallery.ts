export interface GalleryPhotoItem {
  src: string;
  title: string;
  description: string;
  category: string;
}

export const CHRISTIAN_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    src: '/images/sonaction/sonaction-1.jpg',
    title: 'Palavra',
    description: 'Ministração no palco da Son Action.',
    category: 'Culto',
  },
  {
    src: '/images/sonaction/sonaction-2.jpg',
    title: 'Altar',
    description: 'Adolescentes e jovens de joelhos, em oração.',
    category: 'Oração',
  },
  {
    src: '/images/sonaction/sonaction-3.jpg',
    title: 'Bíblia aberta',
    description: 'Leitura e meditação antes do culto começar.',
    category: 'Devocional',
  },
  {
    src: '/images/sonaction/sonaction-4.jpg',
    title: 'Adoração',
    description: 'A geração reunida em busca da presença de Deus.',
    category: 'Louvor',
  },
  {
    src: '/images/sonaction/sonaction-5.jpg',
    title: 'Entrega',
    description: 'Quebrantamento e louvor na Son Action.',
    category: 'Culto',
  },
];
