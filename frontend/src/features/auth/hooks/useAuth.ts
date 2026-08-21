import { useContext } from 'react'
import { AuthContext } from '../context/authContext'

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }
  return contexto
}
