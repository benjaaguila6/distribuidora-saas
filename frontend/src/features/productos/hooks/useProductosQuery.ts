import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listar } from '../api/productosService'
import { clavesProductos } from './clavesProductos'

export function useProductosQuery(page: number, pageSize: number, busqueda: string) {
  return useQuery({
    queryKey: clavesProductos.lista(page, pageSize, busqueda),
    queryFn: () => listar(page, pageSize, busqueda),
    placeholderData: keepPreviousData,
  })
}
