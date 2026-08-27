import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactivar } from '../api/productosService'
import { clavesProductos } from './clavesProductos'

export function useReactivarProductoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesProductos.raiz })
    },
  })
}
