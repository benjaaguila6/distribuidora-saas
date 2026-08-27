import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agregarStockInicial } from '../api/repartosService'
import type { AgregarStockInicialInput } from '../types'
import { clavesRepartos } from './clavesRepartos'

export function useAgregarStockInicialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: AgregarStockInicialInput) => agregarStockInicial(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
    },
  })
}
