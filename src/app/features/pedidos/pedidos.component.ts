import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PedidosApiService } from '../../core/services/pedidos-api.service';
import { PedidoItemsApiService } from '../../core/services/pedido-items-api.service';
import { MenuApiService } from '../../core/services/menu-api.service';
import { MesasApiService } from '../../core/services/mesas-api.service';
import { PedidoDto, PedidoListDto, PedidoListFilters } from '../../core/models/pedido.models';
import { PedidoItemDto, ItemEstado, PedidoItemCreateDto, PedidoItemPatchDto } from '../../core/models/pedido-item.models';
import { MesaDto } from '../../core/models/mesa.models';
import { MenuDto } from '../../core/models/menu.models';
import { UsersApiService } from '../../core/services/users-api.service';
import { UserDto } from '../../core/models/user.models';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss'
})
export class PedidosComponent implements OnInit {
  filtrosForm = this.fb.group({
    mesa_id: [''],
    estado: [''],
    desde: [''],
    hasta: ['']
  });

  pedidoForm = this.fb.group({
    mesa_id: [''],
    mesero_id: [''],
    notas: [''],
    items: this.fb.array([])
  });

  notaForm = this.fb.group({
    mesero_id: [''],
    notas: ['']
  });

  pedidos = signal<PedidoListDto[]>([]);
  mesas = signal<MesaDto[]>([]);
  menuItems = signal<MenuDto[]>([]);
  meseros = signal<UserDto[]>([]);
  seleccionado = signal<PedidoDto | null>(null);
  itemsSeleccionado = signal<PedidoItemDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  detalleItemsForm = new FormArray<FormGroup>([]);
  nuevoDetalleForm = this.fb.group({
    item_menu_id: [''],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    notas: ['']
  });

  readonly estados: ItemEstado[] = ['PENDIENTE', 'EN_PREPARACION', 'LISTO'];

  constructor(
    private fb: FormBuilder,
    private pedidosApi: PedidosApiService,
    private pedidoItemsApi: PedidoItemsApiService,
    private menuApi: MenuApiService,
    private mesasApi: MesasApiService,
    private usersApi: UsersApiService
  ) {}

  ngOnInit(): void {
    this.cargarMesas();
    this.cargarMenu();
    this.cargarMeseros();
    this.buscar();
    this.agregarItem();
  }

  get itemsArray(): FormArray {
    return this.pedidoForm.get('items') as FormArray;
  }

  get itemForms(): FormGroup[] {
    return this.itemsArray.controls as FormGroup[];
  }

  get detalleFormGroups(): FormGroup[] {
    return this.detalleItemsForm.controls as FormGroup[];
  }

  agregarItem(): void {
    const group = this.fb.group({
      item_menu_id: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      notas: ['']
    });
    this.itemsArray.push(group);
  }

  quitarItem(idx: number): void {
    this.itemsArray.removeAt(idx);
  }

  cargarMesas(): void {
    this.mesasApi.listar().subscribe({ next: (res) => this.mesas.set(res.data) });
  }

  cargarMenu(): void {
    this.menuApi.listar().subscribe({ next: (res) => this.menuItems.set(res.data) });
  }

