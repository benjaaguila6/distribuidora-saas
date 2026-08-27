import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearVenta } from '../api/ventasService'
import type { CrearVentaInput } from '../types'
import { clavesVentas } from './clavesVentas'

export function useCrearVentaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearVentaInput) => crearVenta(dto),
    onSuccess: (_venta, variables) => {
      void queryClient.invalidateQueries({
        queryKey: clavesVentas.ventasDeReparto(variables.repartoId),
      })
    },
  })
}