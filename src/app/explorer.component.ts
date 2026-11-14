import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { AtralumeButton } from '@osmanjimenez/atralume/button';
import { AtralumeCard } from '@osmanjimenez/atralume/card';
import { AtralumeChip } from '@osmanjimenez/atralume/chip';
import { AtralumeGrid, AtralumeGridItem } from '@osmanjimenez/atralume/grid';
import { AtralumeIconButton } from '@osmanjimenez/atralume/icon-button';
import { AtralumeNavigationBar, AtralumeNavigationItem } from '@osmanjimenez/atralume/navigation-bar';
import { Catalogue, Category, Destination, Tag, TourDataService } from './tour-data.service';

type View = 'home' | 'categories' | 'ranking' | 'activities' | 'detail' | 'scanner';
type StoryKey = 'data' | 'events' | 'symbols' | 'food' | 'weather';

@Component({
  selector: 'app-explorer',
  imports: [
    CommonModule, DatePipe, RouterLink,
    AtralumeButton, AtralumeCard, AtralumeChip, AtralumeGrid, AtralumeGridItem,
    AtralumeIconButton, AtralumeNavigationBar, AtralumeNavigationItem,
  ],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.scss',
})
export class ExplorerComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly data = inject(TourDataService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('scannerVideo') scannerVideo?: ElementRef<HTMLVideoElement>;

  readonly catalogue = signal<Catalogue | null>(null);
  readonly view = signal<View>('home');
  readonly selectedDestinationSlug = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedTag = signal<string | null>(null);
  readonly search = signal('');
  readonly menuOpen = signal(false);
  readonly theme = signal<'light' | 'dark'>(this.readStorage('fusatour-theme', 'light') as 'light' | 'dark');
  readonly fontScale = signal(Number(this.readStorage('fusatour-font-scale', '1')));
  readonly activeImage = signal<string | null>(null);
  readonly activeStory = signal<StoryKey | null>(null);
  readonly toast = signal('');
  readonly scanning = signal(false);
  readonly scannerMessage = signal('Activa la cámara para leer un código QR de FusaTour.');

  private cameraStream?: MediaStream;
  private scannerFrame?: number;

  constructor() {
    this.applyTheme();
    this.applyFontScale();
    this.data.catalogue.subscribe({
      next: (catalogue) => {
        this.catalogue.set(catalogue);
        this.syncRoute();
      },
      error: () => this.showToast('No fue posible cargar la guía local.'),
    });
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      this.search.set('');
      this.syncRoute();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  get destinations(): Destination[] {
    return this.catalogue()?.destinations ?? [];
  }

  get categories(): Category[] {
    return this.catalogue()?.categories ?? [];
  }

  get tags(): Tag[] {
    return this.catalogue()?.tags ?? [];
  }

  get currentDestination(): Destination | undefined {
    return this.destinations.find((destination) => destination.slug === this.selectedDestinationSlug());
  }

  get currentCategory(): Category | undefined {
    return this.categories.find((category) => this.slugify(category.name) === this.selectedCategory());
  }

  get currentTag(): Tag | undefined {
    return this.tags.find((tag) => this.slugify(tag.name) === this.selectedTag());
  }

  get displayedDestinations(): Destination[] {
    const query = this.search().trim().toLocaleLowerCase('es-CO');
    let list = this.destinations;
    if (this.view() === 'categories' && this.currentCategory) list = list.filter((item) => item.categoryId === this.currentCategory?.id);
    if (this.view() === 'activities' && this.currentTag) list = list.filter((item) => item.tagIds.includes(this.currentTag?.id ?? -1));
    if (this.view() === 'ranking') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (query) {
      list = list.filter((item) => [item.title, item.summary, this.categoryName(item.categoryId), ...this.destinationTags(item).map((tag) => tag.name)]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es-CO')
        .includes(query));
    }
    return this.view() === 'home' && !query ? list.slice(0, 6) : list;
  }

  latestDestinations(): Destination[] {
    return [...this.destinations].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')).slice(0, 3);
  }

  categoryName(categoryId: number): string {
    return this.categories.find((category) => category.id === categoryId)?.name ?? 'Fusagasugá';
  }

  categoryFor(categoryId: number): Category | undefined {
    return this.categories.find((category) => category.id === categoryId);
  }

  categoryDestinationCount(categoryId: number): number {
    return this.destinations.filter((destination) => destination.categoryId === categoryId).length;
  }

  destinationTags(destination: Destination): Tag[] {
    return this.tags.filter((tag) => destination.tagIds.includes(tag.id));
  }

  tagNames(destination: Destination): string {
    return this.destinationTags(destination).slice(0, 2).map((tag) => tag.name).join(' · ');
  }

  destinationImages(destination: Destination): string[] {
    return Array.from(new Set([destination.coverImage, ...destination.gallery.map((image) => image.fileName)].filter((image): image is string => Boolean(image))));
  }

  imageUrl(image: string | null): string {
    return image ? `images/${encodeURIComponent(image)}` : 'images/Fondo.webp';
  }

  categoryLink(category: Category): string[] {
    return ['/categorias', this.slugify(category.name)];
  }

  tagLink(tag: Tag): string[] {
    return ['/actividades', this.slugify(tag.name)];
  }

  destinationLink(destination: Destination): string[] {
    return ['/blog', destination.slug];
  }

  story(key: StoryKey): { title: string; image: string; text: string } {
    const stories: Record<StoryKey, { title: string; image: string; text: string }> = {
      data: { title: 'Datos importantes', image: 'historias/Datos.webp', text: 'Fusagasugá fue fundada el 5 de febrero de 1592. Pertenece a la provincia del Sumapaz y es conocida como la ciudad jardín de Colombia.' },
      events: { title: 'Eventos que se viven', image: 'historias/Eventos.webp', text: 'El calendario cultural reúne el desfile caballístico, Expofusa, el Festival de la Rumba Criolla, el Festival Nacional de Intérpretes y la Feria Floral y Agroindustrial.' },
      symbols: { title: 'Símbolos de la ciudad', image: 'historias/Simbolos.webp', text: 'El escudo y la bandera forman parte de la memoria cívica de Fusagasugá y acompañan sus celebraciones públicas.' },
      food: { title: 'Comida típica', image: 'historias/Comida_Tipica.webp', text: 'La vara es una preparación tradicional que acompaña la experiencia de recorrer los mercados y cocinas de la ciudad.' },
      weather: { title: 'Clima', image: 'historias/Clima.webp', text: 'Fusagasugá tiene una temperatura promedio cercana a 19 °C y una gran diversidad de climas por su territorio, desde zonas cálidas hasta páramo.' },
    };
    return stories[key];
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    this.writeStorage('fusatour-theme', this.theme());
    this.applyTheme();
  }

  adjustFont(step: number): void {
    const next = Math.min(1.2, Math.max(0.9, Number((this.fontScale() + step).toFixed(2))));
    this.fontScale.set(next);
    this.writeStorage('fusatour-font-scale', String(next));
    this.applyFontScale();
  }

  openImage(image: string): void {
    this.activeImage.set(image);
  }

  share(destination: Destination): void {
    const url = `${location.origin}/blog/${destination.slug}`;
    if (navigator.share) {
      navigator.share({ title: destination.title, text: destination.summary ?? destination.title, url }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(url).then(() => this.showToast('Enlace copiado para compartir.')).catch(() => this.showToast('Copia el enlace desde la barra del navegador.'));
  }

  safeMap(url: string | null): SafeResourceUrl | null {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  startScanner(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.scannerMessage.set('Este navegador no permite abrir la cámara.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then((stream) => {
        this.cameraStream = stream;
        const video = this.scannerVideo?.nativeElement;
        if (!video) return;
        video.srcObject = stream;
        this.scanning.set(true);
        this.scannerMessage.set('Apunta al código QR del lugar.');
        this.readQr(video);
      })
      .catch(() => this.scannerMessage.set('No fue posible acceder a la cámara. Revisa el permiso del navegador.'));
  }

  stopScanner(): void {
    if (this.scannerFrame) cancelAnimationFrame(this.scannerFrame);
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = undefined;
    this.scanning.set(false);
  }

  private readQr(video: HTMLVideoElement): void {
    const Detector = (window as unknown as { BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: unknown) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    if (!Detector) {
      this.scannerMessage.set('La cámara está activa. Este navegador aún no ofrece lectura QR automática.');
      return;
    }
    const detector = new Detector({ formats: ['qr_code'] });
    const scan = async () => {
      if (!this.scanning()) return;
      try {
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue;
        if (value) {
          this.openScannedValue(value);
          return;
        }
      } catch {
        // The next camera frame may be ready even if this one is not.
      }
      this.scannerFrame = requestAnimationFrame(scan);
    };
    this.scannerFrame = requestAnimationFrame(scan);
  }

  private openScannedValue(value: string): void {
    this.stopScanner();
    const matchingDestination = this.destinations.find((destination) => value.includes(destination.slug));
    if (matchingDestination) {
      this.router.navigate(this.destinationLink(matchingDestination));
      return;
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      window.open(value, '_blank', 'noopener');
      return;
    }
    this.scannerMessage.set('El código no corresponde a un lugar disponible en esta guía.');
  }

  private syncRoute(): void {
    const parts = this.router.url.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
    const route = parts[0] ?? '';
    this.selectedDestinationSlug.set(null);
    this.selectedCategory.set(null);
    this.selectedTag.set(null);
    if (route === 'blog' && parts[1]) {
      this.view.set('detail');
      this.selectedDestinationSlug.set(parts[1]);
    } else if (route === 'categorias') {
      this.view.set('categories');
      this.selectedCategory.set(parts[1] ?? null);
    } else if (route === 'ranking' || route === 'descubrir') {
      this.view.set('ranking');
    } else if (route === 'actividades') {
      this.view.set('activities');
      this.selectedTag.set(parts[1] ?? null);
    } else if (route === 'escaner') {
      this.view.set('scanner');
    } else {
      this.view.set('home');
    }
  }

  private slugify(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CO').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(''), 2600);
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    document.documentElement.dataset['atrTheme'] = this.theme();
  }

  private applyFontScale(): void {
    document.documentElement.style.setProperty('--reading-scale', String(this.fontScale()));
  }

  private readStorage(key: string, fallback: string): string {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  private writeStorage(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
  }

}
