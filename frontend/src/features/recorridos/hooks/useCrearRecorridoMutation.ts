import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crear } from '../api/recorridosService'
import type { CrearRecorridoInput } from '../types'
import { clavesRecorridos } from './clavesRecorridos'

export function useCrearRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearRecorridoInput) => crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
