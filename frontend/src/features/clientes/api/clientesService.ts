import { apiClient } from '../../../lib/axios'
import type {
  ClienteResponse,
  ContactoInput,
  CrearClienteInput,
  DatosBasicosInput,
  ListaPaginada,
} from '../types'

const URL_BASE = '/api/clientes'

export async function listar(
  page: number,
  pageSize: number,
  busqueda?: string,
): Promise<ListaPaginada<ClienteResponse>> {
  const textoBusqueda = busqueda?.trim()
  const { data } = await apiClient.get<ListaPaginada<ClienteResponse>>(URL_BASE, {
    params: {
      page,
      pageSize,
      ...(textoBusqueda !== undefined && textoBusqueda.length > 0 ? { busqueda: textoBusqueda } : {}),
    },
  })
  return data
}

export async function obtenerPorId(id: string): Promise<ClienteResponse> {
  const { data } = await apiClient.get<ClienteResponse>(`${URL_BASE}/${id}`)
  return data
}

export async function crear(dto: CrearClienteInput): Promise<ClienteResponse> {
  const { data } = await apiClient.post<ClienteResponse>(URL_BASE, dto)
  return data
}

export async function actualizarDatosBasicos(id: string, dto: DatosBasicosInput): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}/datos-basicos`, dto)
}

export async function actualizarContacto(id: string, dto: ContactoInput): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}/contacto`, dto)
}

export async function desactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/desactivar`)
}

export async function reactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/reactivar`)
}
