import { apiClient } from '../../../lib/axios'
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  ListaPaginada,
  UsuarioCreadoResponse,
  UsuarioResponse,
} from '../types'

const URL_BASE = '/api/usuarios'

// El endpoint de listado sólo acepta page y pageSize: el filtrado por texto,
// rol o estado se resuelve del lado del cliente sobre la página actual.
export async function listarUsuarios(
  page: number,
  pageSize: number,
): Promise<ListaPaginada<UsuarioResponse>> {
  const { data } = await apiClient.get<ListaPaginada<UsuarioResponse>>(URL_BASE, {
    params: { page, pageSize },
  })
  return data
}

export async function obtenerPorId(id: string): Promise<UsuarioResponse> {
  const { data } = await apiClient.get<UsuarioResponse>(`${URL_BASE}/${id}`)
  return data
}

export async function crear(dto: CrearUsuarioInput): Promise<UsuarioCreadoResponse> {
  const { data } = await apiClient.post<UsuarioCreadoResponse>(URL_BASE, dto)
  return data
}

export async function actualizar(id: string, dto: ActualizarUsuarioInput): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}`, dto)
}

export async function desactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/desactivar`)
}

export async function reactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/reactivar`)
}

// Es POST (no PATCH) y recibe la contraseña nueva: no genera ni devuelve una
// temporal. Devuelve 204 sin cuerpo.
export async function resetearPassword(id: string, passwordNueva: string): Promise<void> {
  await apiClient.post(`${URL_BASE}/${id}/reset-password`, { passwordNueva })
}
