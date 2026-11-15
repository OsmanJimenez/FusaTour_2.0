import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AtralumeCard } from '@osmanjimenez/atralume/card';
import { AtralumeLink } from '@osmanjimenez/atralume/link';
import { Catalogue } from '../core/models/catalogue';
import { TourDataService } from '../core/services/tour-data.service';
import { imageUrl } from '../core/utils/image-url';
import { tagLink } from '../core/utils/links';
import { slugify } from '../core/utils/slugify';
import { DestinationCatalogueComponent } from '../shared/destination-catalogue/destination-catalogue.component';
import { activitiesCopies } from './activities.copies';

@Component({
  selector: 'app-activities-page',
  imports: [RouterLink, AtralumeCard, AtralumeLink, DestinationCatalogueComponent],
  templateUrl: './activities.page.html',
  styleUrl: './activities.page.scss',
})
export class ActivitiesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(TourDataService);

  readonly copies = activitiesCopies;
  readonly catalogue = signal<Catalogue | null>(null);

  readonly selectedTag = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('tag'))),
    { initialValue: null as string | null },
  );

  readonly currentTag = computed(() => {
    const slug = this.selectedTag();
    if (!slug) return undefined;
    return this.catalogue()?.tags.find((tag) => slugify(tag.name) === slug);
  });

  imageUrl = imageUrl;
  tagLink = tagLink;

  constructor() {
    this.data.catalogue.subscribe((catalogue) => this.catalogue.set(catalogue));
  }

  tagMark(name: string): string {
    return this.copies.markPrefix + name.toLocaleLowerCase('es-CO');
  }
}
