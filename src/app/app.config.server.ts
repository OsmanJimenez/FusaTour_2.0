import { DOCUMENT } from '@angular/common';
import { mergeApplicationConfig, ApplicationConfig, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { WA_WINDOW } from '@ng-web-apis/common';
import { provideTaiga } from '@taiga-ui/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    {
      provide: WA_WINDOW,
    useFactory: () => {
      const ignore = () => undefined;
      const mediaQuery = {
        matches: false,
        media: '',
        onchange: null,
        addEventListener: ignore,
        removeEventListener: ignore,
        addListener: ignore,
        removeListener: ignore,
        dispatchEvent: () => false,
      };

      return {
        document: inject(DOCUMENT),
        navigator: { userAgent: 'Angular Static Site Generator' },
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: ignore,
        removeEventListener: ignore,
        dispatchEvent: () => false,
        matchMedia: () => mediaQuery,
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        requestAnimationFrame: () => 0,
        cancelAnimationFrame: ignore,
      };
    },
    },
    provideTaiga(),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
