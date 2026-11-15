import { Component, inject, signal } from '@angular/core';
import { Catalogue } from '../core/models/catalogue';
import { TourDataService } from '../core/services/tour-data.service';
import { DestinationCatalogueComponent } from '../shared/destination-catalogue/destination-catalogue.component';
import { rankingCopies } from './ranking.copies';

@Component({
  selector: 'app-ranking-page',
  imports: [DestinationCatalogueComponent],
  templateUrl: './ranking.page.html',
  styleUrl: './ranking.page.scss',
})
export class RankingPage {
  private readonly data = inject(TourDataService);

  readonly copies = rankingCopies;
  readonly catalogue = signal<Catalogue | null>(null);

  constructor() {
    this.data.catalogue.subscribe((catalogue) => this.catalogue.set(catalogue));
  }
}
