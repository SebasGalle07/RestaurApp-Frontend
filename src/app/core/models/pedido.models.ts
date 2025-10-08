import type { PedidoItemDto } from './pedido-item.models';
export type PedidoEstado = 'ABIERTO' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CERRADO' | 'CANCELADO';

export interface PedidoItemNewDto {
  item_menu_id: number;
  cantidad: number;
  notas?: string | null;
}

export interface PedidoCreateDto {
  mesa_id: number;
  mesero_id: string;
  notas?: string | null;
  items: PedidoItemNewDto[];
}

export interface PedidoPatchDto {
  mesero_id?: string;
  notas?: string | null;
}

export interface PedidoListDto {
  id: number;
  mesaId: number;
  mesaNumero: string;
  meseroId: string;
  estado: PedidoEstado;
  total: number;
  createdAt: string;
}

export interface PedidoDto {
  id: number;
  mesaId: number;
  mesaNumero: string;
  meseroId: string;
  estado: PedidoEstado;
  total: number;
  notas?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: PedidoItemDto[];
}

export interface PedidoListFilters {
  mesa_id?: number | null;
  estado?: PedidoEstado | null;
  desde?: string | null;
  hasta?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}
