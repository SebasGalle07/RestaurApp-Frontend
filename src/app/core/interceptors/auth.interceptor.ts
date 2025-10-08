import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/');
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.authService.getAccessToken();
    const shouldAttachToken = accessToken && !isAuthEndpoint(req.url);

    const authReq = shouldAttachToken
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          return throwError(() => error);
        }

        if (isAuthEndpoint(req.url)) {
          return throwError(() => error);
        }

        if (this.authService.hasRefreshToken()) {
          return this.authService.refreshAccessToken().pipe(
            switchMap((token) => {
              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next.handle(retryRequest);
            }),
            catchError((refreshError) => {
              return this.authService.logout().pipe(
                switchMap(() => throwError(() => refreshError))
              );
            })
          );
        }

        return this.authService.logout().pipe(
          switchMap(() => throwError(() => error))
        );
      })
    );
  }
}
