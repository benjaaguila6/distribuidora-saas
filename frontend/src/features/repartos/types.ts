export type EstadoReparto = 'Planificado' | 'EnCurso' | 'Finalizado' | 'Cancelado'

export interface RepartoEnLista {
  id: string
  recorridoId: string
  repartidorId: string
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
  nombre: string
  orden: number
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