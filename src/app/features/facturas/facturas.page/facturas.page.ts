import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService, FacturaListDto, PageResponse } from '../facturas.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1 class="page-title">Facturas</h1>
        <button class="btn btn-primary" type="button" (click)="limpiarFiltros()" [disabled]="loading">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          Nueva Factura
        </button>
      </header>

      <!-- FILTROS -->
      <div class="card filter-card">
        <form (ngSubmit)="buscar(0)" class="filter-form">
          <div class="form-group">
            <label for="mesaId">Mesa ID</label>
            <input id="mesaId" class="input" [(ngModel)]="mesaIdRaw" name="mesa_id" placeholder="Ej: 12">
          </div>
          <div class="form-group">
            <label for="meseroId">Mesero UUID</label>
            <input id="meseroId" class="input" [(ngModel)]="meseroId" name="mesero_id" placeholder="Ej: ...">
          </div>
          <div class="form-group">
            <label for="desde">Desde</label>
            <input id="desde" class="input" type="datetime-local" [(ngModel)]="desdeRaw" name="desde">
          </div>
          <div class="form-group">
            <label for="hasta">Hasta</label>
            <input id="hasta" class="input" type="datetime-local" [(ngModel)]="hastaRaw" name="hasta">
          </div>
          <div class="filter-actions">
            <button type="button" class="btn btn-secondary" (click)="limpiarFiltros()" [disabled]="loading">Limpiar</button>
            <button class="btn btn-primary" [disabled]="loading">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" /></svg>
              Buscar
            </button>
          </div>
        </form>
      </div>

      <!-- RESULTADOS -->
      <div class="card results-card">
        <!-- Cargando -->
        <div *ngIf="loading" class="state-overlay">
          <div class="spinner"></div>
          <p>Cargando facturas...</p>
        </div>

        <!-- Error -->
        <div *ngIf="!loading && error" class="state-overlay error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
          <h3>Error al cargar</h3>
          <p>{{ error }}</p>
          <button class="btn btn-secondary" type="button" (click)="buscar(0)">Reintentar</button>
        </div>

        <!-- Tabla -->
        <div *ngIf="!loading && !error">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Mesa</th>
                  <th>Total</th>
                  <th>Fecha de Emisión</th>
                  <th>Mesero</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of (data?.content ?? [])">
                  <td><span class="chip chip-blue">{{ f.numero }}</span></td>
                  <td>Mesa {{ f.mesaNumero }}</td>
                  <td>{{ f.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ f.fechaEmision | date:'dd/MM/yyyy, h:mm a' }}</td>
                  <td>{{ f.meseroNombre || f.meseroId || 'N/A' }}</td>
                </tr>

                <!-- Vacío -->
                <tr *ngIf="!data?.content?.length">
                  <td colspan="5" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h11.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2H4.25ZM2 11.75A2.25 2.25 0 0 1 4.25 9.5h11.5A2.25 2.25 0 0 1 18 11.75v2.5A2.25 2.25 0 0 1 15.75 18H4.25A2.25 2.25 0 0 1 2 15.75v-4Z" clip-rule="evenodd" /></svg>
                    <p>No se encontraron facturas con los filtros aplicados.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div *ngIf="(data?.totalPages ?? 1) > 1" class="pagination">
            <button class="btn-icon" type="button"
                    (click)="buscar(Math.max((data?.number ?? 0) - 1, 0))"
                    [disabled]="data?.first">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
            </button>

            <span>Página {{ (data?.number ?? 0) + 1 }} de {{ data?.totalPages ?? 1 }}</span>

            <button class="btn-icon" type="button"
                    (click)="buscar(Math.min((data?.number ?? 0) + 1, (data?.totalPages ?? 1) - 1))"
                    [disabled]="data?.last">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [/* (deja tus estilos tal cual) */]
})
export class FacturasPage implements OnInit {
  private svc = inject(FacturasService);
  Math = Math;

  // filtros
  mesaIdRaw = '';
  meseroId = '';
  desdeRaw = '';
  hastaRaw = '';

  // estado
  data?: PageResponse<FacturaListDto>;
  loading = true;
  error = '';

  ngOnInit() { this.buscar(); }

  buscar(page = 0) {
    this.loading = true;
    this.error = '';

    const params: any = { page, size: 10, sort: 'fechaEmision,desc' };

    const mesaNum = Number(this.mesaIdRaw);
    if (!Number.isNaN(mesaNum) && this.mesaIdRaw.trim() !== '') params.mesa_id = mesaNum;
    if (this.meseroId && this.meseroId.trim() !== '') params.mesero_id = this.meseroId.trim();
    if (this.desdeRaw) params.desde = new Date(this.desdeRaw).toISOString();
    if (this.hastaRaw) params.hasta = new Date(this.hastaRaw).toISOString();

    this.svc.listar(params).subscribe({
      next: (r: PageResponse<FacturaListDto>) => { this.data = r; this.loading = false; },
      error: (e: any) => { this.error = e?.error?.message ?? 'Ocurrió un error inesperado al cargar las facturas.'; this.loading = false; }
    });
  }

  limpiarFiltros() {
    this.mesaIdRaw = '';
    this.meseroId = '';
    this.desdeRaw = '';
    this.hastaRaw = '';
    this.buscar(0);
  }
}
