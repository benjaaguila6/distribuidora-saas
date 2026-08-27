import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listar } from '../../clientes/api/clientesService'
import { clavesVentas } from './clavesVentas'

export function useClientesParaVentaQuery(busqueda: string) {
  return useQuery({
    queryKey: clavesVentas.clientesParaVenta(busqueda),
    queryFn: () => listar(1, 20, busqueda),
    enabled: busqueda.trim().length > 0,
    placeholderData: keepPreviousData,
    select: (data) => data.items.filter((cliente) => cliente.estado === 'Activo'),
  })
}