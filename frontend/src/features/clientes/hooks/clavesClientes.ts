export const clavesClientes = {
  raiz: ['clientes'] as const,
  lista: (page: number, pageSize: number, busqueda: string) =>
    [...clavesClientes.raiz, 'lista', { page, pageSize, busqueda }] as const,
}
