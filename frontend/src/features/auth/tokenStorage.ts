const REFRESH_TOKEN_KEY = 'distribuidora.refreshToken'
const USUARIO_ID_KEY = 'distribuidora.usuarioId'

export function guardarRefreshToken(refreshToken: string, usuarioId: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USUARIO_ID_KEY, usuarioId)
}

export function actualizarRefreshToken(refreshToken: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function obtenerRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function obtenerUsuarioId(): string | null {
  return localStorage.getItem(USUARIO_ID_KEY)
}

export function limpiarSesionPersistida(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USUARIO_ID_KEY)
}
