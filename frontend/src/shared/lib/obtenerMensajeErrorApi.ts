import axios from 'axios'

interface ErrorValidacionItem {
  campo: string
  mensaje: string
}

interface RespuestaErrorValidacion {
  errores: ErrorValidacionItem[]
}

function sonErroresDeValidacion(data: unknown): data is RespuestaErrorValidacion {
  if (typeof data !== 'object' || data === null) return false
  const errores = (data as { errores?: unknown }).errores
  return (
    Array.isArray(errores) &&
    errores.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { mensaje?: unknown }).mensaje === 'string',
    )
  )
}

export function obtenerMensajeErrorApi(error: unknown, mensajePorDefecto: string): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado.'
  }

  const data: unknown = error.response?.data

  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }

  if (sonErroresDeValidacion(data) && data.errores.length > 0) {
    return data.errores.map((item) => item.mensaje).join(' ')
  }

  if (error.response !== undefined) {
    return mensajePorDefecto
  }

  return 'No se pudo conectar con el servidor.'
}
