import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response';
import { PedidoCreateDto, PedidoDto, PedidoListDto, PedidoListFilters, PedidoPatchDto } from '../models/pedido.models';

@Injectable({ providedIn: 'root' })
export class PedidosApiService {
  private readonly baseUrl = `${API_BASE_URL}/pedidos`;

  constructor(private http: HttpClient) {}

  listar(filters: PedidoListFilters = {}): Observable<ApiResponse<PedidoListDto[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ApiResponse<PedidoListDto[]>>(this.baseUrl, { params });
  }

  crear(payload: PedidoCreateDto): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  detalle(id: number): Observable<ApiResponse<PedidoDto>> {
    return this.http.get<ApiResponse<PedidoDto>>(`${this.baseUrl}/${id}`);
  }

  patch(id: number, payload: PedidoPatchDto): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, payload);
  }

  enviarACocina(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}/enviar-a-cocina`, {});
  }

  marcarListo(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}/marcar-listo`, {});
  }

  marcarEntregado(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}/marcar-entregado`, {});
  }

  cancelar(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}
