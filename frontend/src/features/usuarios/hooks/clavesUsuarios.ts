export const clavesUsuarios = {
  raiz: ['usuarios'] as const,
  lista: (page: number, pageSize: number) =>
    [...clavesUsuarios.raiz, 'lista', { page, pageSize }] as const,
  detalle: (id: string) => [...clavesUsuarios.raiz, 'detalle', id] as const,
}
