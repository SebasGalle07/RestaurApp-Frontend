import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CategoriasApiService } from '../../core/services/categorias-api.service';
import { CategoriaDto } from '../../core/models/categoria.models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent {
  categorias = signal<CategoriaDto[]>([]);
  loading = signal(false);
  selected = signal<CategoriaDto | null>(null);
  error = signal<string | null>(null);

  createForm = this.fb.group({
    nombre: [''],
    descripcion: ['']
  });

  updateForm = this.fb.group({
    nombre: [''],
    descripcion: ['']
  });

  constructor(private fb: FormBuilder, private categoriasApi: CategoriasApiService) {
    this.refrescar();

    effect(() => {
      const cat = this.selected();
      if (cat) {
        this.updateForm.patchValue({
          nombre: cat.nombre,
          descripcion: cat.descripcion ?? ''
        }, { emitEvent: false });
      }
    });
  }

  refrescar(): void {
    this.loading.set(true);
    this.categoriasApi.listar().subscribe({
      next: (res) => {
        this.categorias.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error cargando categorias');
        this.loading.set(false);
      }
    });
  }

  seleccionar(cat: CategoriaDto): void {
    this.selected.set(cat);
  }

  crear(): void {
    const payload = this.createForm.getRawValue();
    if (!payload.nombre?.trim()) return;
    this.loading.set(true);
    this.categoriasApi.crear({
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion ?? undefined
    }).subscribe({
      next: () => {
        this.createForm.reset();
        this.refrescar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo crear la categoria');
        this.loading.set(false);
      }
    });
  }

  actualizar(): void {
    const cat = this.selected();
    if (!cat) return;
    const payload = this.updateForm.getRawValue();
    this.loading.set(true);
    this.categoriasApi.actualizar(cat.id, {
      nombre: payload.nombre?.trim() ?? cat.nombre,
      descripcion: payload.descripcion ?? undefined
    }).subscribe({
      next: () => {
        this.refrescar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar la categoria');
        this.loading.set(false);
      }
    });
  }

  eliminar(cat: CategoriaDto): void {
    if (!confirm(`Eliminar categoria ${cat.nombre}?`)) return;
    this.loading.set(true);
    this.categoriasApi.eliminar(cat.id).subscribe({
      next: () => {
        if (this.selected()?.id === cat.id) {
          this.selected.set(null);
        }
        this.refrescar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo eliminar la categoria');
        this.loading.set(false);
      }
    });
  }
}
