import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { UsersApiService } from '../../core/services/users-api.service';
import { UserDto, CreateUserDto, UpdateUserDto, UserRole } from '../../core/models/user.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {
  filtrosForm = this.fb.group({
    rol: [''],
    activo: ['']
  });

  crearForm = this.fb.group({
    nombre: [''],
    email: [''],
    password: [''],
    rol: ['admin' as UserRole],
    activo: [true]
  });

  editarForm = this.fb.group({
    nombre: [''],
    email: [''],
    password: [''],
    rol: ['admin' as UserRole],
    activo: [true]
  });

  usuarios = signal<UserDto[]>([]);
  seleccionado = signal<UserDto | null>(null);
  detalleCodigo = signal<UserDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  roles: UserRole[] = ['admin', 'mesero', 'cocinero', 'cajero'];

  constructor(private fb: FormBuilder, private usersApi: UsersApiService) {
    this.buscar();

    effect(() => {
      const user = this.seleccionado();
      if (user) {
        this.editarForm.patchValue({
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          activo: user.activo,
          password: ''
        }, { emitEvent: false });
      }
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.getRawValue();
    this.loading.set(true);
    this.usersApi.list({
      rol: filtros.rol || undefined,
      activo: filtros.activo === '' ? undefined : filtros.activo === 'true'
    }).subscribe({
      next: (res) => {
        this.usuarios.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron obtener los usuarios');
        this.loading.set(false);
      }
    });
  }

  crear(): void {
    const payload = this.crearForm.getRawValue();
    if (!payload.nombre?.trim() || !payload.email?.trim() || !payload.password) {
      this.error.set('Nombre, email y password son obligatorios');
      return;
    }
    const dto: CreateUserDto = {
      nombre: payload.nombre.trim(),
      email: payload.email.trim(),
      password: payload.password,
      rol: payload.rol ?? 'mesero',
      activo: payload.activo ?? true
    };
    this.loading.set(true);
    this.usersApi.create(dto).subscribe({
      next: () => {
        this.crearForm.reset({ rol: 'admin', activo: true });
        this.buscar();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo crear el usuario');
        this.loading.set(false);
      }
    });
  }

  seleccionar(user: UserDto): void {
    this.seleccionado.set(user);
  }

  actualizar(): void {
    const user = this.seleccionado();
    if (!user) return;
    const payload = this.editarForm.getRawValue();
    const dto: UpdateUserDto = {
      nombre: payload.nombre?.trim(),
      email: payload.email?.trim(),
      password: payload.password ?? undefined,
      rol: payload.rol ?? undefined,
      activo: payload.activo ?? undefined
    };
    this.loading.set(true);
    this.usersApi.update(user.id, dto).subscribe({
      next: () => this.buscar(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo actualizar el usuario');
        this.loading.set(false);
      }
    });
  }

  eliminar(user: UserDto): void {
    if (!confirm('Desactivar usuario? Se marcara como inactivo.')) return;
    this.loading.set(true);
    this.usersApi.delete(user.id).subscribe({
      next: () => this.buscar(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo eliminar el usuario');
        this.loading.set(false);
      }
    });
  }

  buscarPorCodigo(valor: string): void {
    const codigo = Number(valor);
    if (!codigo) {
      this.detalleCodigo.set(null);
      return;
    }
    this.usersApi.detailByCodigo(codigo).subscribe({
      next: (res) => this.detalleCodigo.set(res.data),
      error: () => this.detalleCodigo.set(null)
    });
  }
}
