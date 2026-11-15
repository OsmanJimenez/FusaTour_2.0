import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, shareReplay } from 'rxjs';
import { Catalogue, Category, Destination, ImmersiveTour, Tag } from '../models/catalogue';

export type { Catalogue, Category, Destination, ImmersiveTour, Tag };

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
