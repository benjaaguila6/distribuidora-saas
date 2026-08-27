import { useQuery } from '@tanstack/react-query'
import { obtenerPorId } from '../api/clientesService'
import { clavesClientes } from './clavesClientes'

export function useClienteQuery(id: string) {
  return useQuery({
    queryKey: clavesClientes.detalle(id),
    queryFn: () => obtenerPorId(id),
    enabled: id.length > 0,
  })
}
