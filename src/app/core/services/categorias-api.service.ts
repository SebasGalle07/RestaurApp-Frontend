import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { CategoriaDto, CategoriaCreateDto, CategoriaUpdateDto } from '../models/categoria.models';
import { ApiListResponse, ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class CategoriasApiService {
  private readonly baseUrl = `${API_BASE_URL}/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiListResponse<CategoriaDto>> {
    return this.http.get<ApiListResponse<CategoriaDto>>(this.baseUrl);
  }

  crear(payload: CategoriaCreateDto): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  detalle(id: number): Observable<ApiResponse<CategoriaDto>> {
    return this.http.get<ApiResponse<CategoriaDto>>(`${this.baseUrl}/${id}`);
  }

  actualizar(id: number, payload: CategoriaUpdateDto): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
