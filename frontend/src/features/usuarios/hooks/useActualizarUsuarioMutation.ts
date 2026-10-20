import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizar } from '../api/usuariosService'
import type { ActualizarUsuarioInput } from '../types'
import { clavesUsuarios } from './clavesUsuarios'

export interface ActualizarUsuarioVariables {
  id: string
  datos: ActualizarUsuarioInput
}

export function useActualizarUsuarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: ActualizarUsuarioVariables) => actualizar(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesUsuarios.raiz })
    },
  })
}
