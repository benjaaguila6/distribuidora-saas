export type RolUsuario = 'Administrador' | 'Gerente' | 'Repartidor'
export type EstadoUsuario = 'Activo' | 'Inactivo'

export interface UsuarioResponse {
  id: string
  email: string
  nombreCompleto: string
  rol: RolUsuario
  estado: EstadoUsuario
  fechaCreacion: string
  debeCambiarPassword: boolean
  telefono: string | null
}

// Respuesta del alta: incluye la contraseña temporal en claro UNA SOLA VEZ.
export interface UsuarioCreadoResponse extends UsuarioResponse {
  passwordTemporal: string
}

export interface CrearUsuarioInput {
  email: string
  nombreCompleto: string
  rol: RolUsuario
  telefono?: string | null
}

export interface ActualizarUsuarioInput {
  nombreCompleto: string
  rol: RolUsuario
  telefono?: string | null
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}
