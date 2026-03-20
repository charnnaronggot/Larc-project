import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// import 'primeng/resources/themes/lara-light-blue/theme.css';
// import 'primeng/resources/primeng.min.css';
import Aura from '@primeuix/themes/aura';
// import { providePrimeNG } from '@primeuix/angular';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
            theme: {
                preset: Aura
            }
        })
  ]
};
