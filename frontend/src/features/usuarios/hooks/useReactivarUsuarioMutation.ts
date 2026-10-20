import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactivar } from '../api/usuariosService'
import { clavesUsuarios } from './clavesUsuarios'

export function useReactivarUsuarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesUsuarios.raiz })
    },
  })
}
