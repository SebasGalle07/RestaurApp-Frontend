import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';

import { MenuApiService } from '../../core/services/menu-api.service';
import { CategoriasApiService } from '../../core/services/categorias-api.service';
import { MesasApiService } from '../../core/services/mesas-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
import { PedidosApiService } from '../../core/services/pedidos-api.service';
import { MenuDto } from '../../core/models/menu.models';
import { CategoriaDto } from '../../core/models/categoria.models';
import { MesaDto } from '../../core/models/mesa.models';
import { UserDto } from '../../core/models/user.models';
import { PedidoCreateDto, PedidoDto } from '../../core/models/pedido.models';
import { PedidoItemCreateDto } from '../../core/models/pedido-item.models';

type PosStep = 'menu' | 'details' | 'invoice' | 'confirmation';

interface CartItem {
  menu: MenuDto;
  quantity: number;
  notes?: string | null;
}

interface Feedback {
  type: 'success' | 'error' | 'info';
  message: string;
}

const CATEGORY_ICONS = ['🍽️', '🥗', '🍣', '🍝', '🥘', '🍕', '🍹', '🍮'];

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  readonly categorias = signal<CategoriaDto[]>([]);
  readonly menuItems = signal<MenuDto[]>([]);
  readonly mesas = signal<MesaDto[]>([]);
  readonly meseros = signal<UserDto[]>([]);

  readonly selectedCategory = signal<number | 'all'>('all');
  readonly searchTerm = signal('');
  readonly cart = signal<CartItem[]>([]);
  readonly step = signal<PosStep>('menu');
  readonly loading = signal(false);
  readonly feedback = signal<Feedback | null>(null);
  readonly pedidoResumen = signal<PedidoDto | null>(null);

  readonly filteredMenu = computed(() => {
    const items = this.menuItems();
    const category = this.selectedCategory();
    const search = this.searchTerm().trim().toLowerCase();

    return items
      .filter((item) => category === 'all' || item.categoriaId === category)
      .filter((item) => {
        if (!search) return true;
        const haystack = `${item.nombre} ${item.descripcion ?? ''}`.toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => (a.activo === b.activo ? 0 : a.activo ? -1 : 1));
  });

  readonly cartCount = computed(() =>
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly cartTotal = computed(() =>
    this.cart()
      .reduce((acc, item) => acc + Number(item.menu.precio) * item.quantity, 0)
  );

  readonly checkoutAllowed = computed(() => this.cartCount() > 0 && !this.loading());

  readonly categoryChips = computed(() => {
    const chips: Array<{ id: number | 'all'; label: string; icon: string }> = [
      { id: 'all', label: 'Todo', icon: '🔥' }
    ];
    this.categorias().forEach((categoria, index) => {
      chips.push({
        id: categoria.id,
        label: categoria.nombre,
        icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length]
      });
    });
    return chips;
  });

  readonly detailsForm = this.fb.group({
    mesaId: ['', Validators.required],
    meseroId: ['', Validators.required],
    cliente: [''],
    notas: [''],
    procesarFactura: [false]
  });

  readonly invoiceForm = this.fb.group({
    necesitaFactura: [false],
    nombreCliente: [''],
    email: ['', Validators.email],
    telefono: [''],
    empresa: [''],
    taxId: [''],
    direccion: [''],
    notasAdicionales: ['']
  });

  constructor(
    private fb: FormBuilder,
    private menuApi: MenuApiService,
    private categoriasApi: CategoriasApiService,
    private mesasApi: MesasApiService,
    private usersApi: UsersApiService,
    private pedidosApi: PedidosApiService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  seleccionarCategoria(id: number | 'all'): void {
    this.selectedCategory.set(id);
  }

  actualizarBusqueda(term: string): void {
    this.searchTerm.set(term);
  }

  addToCart(menu: MenuDto): void {
    if (!menu.activo) {
      this.feedback.set({ type: 'info', message: `${menu.nombre} está marcado como no disponible.` });
      return;
    }
    this.cart.update((items) => {
      const existing = items.find((item) => item.menu.id === menu.id);
      if (existing) {
        return items.map((item) =>
          item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { menu, quantity: 1 }];
    });
  }

  removeFromCart(menuId: number): void {
    this.cart.update((items) => items.filter((item) => item.menu.id !== menuId));
  }

  decreaseQuantity(menuId: number): void {
    this.cart.update((items) =>
      items
        .map((item) =>
          item.menu.id === menuId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  increaseQuantity(menuId: number): void {
    this.cart.update((items) =>
      items.map((item) =>
        item.menu.id === menuId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  actualizarNotas(menuId: number, notes: string): void {
    this.cart.update((items) =>
      items.map((item) =>
        item.menu.id === menuId ? { ...item, notes } : item
      )
    );
  }

  goToDetails(): void {
    if (!this.checkoutAllowed()) {
      this.feedback.set({ type: 'info', message: 'Añade artículos al carrito antes de continuar.' });
      return;
    }

    if (!this.detailsForm.value.meseroId && this.meseros().length > 0) {
      this.detailsForm.patchValue({ meseroId: this.meseros()[0].id });
    }

    if (!this.detailsForm.value.mesaId && this.mesas().length > 0) {
      this.detailsForm.patchValue({ mesaId: String(this.mesas()[0].id) });
    }

    this.step.set('details');
  }

  backToMenu(): void {
    this.step.set('menu');
  }

  proceedToInvoice(): void {
    if (!this.detailsForm.valid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    if (this.detailsForm.value.procesarFactura) {
      this.step.set('invoice');
      return;
    }

    this.submitOrder();
  }

  backToDetails(): void {
    this.step.set('details');
  }

  submitOrder(): void {
    if (this.cartCount() === 0) {
      this.feedback.set({ type: 'info', message: 'El carrito está vacío.' });
      return;
    }

    if (!this.detailsForm.valid) {
      this.detailsForm.markAllAsTouched();
      this.feedback.set({ type: 'error', message: 'Completa los datos obligatorios del pedido.' });
      return;
    }

    const { mesaId, meseroId, notas, cliente, procesarFactura } = this.detailsForm.getRawValue();
    const invoiceData = this.invoiceForm.getRawValue();

    const payload: PedidoCreateDto = {
      mesa_id: Number(mesaId),
      mesero_id: meseroId!,
      notas: this.composeNotes(notas ?? '', cliente ?? '', procesarFactura ?? false, invoiceData),
      items: this.cart().map<PedidoItemCreateDto>((item) => ({
        item_menu_id: item.menu.id,
        cantidad: item.quantity,
        notas: item.notes && item.notes.trim().length > 0 ? item.notes.trim() : undefined
      }))
    };

    this.loading.set(true);
    this.feedback.set(null);

    this.pedidosApi.crear(payload).pipe(
      switchMap((res) => {
        const pedidoId = res.data.id;
        return this.pedidosApi.enviarACocina(pedidoId).pipe(
          catchError(() => of(null)),
          switchMap(() => this.pedidosApi.detalle(pedidoId)),
          tap((detalle) => this.pedidoResumen.set(detalle.data))
        );
      }),
      catchError((error) => {
        const message = error?.error?.message ?? 'No fue posible crear el pedido.';
        this.feedback.set({ type: 'error', message });
        this.loading.set(false);
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.cart.set([]);
        this.step.set('confirmation');
        this.feedback.set({ type: 'success', message: '¡Pedido enviado a cocina!' });
      }
    });
  }

  resetFlow(): void {
    this.cart.set([]);
    this.detailsForm.reset({
      mesaId: '',
      meseroId: '',
      cliente: '',
      notas: '',
      procesarFactura: false
    });
    this.invoiceForm.reset({
      necesitaFactura: false,
      nombreCliente: '',
      email: '',
      telefono: '',
      empresa: '',
      taxId: '',
      direccion: '',
      notasAdicionales: ''
    });
    this.pedidoResumen.set(null);
    this.feedback.set(null);
    this.step.set('menu');
  }

  mesaDisplay(pedido: PedidoDto): string {
    const mesa = this.mesas().find((m) => m.id === pedido.mesaId);
    return mesa?.numero ?? pedido.mesaNumero ?? `Mesa ${pedido.mesaId}`;
  }

  private cargarCatalogos(): void {
    this.categoriasApi.listar().subscribe({
      next: (res) => this.categorias.set(res.data),
      error: () => this.categorias.set([])
    });

    this.menuApi.listar({ size: 200, sort: 'nombre,asc' }).subscribe({
      next: (res) => this.menuItems.set(res.data),
      error: () => this.menuItems.set([])
    });

    this.mesasApi.listar().subscribe({
      next: (res) => this.mesas.set(res.data),
      error: () => this.mesas.set([])
    });

    this.usersApi.list({ rol: 'mesero', activo: true }).subscribe({
      next: (res) => this.meseros.set(res.data),
      error: () => this.meseros.set([])
    });
  }

  private composeNotes(
    baseNotes: string,
    cliente: string,
    procesarFactura: boolean,
    invoice: typeof this.invoiceForm.value
  ): string | undefined {
    const notes: string[] = [];

    if (baseNotes?.trim()) {
      notes.push(baseNotes.trim());
    }

    if (cliente?.trim()) {
      notes.push(`Cliente: ${cliente.trim()}`);
    }

    if (procesarFactura && invoice?.necesitaFactura) {
      notes.push('Solicitud de factura:');
      if (invoice.nombreCliente?.trim()) notes.push(`- Nombre: ${invoice.nombreCliente.trim()}`);
      if (invoice.email?.trim()) notes.push(`- Email: ${invoice.email.trim()}`);
      if (invoice.telefono?.trim()) notes.push(`- Teléfono: ${invoice.telefono.trim()}`);
      if (invoice.empresa?.trim()) notes.push(`- Empresa: ${invoice.empresa.trim()}`);
      if (invoice.taxId?.trim()) notes.push(`- NIF/CIF: ${invoice.taxId.trim()}`);
      if (invoice.direccion?.trim()) notes.push(`- Dirección: ${invoice.direccion.trim()}`);
      if (invoice.notasAdicionales?.trim()) {
        notes.push(`- Notas: ${invoice.notasAdicionales.trim()}`);
      }
    }

    return notes.length > 0 ? notes.join('\n') : undefined;
  }
}
