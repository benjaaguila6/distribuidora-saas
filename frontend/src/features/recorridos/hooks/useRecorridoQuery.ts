import { useQuery } from '@tanstack/react-query'
import { obtenerPorId } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useRecorridoQuery(id: string) {
  return useQuery({
    queryKey: clavesRecorridos.detalle(id),
    queryFn: () => obtenerPorId(id),
    enabled: id.length > 0,
  })
}
