import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, shareReplay } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class TourDataService {
  private readonly http = inject(HttpClient);

  readonly catalogue = forkJoin({
    categories: this.http.get<Category[]>('data/fusatour/categories.json'),
    tags: this.http.get<Tag[]>('data/fusatour/tags.json'),
    destinations: this.http.get<Destination[]>('data/fusatour/destinations.json'),
    immersiveTours: this.http.get<ImmersiveTour[]>('data/fusatour/immersive-tours.json'),
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
