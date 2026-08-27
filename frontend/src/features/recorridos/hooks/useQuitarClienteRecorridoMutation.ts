import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quitarCliente } from '../api/recorridosService'
import { clavesRecorridos } from './clavesRecorridos'

export function useQuitarClienteRecorridoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clienteId }: { id: string; clienteId: string }) =>
      quitarCliente(id, clienteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesRecorridos.raiz })
    },
  })
}
