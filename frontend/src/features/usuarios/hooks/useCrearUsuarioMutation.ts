import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crear } from '../api/usuariosService'
import type { CrearUsuarioInput } from '../types'
import { clavesUsuarios } from './clavesUsuarios'

export function useCrearUsuarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearUsuarioInput) => crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesUsuarios.raiz })
    },
  })
}
