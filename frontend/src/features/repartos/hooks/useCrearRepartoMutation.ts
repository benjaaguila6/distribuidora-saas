import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearReparto } from '../api/repartosService'
import type { CrearRepartoInput } from '../types'
import { clavesRepartos } from './clavesRepartos'

export function useCrearRepartoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearRepartoInput) => crearReparto(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
    },
  })
}
