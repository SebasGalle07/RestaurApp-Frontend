import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response';
import { PagosResponseDto, PagoCreateDto } from '../models/pago.models';

@Injectable({ providedIn: 'root' })
export class PagosApiService {
  constructor(private http: HttpClient) {}

  private url(pedidoId: number, suffix = ''): string {
    return `${API_BASE_URL}/pedidos/${pedidoId}/pagos${suffix}`;
  }

  listar(pedidoId: number): Observable<ApiResponse<PagosResponseDto>> {
    return this.http.get<ApiResponse<PagosResponseDto>>(this.url(pedidoId));
  }

  crear(pedidoId: number, payload: PagoCreateDto): Observable<ApiResponse<{ id: number; cambio: number }>> {
    return this.http.post<ApiResponse<{ id: number; cambio: number }>>(this.url(pedidoId), payload);
  }

  anular(pedidoId: number, pagoId: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(this.url(pedidoId, `/${pagoId}`));
  }
}
