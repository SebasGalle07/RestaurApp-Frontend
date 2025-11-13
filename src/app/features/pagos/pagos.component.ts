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
  pagoForm = this.fb.group({
    monto: [0],
    metodo: ['EFECTIVO']
  });

  pagosInfo = signal<PagosResponseDto | null>(null);
  pendientes = signal<PedidoListDto[]>([]);
  seleccionado = signal<PedidoListDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  cambioInfo = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private pagosApi: PagosApiService,
    private pedidosApi: PedidosApiService
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  private obtenerPedidoId(): number | null {
    return this.seleccionado()?.id ?? null;
  }

  cargar(): void {
    const pedidoId = this.obtenerPedidoId();
    if (!pedidoId) {
      this.error.set('Selecciona un pedido de la lista.');
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
    this.seleccionado.set(pedido);
    this.cambioInfo.set(null);
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
    const pedidoId = this.obtenerPedidoId();
    if (!pedidoId) {
      this.error.set('Selecciona un pedido');
      return;
    }
    const payload = this.pagoForm.getRawValue();
    this.loading.set(true);
    this.cambioInfo.set(null);
    this.pagosApi.crear(pedidoId, {
      monto: Number(payload.monto) || 0,
      metodo: payload.metodo ?? 'EFECTIVO'
    }).subscribe({
      next: (res) => {
        this.cargar();
        this.pagoForm.reset({ monto: 0, metodo: 'EFECTIVO' });
        const cambio = res.data.cambio ?? 0;
        if (cambio > 0) {
          this.cambioInfo.set(`Cambio a entregar: ${this.formatearMoneda(cambio)}`);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo registrar el pago');
        this.loading.set(false);
      }
    });
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  anular(pago: PagoDto): void {
    const pedidoId = this.obtenerPedidoId();
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
