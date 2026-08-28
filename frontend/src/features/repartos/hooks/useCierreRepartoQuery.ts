import { useQuery } from '@tanstack/react-query'
import { obtenerCierre } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useCierreRepartoQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: clavesRepartos.cierre(id),
    queryFn: () => obtenerCierre(id),
    enabled: enabled && id.length > 0,
  })
}
