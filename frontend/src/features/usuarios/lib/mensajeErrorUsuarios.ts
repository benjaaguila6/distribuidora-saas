import axios from 'axios'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

// Código de negocio que el backend devuelve SÓLO en el PUT cuando se intenta
// cambiar de rol a un repartidor con un reparto en curso. En `desactivar` el 409
// es un string plano sin código.
const CODIGO_REPARTIDOR_REPARTO_EN_CURSO = 'REPARTIDOR_TIENE_REPARTO_EN_CURSO'

export interface ErrorValidacionCampo {
  campo: string
  mensaje: string
}

export interface AnalisisErrorFormulario {
  mensajeGeneral: string | null
  erroresCampos: ErrorValidacionCampo[]
  // En el alta, un 409 implica email duplicado y debe mostrarse en el campo email.
  esEmailDuplicado: boolean
}

// El backend expone el nombre del campo en PascalCase (PropertyName de C#);
// los campos del formulario están en camelCase.
function normalizarCampo(campo: string): string {
  if (campo.length === 0) return campo
  return campo.charAt(0).toLowerCase() + campo.slice(1)
}

export function extraerErroresDeValidacion(error: unknown): ErrorValidacionCampo[] {
  if (!axios.isAxiosError(error)) return []
  const data: unknown = error.response?.data
  if (typeof data !== 'object' || data === null) return []
  const errores = (data as { errores?: unknown }).errores
  if (!Array.isArray(errores)) return []
  return errores
    .filter(
      (item): item is { campo: string; mensaje: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { campo?: unknown }).campo === 'string' &&
        typeof (item as { mensaje?: unknown }).mensaje === 'string',
    )
    .map((item) => ({ campo: normalizarCampo(item.campo), mensaje: item.mensaje }))
}

export function esEmailDuplicado(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return false
  const data: unknown = error.response.data
  return typeof data === 'string' && data.toLowerCase().includes('email')
}

export function obtenerMensajeConflictoGestion(error: unknown): string | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return null
  const data: unknown = error.response.data
  if (
    typeof data === 'object' &&
    data !== null &&
    (data as { codigo?: unknown }).codigo === CODIGO_REPARTIDOR_REPARTO_EN_CURSO
  ) {
    const mensaje = (data as { mensaje?: unknown }).mensaje
    return typeof mensaje === 'string' && mensaje.length > 0
      ? mensaje
      : 'No se puede cambiar de rol a un repartidor que tiene un reparto en curso.'
  }
  return null
}

// Analiza el error de alta/edición y decide entre errores por campo o un
// mensaje general.
export function analizarErrorFormularioUsuarios(
  error: unknown,
  mensajePorDefecto: string,
): AnalisisErrorFormulario {
  const erroresCampos = extraerErroresDeValidacion(error)
  if (erroresCampos.length > 0) {
    return { mensajeGeneral: null, erroresCampos, esEmailDuplicado: false }
  }

  if (axios.isAxiosError(error) && error.response?.status === 409) {
    const conflictoGestion = obtenerMensajeConflictoGestion(error)
    if (conflictoGestion !== null) {
      return { mensajeGeneral: conflictoGestion, erroresCampos: [], esEmailDuplicado: false }
    }
    if (esEmailDuplicado(error)) {
      return { mensajeGeneral: null, erroresCampos: [], esEmailDuplicado: true }
    }
  }

  return {
    mensajeGeneral: obtenerMensajeErrorApi(error, mensajePorDefecto),
    erroresCampos: [],
    esEmailDuplicado: false,
  }
}

// Para acciones puntuales (desactivar, reactivar, resetear): el backend responde
// con un string claro (409/403/404) que se muestra tal cual.
export function obtenerMensajeErrorAccion(error: unknown, mensajePorDefecto: string): string {
  return obtenerMensajeErrorApi(error, mensajePorDefecto)
}
