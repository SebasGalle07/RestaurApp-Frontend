import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const t = localStorage.getItem('access_token');
  if (t) req = req.clone({ setHeaders: { Authorization: `Bearer ${t}` } });

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
