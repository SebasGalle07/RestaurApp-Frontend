
export interface MenuDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoriaId: number;
  categoriaNombre: string;
  activo: boolean;
}

export interface MenuCreateDto {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria_id: number;
  activo: boolean;
}

export interface MenuPatchDto {
  nombre?: string;
  descripcion?: string | null;
  precio?: number;
  categoria_id?: number;
  activo?: boolean;
}

export interface MenuSearchFilters {
  categoria_id?: number | null;
  activo?: boolean | null;
  q?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}

export interface MenuSearchResult {
  items: MenuDto[];
  total: number;
}