  cargarMeseros(): void {
    this.usersApi.list({ rol: 'mesero', activo: true }).subscribe({
      next: (res) => this.meseros.set(res.data),
      error: () => this.meseros.set([])
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.getRawValue();
    const query: PedidoListFilters = {
      mesa_id: filtros.mesa_id ? Number(filtros.mesa_id) : undefined,
      estado: filtros.estado ? filtros.estado as any : undefined,
      desde: filtros.desde ?? undefined,
      hasta: filtros.hasta ?? undefined
    };
    this.loading.set(true);
    this.pedidosApi.listar(query).subscribe({
      next: (res) => {
        const visibles = res.data.filter((pedido) => {
          const estado = pedido.estado;
          const allowed = ['ABIERTO', 'EN_PREPARACION', 'LISTO'];
          const pendientePago = (pedido.saldoPendiente ?? 0) > 0;
          return allowed.includes(estado) || pendientePago;
        });
        this.pedidos.set(visibles);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron obtener los pedidos');
        this.loading.set(false);
      }
    });
  }

  crear(): void {
    const payload = this.pedidoForm.getRawValue();
    const mesaId = payload.mesa_id ? Number(payload.mesa_id) : 0;
    const meseroId = payload.mesero_id?.trim() ?? '';
    if (!mesaId || !meseroId) {
      this.error.set('Mesa y mesero son obligatorios');
      return;
    }

    const items: PedidoItemCreateDto[] = this.itemsArray.controls
      .map((ctrl) => ctrl.getRawValue())
      .filter((it) => it.item_menu_id)
      .map((it) => ({
        item_menu_id: Number(it.item_menu_id),
        cantidad: Number(it.cantidad) || 1,
        notas: it.notas?.trim() ? it.notas.trim() : undefined
      }));

    if (!items.length) {
      this.error.set('Debes agregar al menos un item al pedido');
      return;
    }

    this.loading.set(true);
    this.pedidosApi.crear({
      mesa_id: mesaId,
      mesero_id: meseroId,
      notas: payload.notas?.trim() ? payload.notas.trim() : undefined,
      items
    }).subscribe({
      next: () => {
        this.pedidoForm.reset();
        this.itemsArray.clear();
        this.agregarItem();
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo crear el pedido');
        this.loading.set(false);
      }
    });
  }

  seleccionarPedido(pedido: PedidoListDto): void {
    this.loading.set(true);
    this.pedidosApi.detalle(pedido.id).subscribe({
      next: (res) => {
        this.seleccionado.set(res.data);
        this.itemsSeleccionado.set(res.data.items);
        this.buildDetalleForms(res.data.items);
        this.notaForm.patchValue({ mesero_id: res.data.meseroId, notas: res.data.notas ?? '' }, { emitEvent: false });
        this.nuevoDetalleForm.reset({ item_menu_id: '', cantidad: 1, notas: '' });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo obtener el detalle');
        this.loading.set(false);
      }
    });
  }

  actualizarPedido(): void {
    const pedido = this.seleccionado();
    if (!pedido) return;
    const payload = this.notaForm.getRawValue();
    const meseroId = payload.mesero_id?.trim();
    const notas = payload.notas?.trim();
    this.loading.set(true);
    this.pedidosApi.patch(pedido.id, {
      mesero_id: meseroId || undefined,
      notas: notas || undefined
    }).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el pedido');
        this.loading.set(false);
      }
    });
  }

  enviarACocina(): void {
    const pedido = this.seleccionado();
    if (!pedido) return;
    this.loading.set(true);
    this.pedidosApi.enviarACocina(pedido.id).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo enviar a cocina');
        this.loading.set(false);
      }
    });
  }

  marcarListo(): void {
    const pedido = this.seleccionado();
    if (!pedido) return;
    this.loading.set(true);
    this.pedidosApi.marcarListo(pedido.id).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo marcar como listo');
        this.loading.set(false);
      }
    });
  }

  marcarEntregado(): void {
    const pedido = this.seleccionado();
    if (!pedido) return;
    this.loading.set(true);
    this.pedidosApi.marcarEntregado(pedido.id).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo marcar como entregado');
        this.loading.set(false);
      }
    });
  }

  cancelar(): void {
    const pedido = this.seleccionado();
    if (!pedido) return;
    if (!confirm('Cancelar pedido?')) return;
    this.loading.set(true);
    this.pedidosApi.cancelar(pedido.id).subscribe({
      next: () => {
        this.seleccionado.set(null);
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cancelar el pedido');
        this.loading.set(false);
      }
    });
  }

  agregarDetalle(pedido: PedidoDto): void {
    const value = this.nuevoDetalleForm.getRawValue();
    if (!value.item_menu_id) {
      this.error.set('Selecciona un item del menú');
      return;
    }
    const nuevo: PedidoItemCreateDto = {
      item_menu_id: Number(value.item_menu_id),
      cantidad: Number(value.cantidad) || 1,
      notas: value.notas?.trim() ? value.notas.trim() : undefined
    };
    this.loading.set(true);
    this.pedidoItemsApi.crear(pedido.id, nuevo).subscribe({
      next: () => {
        this.nuevoDetalleForm.reset({ item_menu_id: '', cantidad: 1, notas: '' });
        this.seleccionarPedido(pedido);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo agregar el item');
        this.loading.set(false);
      }
    });
  }

  guardarDetalle(pedido: PedidoDto, detalle: PedidoItemDto, index: number): void {
    const form = this.detalleFormGroups[index];
    if (!form) return;
    const value = form.getRawValue();
    const payload: PedidoItemPatchDto = {
      cantidad: Number(value.cantidad) || detalle.cantidad,
      notas: value.notas?.trim() ? value.notas.trim() : undefined
    };
    this.loading.set(true);
    this.pedidoItemsApi.patch(pedido.id, detalle.id, payload).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el item');
        this.loading.set(false);
      }
    });
  }

  actualizarEstado(pedido: PedidoDto, detalle: PedidoItemDto, index: number): void {
    const form = this.detalleFormGroups[index];
    if (!form) return;
    const estado = form.get('estado')?.value as ItemEstado;
    if (!estado || !this.estados.includes(estado)) return;
    this.loading.set(true);
    this.pedidoItemsApi.actualizarEstado(pedido.id, detalle.id, { estado_preparacion: estado }).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el estado');
        this.loading.set(false);
      }
    });
  }

  eliminarDetalle(pedido: PedidoDto, detalle: PedidoItemDto): void {
    if (!confirm('Eliminar item del pedido?')) return;
    this.loading.set(true);
    this.pedidoItemsApi.eliminar(pedido.id, detalle.id).subscribe({
      next: () => this.seleccionarPedido(pedido),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el item');
        this.loading.set(false);
      }
    });
  }

  private buildDetalleForms(items: PedidoItemDto[]): void {
    this.detalleItemsForm.clear();
    items.forEach((item) => {
      const group = this.fb.group({
        cantidad: [item.cantidad, [Validators.required, Validators.min(1)]],
        notas: [item.notas ?? ''],
        estado: [item.estadoPreparacion, Validators.required]
      });
      this.detalleItemsForm.push(group);
    });
  }
}

