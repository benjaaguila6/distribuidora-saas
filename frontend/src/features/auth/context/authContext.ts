import { createContext } from 'react'
import type { UsuarioSesion } from '../types'

export interface SesionEstado {
  accessToken: string | null
  usuario: UsuarioSesion | null
  estaCargando: boolean
}

export interface AuthContextValue extends SesionEstado {
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
