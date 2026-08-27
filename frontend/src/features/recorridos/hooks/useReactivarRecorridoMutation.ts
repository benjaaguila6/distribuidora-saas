import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactivar } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useReactivarRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
