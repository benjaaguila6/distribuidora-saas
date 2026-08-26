import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactivar } from '../api/clientesService'
import { clavesClientes } from './clavesClientes'

export function useReactivarClienteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesClientes.raiz })
    },
  })
}
