import { apiClient } from '../../../lib/axios'
import type {
  AgregarStockInicialInput,
  CierreReparto,
  CrearRepartoInput,
  FinalizarRepartoInput,
  ListaPaginada,
  Recorrido,
  RepartoDetalle,
  RepartoEnLista,
} from '../types'

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

export async function crearReparto(dto: CrearRepartoInput): Promise<RepartoDetalle> {
  const { data } = await apiClient.post<RepartoDetalle>(URL_BASE, dto)
  return data
}

export async function agregarStockInicial(dto: AgregarStockInicialInput): Promise<void> {
  await apiClient.post(`${URL_BASE}/${dto.id}/stock-inicial`, {
    productoId: dto.productoId,
    cantidad: dto.cantidad,
  })
}

export async function iniciarReparto(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/iniciar`)
}

export async function cancelarReparto(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/cancelar`)
}

export async function finalizarReparto(id: string, dto: FinalizarRepartoInput): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/finalizar`, {
    cajaEntregada: dto.cajaEntregada,
    gastos: dto.gastos,
  })
}

export async function obtenerCierre(id: string): Promise<CierreReparto> {
  const { data } = await apiClient.get<CierreReparto>(`${URL_BASE}/${id}/cierre`)
  return data
}