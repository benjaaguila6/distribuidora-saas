export type RolUsuario = 'Administrador' | 'Gerente' | 'Repartidor'
export type EstadoUsuario = 'Activo' | 'Inactivo'

export interface Usuario {
  id: string
  email: string
  nombreCompleto: string
  rol: RolUsuario
  estado: EstadoUsuario
  fechaCreacion: string
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}
