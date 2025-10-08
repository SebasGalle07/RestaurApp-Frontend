export interface MenuCategoriaSummary {
  id: number;
  nombre: string;
}

export interface MesaDto {
  id: number;
  numero: string;
}

export interface ApiCollectionResult<T> {
  items: T[];
  total: number;
}
