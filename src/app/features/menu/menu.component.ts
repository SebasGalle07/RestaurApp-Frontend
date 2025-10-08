import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MenuApiService } from '../../core/services/menu-api.service';
import { CategoriasApiService } from '../../core/services/categorias-api.service';
import { MenuDto, MenuCreateDto, MenuPatchDto } from '../../core/models/menu.models';
import { CategoriaDto } from '../../core/models/categoria.models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  filtrosForm = this.fb.group({
    categoria_id: [''],
    activo: [''],
    q: ['']
  });

  crearForm = this.fb.group({
    nombre: [''],
    descripcion: [''],
    precio: [0],
    categoria_id: [''],
    activo: [true]
  });

  patchForm = this.fb.group({
    nombre: [''],
    descripcion: [''],
    precio: [0],
    categoria_id: [''],
    activo: [true]
  });

  items = signal<MenuDto[]>([]);
  categorias = signal<CategoriaDto[]>([]);
  selected = signal<MenuDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private fb: FormBuilder, private menuApi: MenuApiService, private categoriasApi: CategoriasApiService) {
    this.cargarCategorias();
    this.buscar();

    effect(() => {
      const item = this.selected();
      if (item) {
        this.patchForm.patchValue({
          nombre: item.nombre,
          descripcion: item.descripcion ?? '',
          precio: item.precio,
          categoria_id: item.categoriaId.toString(),
          activo: item.activo
        }, { emitEvent: false });
      }
    });
  }

  cargarCategorias(): void {
    this.categoriasApi.listar().subscribe({
      next: (res) => this.categorias.set(res.data)
    });
  }

  buscar(): void {
    const filters = this.filtrosForm.getRawValue();
    this.loading.set(true);
    this.menuApi.listar({
      categoria_id: filters.categoria_id ? Number(filters.categoria_id) : undefined,
      activo: filters.activo === '' ? undefined : filters.activo === 'true',
      q: filters.q ?? undefined
    }).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo obtener el menu');
        this.loading.set(false);
      }
    });
  }

  crear(): void {
    const payload = this.crearForm.getRawValue();
    if (!payload.nombre?.trim() || !payload.categoria_id) {
      this.error.set('Nombre y categoria son requeridos');
      return;
    }
    const dto: MenuCreateDto = {
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion ?? undefined,
      precio: Number(payload.precio) || 0,
      categoria_id: Number(payload.categoria_id),
      activo: payload.activo ?? true
    };
    this.loading.set(true);
    this.menuApi.crear(dto).subscribe({
      next: () => {
        this.crearForm.reset({ activo: true, precio: 0 });
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo crear el item');
        this.loading.set(false);
      }
    });
  }

  seleccionar(item: MenuDto): void {
    this.selected.set(item);
  }

  guardarCambios(): void {
    const item = this.selected();
    if (!item) return;

    const payload = this.patchForm.getRawValue();
    const dto: MenuPatchDto = {
      nombre: payload.nombre?.trim(),
      descripcion: payload.descripcion ?? undefined,
      precio: payload.precio === null ? undefined : Number(payload.precio),
      categoria_id: payload.categoria_id ? Number(payload.categoria_id) : undefined,
      activo: payload.activo ?? undefined
    };

    this.loading.set(true);
    this.menuApi.patch(item.id, dto).subscribe({
      next: () => {
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el item');
        this.loading.set(false);
      }
    });
  }

  eliminar(item: MenuDto): void {
    if (!confirm(`Eliminar ${item.nombre}?`)) return;
    this.loading.set(true);
    this.menuApi.eliminar(item.id).subscribe({
      next: () => {
        if (this.selected()?.id === item.id) {
          this.selected.set(null);
        }
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el item');
        this.loading.set(false);
      }
    });
  }
}
