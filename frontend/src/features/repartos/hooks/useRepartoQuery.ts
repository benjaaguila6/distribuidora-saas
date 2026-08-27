import { useQuery } from '@tanstack/react-query'
import { obtenerReparto } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useRepartoQuery(id: string) {
  return useQuery({
    queryKey: clavesRepartos.detalle(id),
    queryFn: () => obtenerReparto(id),
    enabled: id.length > 0,
  })
}