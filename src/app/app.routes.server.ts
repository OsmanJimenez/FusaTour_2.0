import { RenderMode, ServerRoute } from '@angular/ssr';

const categorySlugs = ['ecoturismo', 'monumentos', 'murales'];
const tagSlugs = [
  'arte', 'avistamiento-de-aves', 'caminata', 'ciclopaseo', 'educacion-ambiental',
  'escalada', 'fauna', 'flora', 'fotografia', 'senderismo',
];
const destinationSlugs = [
  'monumento-lucho-herrera', 'monumento-jardinera', 'monumento-indio-sutagao',
  'monumento-rumba-criolla', 'monumento-emilio-sierra', 'monumento-jorge-eliecer-gaitan',
  'monumento-manuel-humberto-cardenas-velez', 'mural-floral', 'mural-energia', 'mural-paramo',
  'mural-belleza', 'mural-multicolor', 'mural-cool', 'mural-noche', 'mural-suena',
  'mural-raices', 'mural-salvaje', 'parque-natural-san-rafael',
  'sendero-ecologico-al-cerro-fusacatan',
];

const staticRoute = (path: string): ServerRoute => ({
  path,
  renderMode: RenderMode.Prerender,
});

export const serverRoutes: ServerRoute[] = [
  staticRoute(''),
  staticRoute('categorias'),
  {
    path: 'categorias/:category',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return categorySlugs.map((category) => ({ category }));
    },
  },
  staticRoute('ranking'),
  staticRoute('descubrir'),
  staticRoute('actividades'),
  {
    path: 'actividades/:tag',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return tagSlugs.map((tag) => ({ tag }));
    },
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return destinationSlugs.map((slug) => ({ slug }));
    },
  },
  staticRoute('escaner'),
  { path: '**', renderMode: RenderMode.Client },
];
