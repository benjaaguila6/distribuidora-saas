export const clavesRepartos = {
  raiz: ['repartos'] as const,
  lista: (page: number, pageSize: number) =>
    [...clavesRepartos.raiz, 'lista', { page, pageSize }] as const,
  detalle: (id: string) => [...clavesRepartos.raiz, 'detalle', id] as const,
  cierre: (id: string) => [...clavesRepartos.raiz, 'cierre', id] as const,
  recorrido: (id: string) => [...clavesRepartos.raiz, 'recorrido', id] as const,
  historialVentasCliente: (clienteId: string) =>
    [...clavesRepartos.raiz, 'historial-ventas-cliente', clienteId] as const,
}