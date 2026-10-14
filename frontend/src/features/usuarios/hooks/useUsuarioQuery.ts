import { useQuery } from '@tanstack/react-query'
import { obtenerPorId } from '../api/usuariosService'
import { clavesUsuarios } from './clavesUsuarios'

export function useUsuarioQuery(id: string) {
  return useQuery({
    queryKey: clavesUsuarios.detalle(id),
    queryFn: () => obtenerPorId(id),
    enabled: id.length > 0,
  })
}
