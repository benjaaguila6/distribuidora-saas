import { useMutation, useQueryClient } from '@tanstack/react-query'
import { finalizarReparto } from '../api/repartosService'
import type { FinalizarRepartoInput } from '../types'
import { clavesRepartos } from './clavesRepartos'

export function useFinalizarRepartoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FinalizarRepartoInput }) =>
      finalizarReparto(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
    },
  })
}
