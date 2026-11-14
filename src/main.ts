import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideAtralume } from '@osmanjimenez/atralume';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const browserConfig: ApplicationConfig = { providers: [provideAtralume()] };

bootstrapApplication(App, mergeApplicationConfig(appConfig, browserConfig)).catch((err) => console.error(err));
