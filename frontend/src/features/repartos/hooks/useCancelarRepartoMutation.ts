import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarReparto } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useCancelarRepartoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelarReparto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
    },
  })
}
