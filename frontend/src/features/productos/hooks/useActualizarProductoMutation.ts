import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarNombre, actualizarPrecios } from '../api/productosService'
import type { ActualizarProductoVariables } from '../types'
import { clavesProductos } from './clavesProductos'

export function useActualizarProductoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, nombre, precio, costo }: ActualizarProductoVariables) => {
      await actualizarNombre(id, nombre)
      await actualizarPrecios(id, precio, costo)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesProductos.raiz })
    },
  })
}
