import { useMutation, useQueryClient } from '@tanstack/react-query'
import { desactivar } from '../api/productosService'
import { clavesProductos } from './clavesProductos'

export function useDesactivarProductoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesProductos.raiz })
    },
  })
}
