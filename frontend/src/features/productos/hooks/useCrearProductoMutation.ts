import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crear } from '../api/productosService'
import type { CrearProductoInput } from '../types'
import { clavesProductos } from './clavesProductos'

export function useCrearProductoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearProductoInput) => crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesProductos.raiz })
    },
  })
}
