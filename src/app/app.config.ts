import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { trafficCaptureInterceptor } from './core/interceptors/traffic-capture.interceptor';
import { errorToastInterceptor } from './core/interceptors/error-toast.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tenantInterceptor, authInterceptor, errorToastInterceptor, trafficCaptureInterceptor])),
    provideAnimationsAsync(),
  ],
};
