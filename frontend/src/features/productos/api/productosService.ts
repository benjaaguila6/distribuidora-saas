import { apiClient } from '../../../lib/axios'
import type { CrearProductoInput, ListaPaginada, ProductoResponse } from '../types'

const URL_BASE = '/api/productos'

export async function listar(
  page: number,
  pageSize: number,
  busqueda?: string,
): Promise<ListaPaginada<ProductoResponse>> {
  const textoBusqueda = busqueda?.trim()
  const { data } = await apiClient.get<ListaPaginada<ProductoResponse>>(URL_BASE, {
    params: {
      page,
      pageSize,
      ...(textoBusqueda !== undefined && textoBusqueda.length > 0 ? { busqueda: textoBusqueda } : {}),
    },
  })
  return data
}

export async function crear(dto: CrearProductoInput): Promise<ProductoResponse> {
  const { data } = await apiClient.post<ProductoResponse>(URL_BASE, dto)
  return data
}

export async function actualizarNombre(id: string, nombre: string): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}/nombre`, { nombre })
}

export async function actualizarPrecios(id: string, precio: number, costo: number): Promise<void> {
  await apiClient.put(`${URL_BASE}/${id}/precios`, { precio, costo })
}

export async function desactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/desactivar`)
}

export async function reactivar(id: string): Promise<void> {
  await apiClient.patch(`${URL_BASE}/${id}/reactivar`)
}
