import axios from 'axios'
import { apiClient } from '../../../lib/axios'
import type { CambiarPasswordInput, LoginResponse } from '../types'

const authHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await authHttpClient.post<LoginResponse>('/api/auth/login', { email, password })
  return data
}

export async function refresh(usuarioId: string, refreshToken: string): Promise<LoginResponse> {
  const { data } = await authHttpClient.post<LoginResponse>('/api/auth/refresh', {
    usuarioId,
    refreshToken,
  })
  return data
}

// Requiere el header Authorization, por eso usa apiClient (que lo adjunta y
// además reintenta ante un 401 refrescando el token).
export async function cambiarPassword(datos: CambiarPasswordInput): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/cambiar-password', datos)
  return data
}
