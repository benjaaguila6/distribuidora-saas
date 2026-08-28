import { useMutation, useQueryClient } from '@tanstack/react-query'
import { iniciarReparto } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useIniciarRepartoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => iniciarReparto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
    },
  })
}
