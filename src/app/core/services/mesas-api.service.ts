import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { MesaDto } from '../models/mesa.models';
import { ApiListResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class MesasApiService {
  private readonly baseUrl = `${API_BASE_URL}/mesas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiListResponse<MesaDto>> {
    return this.http.get<ApiListResponse<MesaDto>>(this.baseUrl);
  }
}
