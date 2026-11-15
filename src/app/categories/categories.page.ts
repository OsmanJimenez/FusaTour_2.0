import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Catalogue, Category } from '../core/models/catalogue';
import { TourDataService } from '../core/services/tour-data.service';
import { categoryDestinationCount } from '../core/utils/destinations';
import { imageUrl } from '../core/utils/image-url';
import { categoryLink } from '../core/utils/links';
import { slugify } from '../core/utils/slugify';
import { DestinationCatalogueComponent } from '../shared/destination-catalogue/destination-catalogue.component';
import { categoriesCopies } from './categories.copies';

@Component({
  selector: 'app-categories-page',
  imports: [RouterLink, DestinationCatalogueComponent],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
})
export class CategoriesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(TourDataService);

  readonly copies = categoriesCopies;
  readonly catalogue = signal<Catalogue | null>(null);

  readonly selectedCategory = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('category'))),
    { initialValue: null as string | null },
  );

  readonly currentCategory = computed(() => {
    const slug = this.selectedCategory();
    if (!slug) return undefined;
    return this.catalogue()?.categories.find((category) => slugify(category.name) === slug);
  });

  imageUrl = imageUrl;
  categoryLink = categoryLink;

  constructor() {
    this.data.catalogue.subscribe((catalogue) => this.catalogue.set(catalogue));
  }

  destinationCount(category: Category): number {
    return categoryDestinationCount(this.catalogue()?.destinations ?? [], category.id);
  }
}
