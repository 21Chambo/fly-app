export interface ItemPedido {
  productoId: number;
  cantidad: number;
}

export interface PedidoRequest {
  items: ItemPedido[];
  numeroMesa: number;
}

export interface DetalleResponse {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  subtotal: number;
}

export interface PedidoResponse {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  numeroMesa: number;
  detalles: DetalleResponse[];
}
