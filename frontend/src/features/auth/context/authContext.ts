import { createContext } from 'react'
import type { LoginResponse, UsuarioSesion } from '../types'

export interface SesionEstado {
  accessToken: string | null
  usuario: UsuarioSesion | null
  estaCargando: boolean
}

export interface AuthContextValue extends SesionEstado {
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => void
  // Aplica la sesión devuelta por el endpoint cambiar-password: nuevos tokens y
  // debeCambiarPassword ya resuelto en false.
  actualizarSesionTrasCambioPassword: (respuesta: LoginResponse) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
