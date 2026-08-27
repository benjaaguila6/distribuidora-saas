import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarUsuarios } from '../api/usuariosService'
import { clavesUsuarios } from './clavesUsuarios'

export function useUsuariosQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: clavesUsuarios.lista(page, pageSize),
    queryFn: () => listarUsuarios(page, pageSize),
    placeholderData: keepPreviousData,
  })
}
