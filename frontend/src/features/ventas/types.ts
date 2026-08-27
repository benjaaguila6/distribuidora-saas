export type FormaPagoVenta = 'Efectivo' | 'Transferencia' | 'Qr'
export type TipoMovimientoVenta = 'Entregado' | 'Retirado' | 'Cambio'

export interface VentaProducto {
  productoId: string
  nombreProducto: string
  tipoMovimiento: TipoMovimientoVenta
  cantidad: number
}

export interface VentaPago {
  formaPago: FormaPagoVenta
  monto: number
  importeEntregadoPorCliente: number | null
  vuelto: number | null
}

export interface Venta {
  id: string
  repartoId: string
  clienteId: string
  nombreCliente: string
  dineroRecibido: number
  observaciones: string | null
  fechaVenta: string
  productos: VentaProducto[]
  pagos: VentaPago[]
}

export interface ProductoVentaInput {
  productoId: string
  tipoMovimiento: TipoMovimientoVenta
  cantidad: number
}

export interface PagoVentaInput {
  formaPago: FormaPagoVenta
  monto: number
  importeEntregadoPorCliente: number | null
}

export interface CrearVentaInput {
  repartoId: string
  clienteId: string
  dineroRecibido: number
  observaciones: string | null
  productos: ProductoVentaInput[]
  pagos: PagoVentaInput[]
}

export interface ClienteSeleccionado {
  id: string
  nombre: string
}