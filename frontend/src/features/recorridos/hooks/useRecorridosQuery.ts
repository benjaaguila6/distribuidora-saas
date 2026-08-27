import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listar } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useRecorridosQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: clavesRecorridos.lista(page, pageSize),
    queryFn: () => listar(page, pageSize),
    placeholderData: keepPreviousData,
  })
}
