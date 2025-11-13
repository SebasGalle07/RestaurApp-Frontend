export interface FacturaDto {
  id: number;
  numero: string;
  pedidoId: number;
  mesaId: number;
  mesaNumero: string;
  meseroId: string;
  meseroNombre?: string | null;
  total: number;
  fechaEmision: string;
}

export interface FacturaListDto extends FacturaDto {}

export interface FacturaListFilters {
  mesa_id?: number | null;
  mesero_id?: string | null;
  desde?: string | null;
  hasta?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}
