import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { FacturasApiService } from '../../core/services/facturas-api.service';
import { FacturaDto, FacturaListDto } from '../../core/models/factura.models';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent {
  emitirForm = this.fb.group({ pedidoId: [''] });
  filtrosForm = this.fb.group({
    mesa_id: [''],
    mesero_id: [''],
    desde: [''],
    hasta: [''],
    sort: ['fechaEmision,desc']
  });

  facturas = signal<FacturaListDto[]>([]);
  detalle = signal<FacturaDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private fb: FormBuilder, private facturasApi: FacturasApiService) {
    this.listar();
  }

  emitir(): void {
    const pedidoId = Number(this.emitirForm.value.pedidoId);
    if (!pedidoId) {
      this.error.set('Indica un pedido valido');
      return;
    }
    this.loading.set(true);
    this.facturasApi.emitir(pedidoId).subscribe({
      next: () => {
        this.emitirForm.reset();
        this.listar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo emitir la factura');
        this.loading.set(false);
      }
    });
  }

  listar(): void {
    const filtros = this.filtrosForm.getRawValue();
    this.loading.set(true);
    this.facturasApi.listar({
      mesa_id: filtros.mesa_id ? Number(filtros.mesa_id) : undefined,
      mesero_id: filtros.mesero_id ?? undefined,
      desde: filtros.desde ?? undefined,
      hasta: filtros.hasta ?? undefined,
      sort: filtros.sort ?? undefined
    }).subscribe({
      next: (res) => {
        this.facturas.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron obtener las facturas');
        this.loading.set(false);
      }
    });
  }

  verDetalle(id: number): void {
    this.loading.set(true);
    this.facturasApi.detalle(id).subscribe({
      next: (res) => {
        this.detalle.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar el detalle');
        this.loading.set(false);
      }
    });
  }
}
