import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AtralumeDialog, AtralumeDialogClose, AtralumeDialogContent, AtralumeDialogTitle } from '@osmanjimenez/atralume/dialog';
import { AtralumeIconButton } from '@osmanjimenez/atralume/icon-button';
import { AtralumeNavigationBar, AtralumeNavigationItem } from '@osmanjimenez/atralume/navigation-bar';
import { AtralumeSnackbar } from '@osmanjimenez/atralume/snackbar';
import { Catalogue } from '../core/models/catalogue';
import { PreferencesService } from '../core/services/preferences.service';
import { SeoService } from '../core/services/seo.service';
import { TourDataService } from '../core/services/tour-data.service';
import { imageUrl } from '../core/utils/image-url';
import { shellCopies } from './shell.copies';

export type ShellView = 'home' | 'categories' | 'ranking' | 'activities' | 'detail';
export type StoryKey = 'data' | 'events' | 'symbols' | 'food' | 'weather';

@Component({
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    AtralumeDialogClose,
    AtralumeDialogContent,
    AtralumeDialogTitle,
    AtralumeIconButton,
    AtralumeNavigationBar,
    AtralumeNavigationItem,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly data = inject(TourDataService);
  private readonly preferences = inject(PreferencesService);
  private readonly seo = inject(SeoService);
  private readonly snackbar = inject(AtralumeSnackbar);
  private readonly dialog = inject(AtralumeDialog);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  @ViewChild('storyDialog') storyDialog?: TemplateRef<unknown>;

  readonly copies = shellCopies;
  readonly catalogue = signal<Catalogue | null>(null);
  readonly view = signal<ShellView>('home');
  readonly theme = this.preferences.theme;
  readonly activeStory = signal<StoryKey | null>(null);

  private routeSub = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => {
      this.syncView();
      this.seo.update(this.router.url, this.catalogue());
      if (this.browser) window.scrollTo({ top: 0, behavior: 'smooth' });
    });

  constructor() {
    this.preferences.init();
    this.data.catalogue.subscribe({
      next: (catalogue) => {
        this.catalogue.set(catalogue);
        this.syncView();
        this.seo.update(this.router.url, catalogue);
      },
      error: () => this.showToast(this.copies.loadError),
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  imageUrl = imageUrl;

  toggleTheme(): void {
    this.preferences.toggleTheme();
  }

  story(key: StoryKey): { title: string; image: string; text: string } {
    const stories: Record<StoryKey, { title: string; image: string; text: string }> = {
      data: {
        title: 'Datos importantes',
        image: 'historias/Datos.webp',
        text: 'Fusagasugá fue fundada el 5 de febrero de 1592. Pertenece a la provincia del Sumapaz y es conocida como la ciudad jardín de Colombia.',
      },
      events: {
        title: 'Eventos que se viven',
        image: 'historias/Eventos.webp',
        text: 'El calendario cultural reúne el desfile caballístico, Expofusa, el Festival de la Rumba Criolla, el Festival Nacional de Intérpretes y la Feria Floral y Agroindustrial.',
      },
      symbols: {
        title: 'Símbolos de la ciudad',
        image: 'historias/Simbolos.webp',
        text: 'El escudo y la bandera forman parte de la memoria cívica de Fusagasugá y acompañan sus celebraciones públicas.',
      },
      food: {
        title: 'Comida típica',
        image: 'historias/Comida_Tipica.webp',
        text: 'La vara es una preparación tradicional que acompaña la experiencia de recorrer los mercados y cocinas de la ciudad.',
      },
      weather: {
        title: 'Clima',
        image: 'historias/Clima.webp',
        text: 'Fusagasugá tiene una temperatura promedio cercana a 19 °C y una gran diversidad de climas por su territorio, desde zonas cálidas hasta páramo.',
      },
    };
    return stories[key];
  }

  openStory(key: StoryKey): void {
    this.activeStory.set(key);
    if (!this.storyDialog) return;
    this.dialog
      .open(this.storyDialog, { label: this.story(key).title, autoFocus: 'first-tabbable' })
      .afterClosed.subscribe(() => this.activeStory.set(null));
  }

  private syncView(): void {
    const route = this.router.url.split('?')[0].split('/').filter(Boolean)[0] ?? '';
    if (route === 'blog') this.view.set('detail');
    else if (route === 'categorias') this.view.set('categories');
    else if (route === 'ranking' || route === 'descubrir') this.view.set('ranking');
    else if (route === 'actividades') this.view.set('activities');
    else this.view.set('home');
  }

  private showToast(message: string): void {
    if (!this.browser) return;
    this.snackbar.open({ message, tone: 'info', duration: 2600, position: 'bottom', policy: 'replace' });
  }
}
