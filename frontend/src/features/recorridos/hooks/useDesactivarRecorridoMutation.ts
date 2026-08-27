import { useMutation, useQueryClient } from '@tanstack/react-query'
import { desactivar } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useDesactivarRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
