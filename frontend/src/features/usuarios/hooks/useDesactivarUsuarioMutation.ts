import { useMutation, useQueryClient } from '@tanstack/react-query'
import { desactivar } from '../api/usuariosService'
import { clavesUsuarios } from './clavesUsuarios'

export function useDesactivarUsuarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesUsuarios.raiz })
    },
  })
}
