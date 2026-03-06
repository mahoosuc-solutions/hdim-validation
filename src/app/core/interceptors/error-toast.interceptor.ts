import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

const SUPPRESSED_URLS = ['/actuator/health', '/api/v1/compliance'];

export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (SUPPRESSED_URLS.some(u => req.url.includes(u))) {
        return throwError(() => error);
      }

      const status = error.status;
      let message: string;

      if (status === 0) {
        message = `Network error: ${req.method} ${getShortUrl(req.url)}`;
      } else if (status >= 500) {
        message = `Server error ${status}: ${req.method} ${getShortUrl(req.url)}`;
      } else if (status === 404) {
        message = `Not found: ${getShortUrl(req.url)}`;
      } else if (status >= 400) {
        message = `Request failed ${status}: ${getShortUrl(req.url)}`;
      } else {
        return throwError(() => error);
      }

      snackBar.open(message, 'Dismiss', {
        duration: 4000,
        panelClass: status >= 500 ? 'error-snackbar' : 'warning-snackbar',
      });

      return throwError(() => error);
    }),
  );
};

function getShortUrl(url: string): string {
  try {
    const path = new URL(url, 'http://localhost').pathname;
    return path.length > 50 ? path.slice(0, 47) + '...' : path;
  } catch {
    return url.slice(0, 50);
  }
}
