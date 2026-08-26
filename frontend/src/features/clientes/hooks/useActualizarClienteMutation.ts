import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarContacto, actualizarDatosBasicos } from '../api/clientesService'
import type { ActualizarClienteVariables } from '../types'
import { clavesClientes } from './clavesClientes'

export function useActualizarClienteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, datosBasicos, contacto }: ActualizarClienteVariables) => {
      await actualizarDatosBasicos(id, datosBasicos)
      await actualizarContacto(id, contacto)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clavesClientes.raiz })
    },
  })
}
