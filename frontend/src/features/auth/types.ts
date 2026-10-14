export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiracion: string
  usuarioId: string
  nombreCompleto: string
  rol: string
  debeCambiarPassword: boolean
}

export interface UsuarioSesion {
  usuarioId: string
  nombreCompleto: string
  rol: string
  debeCambiarPassword: boolean
}

export interface CambiarPasswordInput {
  passwordActual: string
  passwordNueva: string
}
