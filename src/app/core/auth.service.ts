import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(username: string, password: string) {
    return this.http.post<{ accessToken: string }>(
      `${environment.apiUrl}/auth/login`, { username, password }
    ).pipe(tap(r => localStorage.setItem('access_token', r.accessToken)));
  }

  logout() { localStorage.removeItem('access_token'); }
  isLoggedIn() { return !!localStorage.getItem('access_token'); }
}
