import { apiClient } from '../../../lib/axios'
import type { CrearVentaInput, Venta } from '../types'

const URL_BASE = '/api/ventas'

export async function obtenerVentasDeReparto(repartoId: string): Promise<Venta[]> {
  const { data } = await apiClient.get<Venta[]>(`${URL_BASE}/reparto/${repartoId}`)
  return data
}

export async function crearVenta(dto: CrearVentaInput): Promise<Venta> {
  const { data } = await apiClient.post<Venta>(URL_BASE, dto)
  return data
}