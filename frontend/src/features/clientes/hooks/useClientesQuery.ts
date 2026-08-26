import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listar } from '../api/clientesService'
import { clavesClientes } from './clavesClientes'

export function useClientesQuery(page: number, pageSize: number, busqueda: string) {
  return useQuery({
    queryKey: clavesClientes.lista(page, pageSize, busqueda),
    queryFn: () => listar(page, pageSize, busqueda),
    placeholderData: keepPreviousData,
  })
}
