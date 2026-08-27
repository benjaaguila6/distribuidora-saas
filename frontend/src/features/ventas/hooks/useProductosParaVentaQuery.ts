import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarProductos } from '../../productos/api/productosService'
import { clavesVentas } from './clavesVentas'

export function useProductosParaVentaQuery(busqueda: string) {
  return useQuery({
    queryKey: clavesVentas.productosParaVenta(busqueda),
    queryFn: () => listarProductos(busqueda),
    placeholderData: keepPreviousData,
    select: (data) => data.items.filter((producto) => producto.activo),
  })
}