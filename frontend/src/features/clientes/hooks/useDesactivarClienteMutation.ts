import { useMutation, useQueryClient } from '@tanstack/react-query'
import { desactivar } from '../api/clientesService'
import { clavesClientes } from './clavesClientes'

export function useDesactivarClienteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesClientes.raiz })
    },
  })
}
