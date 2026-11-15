export interface Category {
  id: number;
  name: string;
  image: string | null;
}

export interface Tag {
  id: number;
  name: string;
  image: string | null;
}

export interface Destination {
  id: number;
  slug: string;
  title: string;
  categoryId: number;
  tagIds: number[];
  coverImage: string | null;
  gallery: Array<{ position: number; fileName: string }>;
  supplementaryPhotos: string[];
  summary: string | null;
  bodyHtml: string | null;
  additionalContent: string | null;
  publishedAt: string | null;
  rating: number | null;
  artist: string | null;
  accentColor: string | null;
  mapEmbedUrl: string | null;
  scene: string | null;
}

export interface ImmersiveTour {
  id: string;
  title: string;
  description: string;
  fileName: string;
  alt: string;
}

export interface Catalogue {
  categories: Category[];
  tags: Tag[];
  destinations: Destination[];
  immersiveTours: ImmersiveTour[];
}
