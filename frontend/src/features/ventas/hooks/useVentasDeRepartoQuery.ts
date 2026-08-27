import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { obtenerVentasDeReparto } from '../api/ventasService'
import { clavesVentas } from './clavesVentas'

export function useVentasDeRepartoQuery(repartoId: string) {
  return useQuery({
    queryKey: clavesVentas.ventasDeReparto(repartoId),
    queryFn: () => obtenerVentasDeReparto(repartoId),
    enabled: repartoId.length > 0,
    placeholderData: keepPreviousData,
  })
}