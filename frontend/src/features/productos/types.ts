export type TipoEnvaseProducto = 'Retornable' | 'NoRetornable' | 'SinEnvase'

export interface ProductoResponse {
  id: string
  nombre: string
  precio: number
  costo: number
  tipoEnvase: TipoEnvaseProducto
  activo: boolean
  fechaCreacion: string
}

export interface CrearProductoInput {
  nombre: string
  precio: number
  costo: number
  tipoEnvase: TipoEnvaseProducto
}

export interface ActualizarProductoVariables {
  id: string
  nombre: string
  precio: number
  costo: number
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}

export const ETIQUETAS_TIPO_ENVASE: Record<TipoEnvaseProducto, string> = {
  Retornable: 'Retornable',
  NoRetornable: 'No retornable',
  SinEnvase: 'Sin envase',
}

export const OPCIONES_TIPO_ENVASE: TipoEnvaseProducto[] = ['Retornable', 'NoRetornable', 'SinEnvase']
