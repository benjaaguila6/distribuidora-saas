import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { refresh } from '../features/auth/api/authService'
import { getAccessToken, setAccessToken } from '../features/auth/tokenStore'
import {
  actualizarRefreshToken,
  limpiarSesionPersistida,
  obtenerRefreshToken,
  obtenerUsuarioId,
} from '../features/auth/tokenStorage'

interface RequestConRetry extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshEnCurso: Promise<string> | null = null

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestOriginal = error.config as RequestConRetry | undefined

    const puedeReintentar =
      error.response?.status === 401 &&
      requestOriginal !== undefined &&
      requestOriginal._retry !== true &&
      obtenerRefreshToken() !== null &&
      obtenerUsuarioId() !== null

    if (!puedeReintentar || requestOriginal === undefined) {
      return Promise.reject(error)
    }

    requestOriginal._retry = true

    try {
      const nuevoAccessToken = await refrescarTokenSingleFlight()
      requestOriginal.headers.Authorization = `Bearer ${nuevoAccessToken}`
      return await apiClient(requestOriginal)
    } catch {
      cerrarSesionForzada()
      return Promise.reject(error)
    }
  },
)

function refrescarTokenSingleFlight(): Promise<string> {
  if (refreshEnCurso === null) {
    const refreshToken = obtenerRefreshToken()
    const usuarioId = obtenerUsuarioId()

    if (refreshToken === null || usuarioId === null) {
      return Promise.reject(new Error('No hay refresh token almacenado.'))
    }

    refreshEnCurso = refresh(usuarioId, refreshToken)
      .then((respuesta) => {
        setAccessToken(respuesta.accessToken)
        actualizarRefreshToken(respuesta.refreshToken)
        return respuesta.accessToken
      })
      .finally(() => {
        refreshEnCurso = null
      })
  }

  return refreshEnCurso
}

function cerrarSesionForzada(): void {
  limpiarSesionPersistida()
  setAccessToken(null)
  window.location.href = '/login'
}
