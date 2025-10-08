import { Injectable, OnDestroy, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { LoginRequest, LoginResponse, RefreshResponse, TokenPair } from '../models/auth.models';

interface AuthSession {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  role: string | null;
  subject: string | null;
}

const STORAGE_KEY = 'restaurapp.auth.session';
const REFRESH_MARGIN_MS = 60_000;

interface JwtPayload {
  rol?: string;
  role?: string;
  sub?: string;
  [key: string]: unknown;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized.padEnd(normalized.length + padLength, '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function decodeRole(token: string): string | null {
  const payload = decodePayload(token);
  return payload?.rol ?? payload?.role ?? null;
}

function decodeSubject(token: string): string | null {
  const payload = decodePayload(token);
  const raw = payload?.sub;
  return typeof raw === 'string' ? raw : null;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private sessionState = signal<AuthSession | null>(null);
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private refreshRequest$?: Observable<string>;

  readonly isAuthenticated = computed(() => {
    const current = this.sessionState();
    return !!current && current.expiresAt > Date.now();
  });

  readonly currentRole = computed(() => this.sessionState()?.role ?? null);
  readonly currentSubject = computed(() => this.sessionState()?.subject ?? null);
  readonly session = computed(() => this.sessionState());

  constructor(private authApi: AuthApiService, private router: Router) {
    const stored = this.loadFromStorage();
    if (stored && stored.expiresAt > Date.now()) {
      this.sessionState.set(stored);
      this.scheduleRefresh(stored.expiresAt);
    } else if (stored?.refreshToken) {
      this.refreshAccessToken().subscribe({
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }

    effect(() => {
      const current = this.sessionState();
      if (current) {
        this.saveToStorage(current);
      } else {
        this.removeFromStorage();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(credentials).pipe(
      tap((response) => this.handleLoginResponse(response))
    );
  }

  logout(): Observable<void> {
    const request$ = this.authApi.logout().pipe(
      catchError(() => of({ success: true, message: 'logout' })),
      map(() => void 0)
    );
    this.clearSession();
    return request$.pipe(
      tap(() => this.router.navigate(['/auth']))
    );
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  hasRefreshToken(): boolean {
    return !!this.sessionState()?.refreshToken;
  }

  refreshAccessToken(): Observable<string> {
    const current = this.sessionState();
    if (!current?.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.authApi.refresh({ refreshToken: current.refreshToken }).pipe(
        tap((response) => this.handleRefreshResponse(response)),
        map((response) => response.data.accessToken),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = undefined;
        }),
        shareReplay(1)
      );
    }

    return this.refreshRequest$;
  }

  private handleLoginResponse(response: LoginResponse): void {
    const tokenPair = response.data;
    const expiresAt = Date.now() + tokenPair.expiresIn * 1000;
    const role = decodeRole(tokenPair.accessToken);
    this.setSession({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken ?? null,
      expiresAt,
      role,
      subject: decodeSubject(tokenPair.accessToken)
    });
  }

  private handleRefreshResponse(response: RefreshResponse): void {
    const { accessToken, expiresIn } = response.data;
    const role = decodeRole(accessToken);
    const refreshToken = this.sessionState()?.refreshToken ?? null;
    const updated: AuthSession = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      role,
      subject: decodeSubject(accessToken)
    };
    this.setSession(updated);
  }

  private setSession(session: AuthSession | null): void {
    this.sessionState.set(session);
    this.scheduleRefresh(session?.expiresAt ?? null);
  }

  private scheduleRefresh(expiresAt: number | null): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - REFRESH_MARGIN_MS, 5_000);
    this.refreshTimeoutId = setTimeout(() => {
      this.refreshTimeoutId = null;
      if (this.hasRefreshToken()) {
        this.refreshAccessToken().subscribe({
          error: () => this.clearSession()
        });
      }
    }, delay);
  }

  private clearSession(): void {
    this.sessionState.set(null);
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  private saveToStorage(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }

  private removeFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  private loadFromStorage(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.accessToken) return null;
      return {
        ...parsed,
        subject: parsed.subject ?? null,
        role: parsed.role ?? null
      };
    } catch {
      return null;
    }
  }
}
