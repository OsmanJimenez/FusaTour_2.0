import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly theme = signal<'light' | 'dark'>(this.readStorage('fusatour-theme', 'light') as 'light' | 'dark');
  readonly fontScale = signal(Number(this.readStorage('fusatour-font-scale', '1')));

  init(): void {
    if (!this.browser) return;
    this.applyTheme();
    this.applyFontScale();
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    this.writeStorage('fusatour-theme', this.theme());
    this.applyTheme();
  }

  adjustFont(step: number): void {
    const next = Math.min(1.45, Math.max(0.85, Number((this.fontScale() + step).toFixed(2))));
    this.fontScale.set(next);
    this.writeStorage('fusatour-font-scale', String(next));
    this.applyFontScale();
  }

  resetFont(): void {
    this.fontScale.set(1);
    this.writeStorage('fusatour-font-scale', '1');
    this.applyFontScale();
  }

  private applyTheme(): void {
    if (!this.browser) return;
    document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    document.documentElement.dataset['atrTheme'] = this.theme();
  }

  private applyFontScale(): void {
    if (!this.browser) return;
    document.documentElement.style.setProperty('--reading-scale', String(this.fontScale()));
  }

  private readStorage(key: string, fallback: string): string {
    if (!this.browser) return fallback;
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  private writeStorage(key: string, value: string): void {
    if (!this.browser) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Storage is optional. */
    }
  }
}
