import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agregarCliente } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useAgregarClienteRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clienteId }: { id: string; clienteId: string }) =>
      agregarCliente(id, clienteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
