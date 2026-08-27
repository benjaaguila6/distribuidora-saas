export type TipoEnvaseProducto = 'Retornable' | 'NoRetornable' | 'SinEnvase'

export interface Producto {
  id: string
  nombre: string
  precio: number
  costo: number
  tipoEnvase: TipoEnvaseProducto
  activo: boolean
  fechaCreacion: string
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}