export type PagoMetodo = 'EFECTIVO' | 'TARJETA' | 'QR' | 'TRANSFERENCIA';
export type PagoEstado = 'APLICADO' | 'ANULADO';

export interface PagoDto {
  id: number;
  monto: number;
  metodo: string;
  estado: PagoEstado;
  createdAt: string;
}

export interface PagoCreateDto {
  monto: number;
  metodo: string;
}

export interface PagosResponseDto {
  pagos: PagoDto[];
  saldoPendiente: number;
}
