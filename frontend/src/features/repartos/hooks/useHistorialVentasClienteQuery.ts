import { useQuery } from '@tanstack/react-query'
import { obtenerHistorialVentasCliente } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useHistorialVentasClienteQuery(clienteId: string, enabled: boolean) {
  return useQuery({
    queryKey: clavesRepartos.historialVentasCliente(clienteId),
    queryFn: () => obtenerHistorialVentasCliente(clienteId),
    enabled: enabled && clienteId.length > 0,
  })
}
