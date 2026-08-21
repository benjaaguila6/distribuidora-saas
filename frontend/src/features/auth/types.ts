export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiracion: string
  nombreCompleto: string
  rol: string
}

export interface UsuarioSesion {
  nombreCompleto: string
  rol: string
}
