import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, combineLatest, map } from 'rxjs';
import { AtralumeImageGallery } from '@osmanjimenez/atralume/image-gallery';
import { AtralumeSnackbar } from '@osmanjimenez/atralume/snackbar';
import { Catalogue, Category, Destination, Tag } from '../core/models/catalogue';
import { PreferencesService } from '../core/services/preferences.service';
import { TourDataService } from '../core/services/tour-data.service';
import { categoryFor, categoryName, destinationImages, destinationTags } from '../core/utils/destinations';
import { imageUrl } from '../core/utils/image-url';
import { categoryLink, tagLink } from '../core/utils/links';
import { detailCopies } from './detail.copies';

@Component({
  selector: 'app-detail-page',
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    AtralumeImageGallery,
  ],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(TourDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly preferences = inject(PreferencesService);
  private readonly snackbar = inject(AtralumeSnackbar);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly copies = detailCopies;
  readonly catalogue = signal<Catalogue | null>(null);
  readonly destination = signal<Destination | null>(null);
  readonly fontScale = this.preferences.fontScale;

  private readonly sub: Subscription;

  constructor() {
    this.sub = combineLatest([
      this.data.catalogue,
      this.route.paramMap.pipe(map((params) => params.get('slug'))),
    ]).subscribe(([catalogue, slug]) => {
      this.catalogue.set(catalogue);
      this.destination.set(catalogue.destinations.find((item) => item.slug === slug) ?? null);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  imageUrl = imageUrl;
  categoryLink = categoryLink;
  tagLink = tagLink;
  destinationImages = destinationImages;

  categoryFor(categoryId: number): Category | undefined {
    return categoryFor(this.catalogue()?.categories ?? [], categoryId);
  }

  categoryName(categoryId: number): string {
    return categoryName(this.catalogue()?.categories ?? [], categoryId);
  }

  destinationTags(destination: Destination): Tag[] {
    return destinationTags(this.catalogue()?.tags ?? [], destination);
  }

  galleryImages(destination: Destination) {
    return destinationImages(destination).map((fileName, index) => ({
      id: `${destination.id}-${index}`,
      src: imageUrl(fileName),
      alt: `${destination.title}, imagen ${index + 1}`,
      title: destination.title,
    }));
  }

  safeMap(url: string | null): SafeResourceUrl | null {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  fontScaleLabel(): string {
    return `${Math.round(this.fontScale() * 100)}%`;
  }

  adjustFont(step: number): void {
    this.preferences.adjustFont(step);
  }

  resetFont(): void {
    this.preferences.resetFont();
  }

  share(destination: Destination): void {
    if (!this.browser) return;
    const url = `${location.origin}/blog/${destination.slug}`;
    if (navigator.share) {
      navigator.share({ title: destination.title, text: destination.summary ?? destination.title, url }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(url)
      .then(() => this.showToast(this.copies.shareCopied))
      .catch(() => this.showToast(this.copies.shareFallback));
  }

  private showToast(message: string): void {
    if (!this.browser) return;
    this.snackbar.open({ message, tone: 'info', duration: 2600, position: 'bottom', policy: 'replace' });
  }
}
