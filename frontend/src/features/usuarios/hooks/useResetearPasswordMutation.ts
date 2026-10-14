import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetearPassword } from '../api/usuariosService'
import { clavesUsuarios } from './clavesUsuarios'

export interface ResetearPasswordVariables {
  id: string
  passwordNueva: string
}

export function useResetearPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, passwordNueva }: ResetearPasswordVariables) =>
      resetearPassword(id, passwordNueva),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesUsuarios.raiz })
    },
  })
}
