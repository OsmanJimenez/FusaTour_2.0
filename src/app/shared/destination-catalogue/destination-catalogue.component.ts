import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AtralumeEmptyState } from '@osmanjimenez/atralume/empty-state';
import { Category, Destination, Tag } from '../../core/models/catalogue';
import { TourDataService } from '../../core/services/tour-data.service';
import {
  categoryFor,
  categoryName,
  filterDestinations,
  tagNames,
} from '../../core/utils/destinations';
import { imageUrl } from '../../core/utils/image-url';
import { categoryLink, destinationLink } from '../../core/utils/links';
import { destinationCatalogueCopies } from './destination-catalogue.copies';

@Component({
  selector: 'app-destination-catalogue',
  imports: [CommonModule, DecimalPipe, RouterLink, AtralumeEmptyState],
  templateUrl: './destination-catalogue.component.html',
  styleUrl: './destination-catalogue.component.scss',
})
export class DestinationCatalogueComponent implements OnDestroy {
  private readonly data = inject(TourDataService);
  private readonly router = inject(Router);

  readonly mark = input('');
  readonly title = input('');
  readonly titleLevel = input<'h1' | 'h2'>('h2');
  readonly backLink = input<string[] | null>(null);
  readonly backLabel = input('');
  readonly destinations = input<Destination[]>([]);
  readonly categoryId = input<number | null>(null);
  readonly tagId = input<number | null>(null);
  readonly sortByRating = input(false);
  readonly limit = input<number | null>(null);

  readonly copies = destinationCatalogueCopies;
  readonly search = signal('');
  readonly catalogue = signal<{ categories: Category[]; tags: Tag[] } | null>(null);

  readonly displayed = computed(() => {
    const meta = this.catalogue();
    return filterDestinations(this.destinations(), {
      query: this.search(),
      categoryId: this.categoryId(),
      tagId: this.tagId(),
      sortByRating: this.sortByRating(),
      limit: this.limit(),
      categories: meta?.categories ?? [],
      tags: meta?.tags ?? [],
    });
  });

  private readonly routeSub = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => this.search.set(''));

  constructor() {
    this.data.catalogue.subscribe((catalogue) => {
      this.catalogue.set({ categories: catalogue.categories, tags: catalogue.tags });
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  imageUrl = imageUrl;
  categoryLink = categoryLink;
  destinationLink = destinationLink;

  categoryLabel(destination: Destination): string {
    return categoryName(this.catalogue()?.categories ?? [], destination.categoryId);
  }

  categoryRef(destination: Destination): Category | undefined {
    return categoryFor(this.catalogue()?.categories ?? [], destination.categoryId);
  }

  tagsLabel(destination: Destination): string {
    return tagNames(this.catalogue()?.tags ?? [], destination);
  }
}
