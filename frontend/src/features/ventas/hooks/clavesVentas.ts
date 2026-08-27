export const clavesVentas = {
  raiz: ['ventas'] as const,
  ventasDeReparto: (repartoId: string) => [...clavesVentas.raiz, 'reparto', repartoId] as const,
  productosParaVenta: (busqueda: string) =>
    [...clavesVentas.raiz, 'productos-para-venta', { busqueda }] as const,
  clientesParaVenta: (busqueda: string) =>
    [...clavesVentas.raiz, 'clientes-para-venta', { busqueda }] as const,
}