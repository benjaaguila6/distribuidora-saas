export const clavesUsuarios = {
  raiz: ['usuarios'] as const,
  lista: (page: number, pageSize: number) =>
    [...clavesUsuarios.raiz, 'lista', { page, pageSize }] as const,
}
