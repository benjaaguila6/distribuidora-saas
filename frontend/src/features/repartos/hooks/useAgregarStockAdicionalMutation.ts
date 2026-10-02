import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agregarStockAdicional } from '../api/repartosService'
import { clavesRepartos } from './clavesRepartos'

export function useAgregarStockAdicionalMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; productoId: string; cantidad: number }) =>
      agregarStockAdicional(id, dto),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.detalle(variables.id) })
      void queryClient.invalidateQueries({ queryKey: clavesRepartos.cierre(variables.id) })
    },
  })
}
