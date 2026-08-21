import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { login, refresh } from '../api/authService'
import { extraerUsuarioIdDelToken } from '../jwt'
import type { LoginResponse, UsuarioSesion } from '../types'
import {
  actualizarRefreshToken,
  guardarRefreshToken,
  limpiarSesionPersistida,
  obtenerRefreshToken,
  obtenerUsuarioId,
} from '../tokenStorage'
import { setAccessToken } from '../tokenStore'
import { AuthContext, type SesionEstado } from './authContext'

type SesionAction =
  | { type: 'sesionEstablecida'; accessToken: string; usuario: UsuarioSesion }
  | { type: 'sesionLimpiada' }

function sesionReducer(_estado: SesionEstado, action: SesionAction): SesionEstado {
  switch (action.type) {
    case 'sesionEstablecida':
      return {
        accessToken: action.accessToken,
        usuario: action.usuario,
        estaCargando: false,
      }
    case 'sesionLimpiada':
      return { accessToken: null, usuario: null, estaCargando: false }
  }
}

function crearEstadoInicial(): SesionEstado {
  const haySesionPersistida = obtenerRefreshToken() !== null && obtenerUsuarioId() !== null
  return { accessToken: null, usuario: null, estaCargando: haySesionPersistida }
}

let restauracionEnCurso: Promise<void> | null = null

function aplicarSesion(respuesta: LoginResponse, dispatch: Dispatch<SesionAction>): void {
  setAccessToken(respuesta.accessToken)
  actualizarRefreshToken(respuesta.refreshToken)
  dispatch({
    type: 'sesionEstablecida',
    accessToken: respuesta.accessToken,
    usuario: { nombreCompleto: respuesta.nombreCompleto, rol: respuesta.rol },
  })
}

function restaurarSesion(dispatch: Dispatch<SesionAction>): Promise<void> {
  if (restauracionEnCurso !== null) {
    return restauracionEnCurso
  }

  const refreshToken = obtenerRefreshToken()
  const usuarioId = obtenerUsuarioId()

  if (refreshToken === null || usuarioId === null) {
    return Promise.resolve()
  }

  restauracionEnCurso = refresh(usuarioId, refreshToken)
    .then((respuesta) => {
      aplicarSesion(respuesta, dispatch)
    })
    .catch(() => {
      limpiarSesionPersistida()
      setAccessToken(null)
      dispatch({ type: 'sesionLimpiada' })
    })
    .finally(() => {
      restauracionEnCurso = null
    })

  return restauracionEnCurso
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(sesionReducer, undefined, crearEstadoInicial)

  useEffect(() => {
    void restaurarSesion(dispatch)
  }, [])

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const respuesta = await login(email, password)
    const usuarioId = extraerUsuarioIdDelToken(respuesta.accessToken)
    if (usuarioId === null) {
      throw new Error('No se pudo obtener el identificador del usuario.')
    }
    guardarRefreshToken(respuesta.refreshToken, usuarioId)
    aplicarSesion(respuesta, dispatch)
  }, [])

  const cerrarSesion = useCallback(() => {
    limpiarSesionPersistida()
    setAccessToken(null)
    dispatch({ type: 'sesionLimpiada' })
  }, [])

  const valor = useMemo(
    () => ({ ...estado, iniciarSesion, cerrarSesion }),
    [estado, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
