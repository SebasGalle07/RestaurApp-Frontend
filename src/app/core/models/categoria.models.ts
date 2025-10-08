export interface CategoriaDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaCreateDto {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaUpdateDto {
  nombre: string;
  descripcion?: string | null;
}
