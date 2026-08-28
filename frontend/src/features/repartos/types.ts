export type EstadoReparto = 'Planificado' | 'EnCurso' | 'Finalizado' | 'Cancelado'

export interface RepartoEnLista {
  id: string
  recorridoId: string
  nombreRecorrido: string
  repartidorId: string
  nombreRepartidor: string
  estado: EstadoReparto
  fechaReparto: string
}

export interface StockInicialItem {
  productoId: string
  nombreProducto: string
  cantidadInicial: number
  cantidadRestante: number
}

export interface EnvaseRetiradoItem {
  productoId: string
  nombreProducto: string
  cantidadRetirada: number
}

export interface RepartoDetalle {
  id: string
  recorridoId: string
  nombreRecorrido: string
  repartidorId: string
  nombreRepartidor: string
  estado: EstadoReparto
  fechaReparto: string
  fechaInicio: string | null
  fechaFinalizacion: string | null
  stockInicial: StockInicialItem[]
  envasesRetirados: EnvaseRetiradoItem[]
}

export interface RecorridoCliente {
  clienteId: string
  nombreCliente: string
  direccion: string
  saldoDeudaActual: number
  saldoEnvasesActual: number
  orden: number
}

export interface VentaHistorialCliente {
  ventaId: string
  repartoId: string
  fechaVenta: string
  dineroRecibido: number
  valorTotalEntregado: number
  deudaGenerada: number
  envasesPrestados: number
  envasesDevueltos: number
  productos: { productoId: string; nombreProducto: string; tipoMovimiento: string; cantidad: number }[]
  pagos: { formaPago: string; monto: number; importeEntregadoPorCliente: number | null; vuelto: number | null }[]
}

export interface Recorrido {
  id: string
  nombre: string
  diaSemana: string
  activo: boolean
  fechaCreacion: string
  clientes: RecorridoCliente[]
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}

export interface CrearRepartoInput {
  recorridoId: string
  repartidorId: string
  fechaReparto: string
}

export interface AgregarStockInicialInput {
  id: string
  productoId: string
  cantidad: number
}

export type ConceptoGasto = 'Comida' | 'Combustible' | 'Peaje' | 'Mantenimiento' | 'Otro'

/**
 * El backend serializa `ConceptoGasto` como número (1=Comida … 5=Otro) al recibir
 * el body de finalizar (System.Text.Json no usa strings de enums por defecto),
 * mientras que en el cierre (GET /{id}/cierre) el concepto llega como string.
 */
export const CONCEPTO_GASTO_VALOR: Record<ConceptoGasto, number> = {
  Comida: 1,
  Combustible: 2,
  Peaje: 3,
  Mantenimiento: 4,
  Otro: 5,
}

export const CONCEPTOS_GASTO_ORDEN: ConceptoGasto[] = [
  'Comida',
  'Combustible',
  'Peaje',
  'Mantenimiento',
  'Otro',
]

export interface GastoCierreReparto {
  concepto: string
  monto: number
  descripcion: string | null
}

export interface StockCierreReparto {
  productoId: string
  nombreProducto: string
  cantidadInicial: number
  cantidadVendida: number
  cantidadRestante: number
}

export interface EnvaseCierreReparto {
  productoId: string
  nombreProducto: string
  cantidadEsperada: number
  cantidadRecibida: number
  diferencia: number
}

export interface CierreReparto {
  repartoId: string
  estado: EstadoReparto
  fechaReparto: string
  fechaFinalizacion: string | null
  stockPorProducto: StockCierreReparto[]
  envasesPorProducto: EnvaseCierreReparto[]
  cajaEsperada: number
  cajaEntregada: number | null
  diferenciaCaja: number | null
  dineroFiadoGenerado: number
  totalTransferencias: number
  totalEfectivo: number
  totalQr: number
  gastos: GastoCierreReparto[]
  totalGastos: number
}

export interface GastoFinalizarInput {
  concepto: number
  monto: number
  descripcion: string | null
}

export interface FinalizarRepartoInput {
  cajaEntregada: number
  gastos: GastoFinalizarInput[]
}