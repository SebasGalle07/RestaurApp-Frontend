import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { MenuDto, MenuCreateDto, MenuPatchDto } from '../models/menu.models';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly baseUrl = `${API_BASE_URL}/menu`;

  constructor(private http: HttpClient) {}

  listar(filters: { categoria_id?: number | null; activo?: boolean | null; q?: string | null; page?: number; size?: number; sort?: string; } = {}): Observable<ApiResponse<MenuDto[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ApiResponse<MenuDto[]>>(this.baseUrl, { params });
  }

  crear(payload: MenuCreateDto): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  detalle(id: number): Observable<ApiResponse<MenuDto>> {
    return this.http.get<ApiResponse<MenuDto>>(`${this.baseUrl}/${id}`);
  }

  patch(id: number, payload: MenuPatchDto): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
