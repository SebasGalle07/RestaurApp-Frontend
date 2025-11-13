import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PagosApiService } from '../../core/services/pagos-api.service';
import { PagosResponseDto, PagoDto } from '../../core/models/pago.models';
import { PedidosApiService } from '../../core/services/pedidos-api.service';
import { PedidoListDto } from '../../core/models/pedido.models';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss'
})
export class PagosComponent implements OnInit {
  pedidoIdForm = this.fb.group({ pedidoId: [''] });
  pagoForm = this.fb.group({
    monto: [0],
    metodo: ['EFECTIVO']
  });

  pagosInfo = signal<PagosResponseDto | null>(null);
  pendientes = signal<PedidoListDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private pagosApi: PagosApiService,
    private pedidosApi: PedidosApiService
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargar(): void {
    const pedidoId = Number(this.pedidoIdForm.value.pedidoId);
    if (!pedidoId) {
      this.error.set('Debes indicar un ID de pedido');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.pagosApi.listar(pedidoId).subscribe({
      next: (res) => {
        this.pagosInfo.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron cargar los pagos');
        this.loading.set(false);
      }
    });
  }

  seleccionarPedido(pedido: PedidoListDto): void {
    this.pedidoIdForm.patchValue({ pedidoId: String(pedido.id) });
    this.cargar();
  }

  cargarPendientes(): void {
    this.pedidosApi.listar({ size: 200, sort: 'updatedAt,desc' }).subscribe({
      next: (res) => {
        const conSaldo = res.data.filter(
          (p) => p.saldoPendiente > 0 && p.estado !== 'CANCELADO' && p.estado !== 'CERRADO'
        );
        this.pendientes.set(conSaldo);
      },
      error: () => this.pendientes.set([])
    });
  }

  registrar(): void {
    const pedidoId = Number(this.pedidoIdForm.value.pedidoId);
    if (!pedidoId) {
      this.error.set('Selecciona un pedido');
      return;
    }
    const payload = this.pagoForm.getRawValue();
    this.loading.set(true);
    this.pagosApi.crear(pedidoId, {
      monto: Number(payload.monto) || 0,
      metodo: payload.metodo ?? 'EFECTIVO'
    }).subscribe({
      next: () => {
        this.cargar();
        this.pagoForm.reset({ monto: 0, metodo: 'EFECTIVO' });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo registrar el pago');
        this.loading.set(false);
      }
    });
  }

  anular(pago: PagoDto): void {
    const pedidoId = Number(this.pedidoIdForm.value.pedidoId);
    if (!pedidoId) return;
    if (!confirm('Anular pago?')) return;
    this.loading.set(true);
    this.pagosApi.anular(pedidoId, pago.id).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo anular el pago');
        this.loading.set(false);
      }
    });
  }
}
