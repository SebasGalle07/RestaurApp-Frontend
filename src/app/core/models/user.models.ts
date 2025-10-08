export type UserRole = 'admin' | 'mesero' | 'cocinero' | 'cajero';

export interface UserDto {
  id: string;
  codigo: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  activo?: boolean;
}

export interface UpdateUserDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: UserRole;
  activo?: boolean;
}
