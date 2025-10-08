export type ItemEstado = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO';

export interface PedidoItemCreateDto {
  item_menu_id: number;
  cantidad: number;
  notas?: string | null;
}

export interface PedidoItemPatchDto {
  cantidad?: number;
  notas?: string | null;
}

export interface ItemEstadoPatchDto {
  estado_preparacion: ItemEstado;
}

export interface PedidoItemDto {
  id: number;
  itemMenuId: number;
  itemMenuNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estadoPreparacion: ItemEstado;
  notas?: string | null;
}
