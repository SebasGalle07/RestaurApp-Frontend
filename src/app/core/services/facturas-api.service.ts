import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response';
import { FacturaDto, FacturaListDto, FacturaListFilters } from '../models/factura.models';

@Injectable({ providedIn: 'root' })
export class FacturasApiService {
  private readonly baseUrl = `${API_BASE_URL}/facturas`;

  constructor(private http: HttpClient) {}

  emitir(pedidoId: number): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${API_BASE_URL}/pedidos/${pedidoId}/factura`, {});
  }

  listar(filters: FacturaListFilters = {}): Observable<ApiResponse<FacturaListDto[]>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ApiResponse<FacturaListDto[]>>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<ApiResponse<FacturaDto>> {
    return this.http.get<ApiResponse<FacturaDto>>(`${this.baseUrl}/${id}`);
  }
}
