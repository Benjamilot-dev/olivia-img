// Initial curated pins for Olivia the Cat! IMG
// Featuring Olivia's official portrait and high quality photography

export const INITIAL_PINS = [
  {
    id: 'pin-olivia-official',
    title: 'Olivia The Cat - Retrato Oficial Ilustrado',
    description: 'El emblema oficial de la reina Olivia the Cat. Una mirada imponente y sabia sobre su pedestal de madera.',
    imageUrl: '/olivia-logo.png',
    cloudinaryFolder: 'olivia-cat/portraits',
    aspectRatio: '16/10',
    likesCount: 342,
    savesCount: 189,
    author: {
      name: 'Olivia Oficial',
      avatar: '/olivia-logo.png',
      badge: '👑 Reina Felina'
    },
    tags: ['olivia', 'ilustracion', 'siames', 'oficial', 'vintage', 'retrato'],
    comments: [
      { id: 'c1', author: 'MichiFan', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: '¡Qué elegancia de gata! Digna reina.', date: 'Hace 2 horas' },
      { id: 'c2', author: 'Luna & Leo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'El logo es simplemente espectacular ❤️', date: 'Hace 4 horas' }
    ],
    createdAt: new Date('2026-09-24T10:00:00Z').toISOString(),
    isOfficial: true
  },
  {
    id: 'pin-1',
    title: 'Ojos celestes como zafiros en la mañana',
    description: 'Olivia vigilando el salón desde la parte más alta del rascador con sus penetrantes ojos azules.',
    imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/portraits',
    aspectRatio: '3/4',
    likesCount: 215,
    savesCount: 88,
    author: {
      name: 'Benjamilot',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      badge: 'Admin'
    },
    tags: ['ojos-azules', 'siames', 'belleza', 'retrato', 'olivia'],
    comments: [
      { id: 'c3', author: 'GatitosWeb', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Esa mirada hipnotiza a cualquiera...', date: 'Ayer' }
    ],
    createdAt: new Date('2026-09-23T15:30:00Z').toISOString()
  },
  {
    id: 'pin-2',
    title: 'Siesta profunda de mediodía',
    description: 'No hay nada mejor en la vida de Olivia que un rayo de sol justo encima del almohadón de plumas.',
    imageUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/sleepy',
    aspectRatio: '4/5',
    likesCount: 420,
    savesCount: 165,
    author: {
      name: 'Olivia Oficial',
      avatar: '/olivia-logo.png',
      badge: '👑 Reina Felina'
    },
    tags: ['siesta', 'dormilona', 'cozy', 'relax', 'paz'],
    comments: [],
    createdAt: new Date('2026-09-22T14:10:00Z').toISOString()
  },
  {
    id: 'pin-3',
    title: 'Exploración en el jardín botánico',
    description: 'Detectando bichitos entre los helechos y oliendo la hierba gatera fresca.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/adventures',
    aspectRatio: '1/1',
    likesCount: 184,
    savesCount: 72,
    author: {
      name: 'Elena Michis',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      badge: 'Fotógrafa'
    },
    tags: ['jardin', 'naturaleza', 'aventura', 'caceria', 'verde'],
    comments: [],
    createdAt: new Date('2026-09-21T09:40:00Z').toISOString()
  },
  {
    id: 'pin-4',
    title: 'El arte de juzgar a las 3:00 AM',
    description: 'POV: Olivia se sienta sobre tu pecho porque el plato de comida se ve el fondo por 1 milímetro.',
    imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/memes',
    aspectRatio: '3/4',
    likesCount: 650,
    savesCount: 310,
    author: {
      name: 'MemeMaster Cat',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      badge: 'Humor'
    },
    tags: ['meme', 'cara-seria', 'hambre', 'madrugada', 'humor'],
    comments: [
      { id: 'c4', author: 'Sofi2026', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', text: 'JAJAJA literal mi gata todas las noches!', date: 'Hace 1 día' }
    ],
    createdAt: new Date('2026-09-20T18:00:00Z').toISOString()
  },
  {
    id: 'pin-5',
    title: 'Tarde de café y ronroneo abrigado',
    description: 'Envuelta en una manta de lana suave mientras afuera llueve suavemente.',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/cozy',
    aspectRatio: '2/3',
    likesCount: 318,
    savesCount: 142,
    author: {
      name: 'Olivia Oficial',
      avatar: '/olivia-logo.png',
      badge: '👑 Reina Felina'
    },
    tags: ['cozy', 'lluvia', 'manta', 'otono', 'abrigo'],
    comments: [],
    createdAt: new Date('2026-09-19T11:20:00Z').toISOString()
  },
  {
    id: 'pin-6',
    title: 'Modo Ataque: Objetivo cordón de zapatilla',
    description: 'Pupilas dilatadas al 100%, cola moviéndose en zig-zag... listo para el asalto felino.',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/playtime',
    aspectRatio: '4/3',
    likesCount: 275,
    savesCount: 94,
    author: {
      name: 'Nico Play',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      badge: 'Jugador'
    },
    tags: ['juego', 'salto', 'travesura', 'divertido', 'accion'],
    comments: [],
    createdAt: new Date('2026-09-18T16:15:00Z').toISOString()
  },
  {
    id: 'pin-7',
    title: 'Perfil griego y bigotes plateados',
    description: 'Detalle de primer plano de Olivia demostrando por qué los siameses fueron adorados por la realeza.',
    imageUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/portraits',
    aspectRatio: '3/4',
    likesCount: 390,
    savesCount: 201,
    author: {
      name: 'Benjamilot',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      badge: 'Admin'
    },
    tags: ['retrato', 'perfil', 'bigotes', 'elegancia', 'detalles'],
    comments: [],
    createdAt: new Date('2026-09-17T12:00:00Z').toISOString()
  },
  {
    id: 'pin-8',
    title: 'Despertar con bostezo infinito',
    description: 'Ese momento glorioso después de dormir 14 horas seguidas.',
    imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=800&q=80',
    cloudinaryFolder: 'olivia-cat/sleepy',
    aspectRatio: '16/9',
    likesCount: 489,
    savesCount: 198,
    author: {
      name: 'CatLovers Global',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      badge: 'Comunidad'
    },
    tags: ['bostezo', 'despertar', 'siesta', 'tierno', 'cute'],
    comments: [],
    createdAt: new Date('2026-09-16T08:30:00Z').toISOString()
  }
];
