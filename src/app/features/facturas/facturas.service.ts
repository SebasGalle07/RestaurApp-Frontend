import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private http = inject(HttpClient);

  listar(params: any): Observable<PageResponse<FacturaListDto>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<PageResponse<FacturaListDto>>('/api/facturas', { params: httpParams });
  }
}

export interface FacturaListDto {
  id: number; numero: string; pedidoId: number;
  mesaId: number; mesaNumero: number;
  meseroId?: string;               // opcional
  meseroNombre?: string;           // opcional (si no viene, usamos meseroId/N/A)
  total: number; fechaEmision: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;   // <-- añadido
  number?: number;       // página actual (0-based)
  size?: number;
  first?: boolean;       // <-- añadido
  last?: boolean;        // <-- añadido
}
