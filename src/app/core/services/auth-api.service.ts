import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload);
  }

  refresh(payload: RefreshRequest): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.baseUrl}/refresh`, payload);
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/logout`, {});
  }
}
