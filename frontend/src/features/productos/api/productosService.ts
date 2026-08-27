import { apiClient } from '../../../lib/axios'
import type { ListaPaginada, Producto } from '../types'

const URL_BASE = '/api/productos'

export async function listarProductos(busqueda?: string): Promise<ListaPaginada<Producto>> {
  const textoBusqueda = busqueda?.trim()
  const { data } = await apiClient.get<ListaPaginada<Producto>>(URL_BASE, {
    params: {
      page: 1,
      pageSize: 50,
      ...(textoBusqueda !== undefined && textoBusqueda.length > 0 ? { busqueda: textoBusqueda } : {}),
    },
  })
  return data
}