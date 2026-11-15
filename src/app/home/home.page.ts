import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AtralumeButton } from '@osmanjimenez/atralume/button';
import { AtralumeImage360 } from '@osmanjimenez/atralume/image-360';
import { Catalogue, Category, Destination, ImmersiveTour } from '../core/models/catalogue';
import { TourDataService } from '../core/services/tour-data.service';
import {
  categoryDestinationCount as countByCategory,
  categoryName as nameForCategory,
  latestDestinations as latestByDate,
} from '../core/utils/destinations';
import { imageUrl } from '../core/utils/image-url';
import { categoryLink, destinationLink } from '../core/utils/links';
import { DestinationCatalogueComponent } from '../shared/destination-catalogue/destination-catalogue.component';
import { homeCopies } from './home.copies';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AtralumeButton, AtralumeImage360, DestinationCatalogueComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly data = inject(TourDataService);

  readonly copies = homeCopies;
  readonly catalogue = signal<Catalogue | null>(null);
  readonly selectedImmersiveTour = signal<string | null>(null);

  constructor() {
    this.data.catalogue.subscribe((catalogue) => this.catalogue.set(catalogue));
  }

  imageUrl = imageUrl;
  categoryLink = categoryLink;
  destinationLink = destinationLink;

  get destinations(): Destination[] {
    return this.catalogue()?.destinations ?? [];
  }

  get categories(): Category[] {
    return this.catalogue()?.categories ?? [];
  }

  get immersiveTours(): ImmersiveTour[] {
    return this.catalogue()?.immersiveTours ?? [];
  }

  get currentImmersiveTour(): ImmersiveTour | undefined {
    return this.immersiveTours.find((tour) => tour.id === this.selectedImmersiveTour()) ?? this.immersiveTours[0];
  }

  categoryDestinationCount(categoryId: number): number {
    return countByCategory(this.destinations, categoryId);
  }

  latestDestinations(): Destination[] {
    return latestByDate(this.destinations, 5);
  }

  categoryName(categoryId: number): string {
    return nameForCategory(this.categories, categoryId);
  }

  selectImmersiveTour(tour: ImmersiveTour): void {
    this.selectedImmersiveTour.set(tour.id);
  }
}
