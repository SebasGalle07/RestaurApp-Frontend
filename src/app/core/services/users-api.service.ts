import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response';
import { UserDto, CreateUserDto, UpdateUserDto } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  list(filters: { rol?: string | null; activo?: boolean | null } = {}): Observable<ApiResponse<UserDto[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ApiResponse<UserDto[]>>(this.baseUrl, { params });
  }

  detail(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`);
  }

  detailByCodigo(codigo: number): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/codigo/${codigo}`);
  }

  create(payload: CreateUserDto): Observable<ApiResponse<{ id: string; codigo: number }>> {
    return this.http.post<ApiResponse<{ id: string; codigo: number }>>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateUserDto): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
