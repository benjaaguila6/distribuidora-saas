import { apiClient } from '../../../lib/axios'
import type { ListaPaginada, Usuario } from '../types'

const URL_BASE = '/api/usuarios'

export async function listarUsuarios(
  page: number,
  pageSize: number,
): Promise<ListaPaginada<Usuario>> {
  const { data } = await apiClient.get<ListaPaginada<Usuario>>(URL_BASE, {
    params: { page, pageSize },
  })
  return data
}
