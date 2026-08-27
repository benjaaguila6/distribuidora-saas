import { useQuery } from '@tanstack/react-query'
import { obtenerRecorrido } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useRecorridoQuery(id: string) {
  return useQuery({
    queryKey: clavesRepartos.recorrido(id),
    queryFn: () => obtenerRecorrido(id),
    enabled: id.length > 0,
  })
}