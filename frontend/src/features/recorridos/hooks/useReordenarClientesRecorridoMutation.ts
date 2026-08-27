import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reordenarClientes } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useReordenarClientesRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clienteIdsEnOrden }: { id: string; clienteIdsEnOrden: string[] }) =>
      reordenarClientes(id, clienteIdsEnOrden),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
