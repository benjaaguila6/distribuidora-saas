import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarRepartos } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useRepartosQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: clavesRepartos.lista(page, pageSize),
    queryFn: () => listarRepartos(page, pageSize),
    placeholderData: keepPreviousData,
  })
}