import axios from 'axios'
import type { LoginResponse } from '../types'

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
