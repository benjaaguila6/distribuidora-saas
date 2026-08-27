export const clavesProductos = {
  raiz: ['productos'] as const,
  lista: (page: number, pageSize: number, busqueda: string) =>
    [...clavesProductos.raiz, 'lista', { page, pageSize, busqueda }] as const,
}
