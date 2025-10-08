import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

import { toCamelCase, toSnakeCase } from '../utils/case-converter';

function shouldTransformBody(body: unknown): body is Record<string, unknown> | unknown[] {
  if (body === null || body === undefined) return false;
  if (typeof body !== 'object') return false;
  if (body instanceof FormData) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return true;
}

@Injectable()
export class CaseHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let requestToSend = req;
    if (shouldTransformBody(req.body)) {
      const transformed = toSnakeCase(req.body);
      requestToSend = req.clone({ body: transformed });
    }

    return next.handle(requestToSend).pipe(
      map((event) => {
        if (event instanceof HttpResponse && shouldTransformBody(event.body)) {
          const transformed = toCamelCase(event.body);
          return event.clone({ body: transformed });
        }
        return event;
      }),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && shouldTransformBody(error.error)) {
          const transformed = toCamelCase(error.error);
          const cloned = new HttpErrorResponse({
            ...error,
            error: transformed,
            url: error.url ?? undefined
          });
          return throwError(() => cloned);
        }
        return throwError(() => error);
      })
    );
  }
}
