import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { Viewer } from '@photo-sphere-viewer/core';

@Component({
  selector: 'app-panorama-viewer',
  templateUrl: './panorama-viewer.component.html',
  styleUrl: './panorama-viewer.component.scss',
})
export class PanoramaViewerComponent implements AfterViewInit, OnChanges {
  readonly src = input.required<string>();
  readonly title = input.required<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('viewer');
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private viewer?: Viewer;
  private disposed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disposed = true;
      this.viewer?.destroy();
      this.viewer = undefined;
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const [{ Viewer }, { GyroscopePlugin }] = await Promise.all([
      import('@photo-sphere-viewer/core'),
      import('@photo-sphere-viewer/gyroscope-plugin'),
    ]);

    if (this.disposed) {
      return;
    }

    this.viewer = new Viewer({
      container: this.host().nativeElement,
      panorama: this.src(),
      caption: this.title(),
      loadingTxt: 'Cargando panorama…',
      keyboard: 'fullscreen',
      mousewheelCtrlKey: true,
      touchmoveTwoFingers: true,
      plugins: [GyroscopePlugin.withConfig({ moveMode: 'smooth', roll: false })],
      lang: {
        zoom: 'Zoom',
        zoomOut: 'Alejar',
        zoomIn: 'Acercar',
        moveUp: 'Mirar arriba',
        moveDown: 'Mirar abajo',
        moveLeft: 'Mirar a la izquierda',
        moveRight: 'Mirar a la derecha',
        fullscreen: 'Pantalla completa',
        loading: 'Cargando panorama…',
        twoFingers: 'Usa dos dedos para explorar',
        ctrlZoom: 'Usa Ctrl y la rueda para acercar',
        loadError: 'No fue posible cargar este panorama.',
        webglError: 'Tu navegador no admite la visualización 360°.',
        gyroscope: 'Activar giroscopio',
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const sourceChange = changes['src'];

    if (this.viewer && sourceChange && !sourceChange.firstChange) {
      void this.viewer.setPanorama(this.src(), { caption: this.title() });
    }
  }
}
