import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response';
import { PedidoItemDto, PedidoItemCreateDto, PedidoItemPatchDto, ItemEstadoPatchDto } from '../models/pedido-item.models';

@Injectable({ providedIn: 'root' })
export class PedidoItemsApiService {
  constructor(private http: HttpClient) {}

  private url(pedidoId: number, suffix = ''): string {
    return `${API_BASE_URL}/pedidos/${pedidoId}/items${suffix}`;
  }

  listar(pedidoId: number): Observable<ApiResponse<PedidoItemDto[]>> {
    return this.http.get<ApiResponse<PedidoItemDto[]>>(this.url(pedidoId));
  }

  crear(pedidoId: number, payload: PedidoItemCreateDto): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.url(pedidoId), payload);
  }

  detalle(pedidoId: number, detalleId: number): Observable<ApiResponse<PedidoItemDto>> {
    return this.http.get<ApiResponse<PedidoItemDto>>(this.url(pedidoId, `/${detalleId}`));
  }

  patch(pedidoId: number, detalleId: number, payload: PedidoItemPatchDto): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(this.url(pedidoId, `/${detalleId}`), payload);
  }

  eliminar(pedidoId: number, detalleId: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(this.url(pedidoId, `/${detalleId}`));
  }

  actualizarEstado(pedidoId: number, detalleId: number, payload: ItemEstadoPatchDto): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(this.url(pedidoId, `/${detalleId}/estado`), payload);
  }
}
