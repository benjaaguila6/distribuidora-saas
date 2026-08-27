import { apiClient } from '../../../lib/axios'
import type {
  CrearRecorridoInput,
  ListaPaginada,
  RecorridoDetalle,
  RecorridoEnLista,
} from '../types'
import { VALOR_DIA_SEMANA } from '../types'

const URL_BASE = '/api/recorridos'

export async function listar(
  page: number,
  pageSize: number,
): Promise<ListaPaginada<RecorridoEnLista>> {
  const { data } = await apiClient.get<ListaPaginada<RecorridoEnLista>>(URL_BASE, {
    params: { page, pageSize },
  })
  return data
}

export async function obtenerPorId(id: string): Promise<RecorridoDetalle> {
  const { data } = await apiClient.get<RecorridoDetalle>(`${URL_BASE}/${id}`)
  return data
}

export async function crear(dto: CrearRecorridoInput): Promise<RecorridoDetalle> {
  const { data } = await apiClient.post<RecorridoDetalle>(URL_BASE, {
    nombre: dto.nombre,
    diaSemana: VALOR_DIA_SEMANA[dto.diaSemana],
  })
  return data
}

export async function agregarCliente(id: string, clienteId: string): Promise<void> {
  await apiClient.post(`${URL_BASE}/${id}/clientes`, { clienteId })
}

export async function quitarCliente(id: string, clienteId: string): Promise<void> {
  await apiClient.delete(`${URL_BASE}/${id}/clientes/${clienteId}`)
}

export async function reordenarClientes(id: string, clienteIdsEnOrden: string[]): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}/clientes/orden`, { clienteIdsEnOrden })
}

export async function desactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/desactivar`)
}

export async function reactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/reactivar`)
}
