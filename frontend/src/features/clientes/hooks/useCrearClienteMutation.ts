import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crear } from '../api/clientesService'
import type { CrearClienteInput } from '../types'
import { clavesClientes } from './clavesClientes'

export function useCrearClienteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearClienteInput) => crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesClientes.raiz })
    },
  })
}
