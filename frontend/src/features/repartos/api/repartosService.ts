import { apiClient } from '../../../lib/axios'
import type { ListaPaginada, Recorrido, RepartoDetalle, RepartoEnLista } from '../types'

const URL_BASE = '/api/repartos'

export async function listarRepartos(page: number, pageSize: number): Promise<ListaPaginada<RepartoEnLista>> {
  const { data } = await apiClient.get<ListaPaginada<RepartoEnLista>>(URL_BASE, {
    params: { page, pageSize },
  })
  return data
}

export async function obtenerReparto(id: string): Promise<RepartoDetalle> {
  const { data } = await apiClient.get<RepartoDetalle>(`${URL_BASE}/${id}`)
  return data
}

export async function obtenerRecorrido(id: string): Promise<Recorrido> {
  const { data } = await apiClient.get<Recorrido>(`/api/recorridos/${id}`)
  return data
}