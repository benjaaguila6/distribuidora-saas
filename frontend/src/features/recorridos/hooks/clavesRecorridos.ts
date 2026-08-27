export const clavesRecorridos = {
  raiz: ['recorridos'] as const,
  lista: (page: number, pageSize: number) =>
    [...clavesRecorridos.raiz, 'lista', { page, pageSize }] as const,
  detalle: (id: string) => [...clavesRecorridos.raiz, 'detalle', id] as const,
}
