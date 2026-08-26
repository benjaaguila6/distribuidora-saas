import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useActualizarClienteMutation } from '../hooks/useActualizarClienteMutation'
import { useCrearClienteMutation } from '../hooks/useCrearClienteMutation'
import type { ClienteResponse, ContactoInput, CrearClienteInput } from '../types'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

export type ModoFormularioCliente = 'crear' | 'editar'

interface ValoresFormularioCliente {
  nombre: string
  direccion: string
  telefono: string
  latitud: string
  longitud: string
  observaciones: string
}

interface ClienteFormDialogProps {
  modo: ModoFormularioCliente
  cliente?: ClienteResponse
  open: boolean
  onClose: () => void
}

function convertirAOpcional(valor: string): string | null {
  const recortado = valor.trim()
  return recortado.length === 0 ? null : recortado
}

function parsearDecimalOpcional(valor: string): number | null {
  const recortado = valor.trim()
  if (recortado.length === 0) return null
  const numero = Number(recortado.replace(',', '.'))
  return Number.isNaN(numero) ? null : numero
}

export default function ClienteFormDialog({ modo, cliente, open, onClose }: ClienteFormDialogProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionCrear = useCrearClienteMutation()
  const mutacionActualizar = useActualizarClienteMutation()

  const valoresIniciales = useMemo<ValoresFormularioCliente>(
    () => ({
      nombre: cliente?.nombre ?? '',
      direccion: cliente?.direccion ?? '',
      telefono: cliente?.telefono ?? '',
      latitud: cliente?.latitud?.toString() ?? '',
      longitud: cliente?.longitud?.toString() ?? '',
      observaciones: cliente?.observaciones ?? '',
    }),
    [cliente],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresFormularioCliente>({ values: valoresIniciales })

  const guardando = mutacionCrear.isPending || mutacionActualizar.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    onClose()
  }

  const alEnviar = handleSubmit(async (valores) => {
    setErrorServidor(null)

    const datosBasicos = {
      nombre: valores.nombre.trim(),
      direccion: valores.direccion.trim(),
    }
    const contacto: ContactoInput = {
      telefono: convertirAOpcional(valores.telefono),
      latitud: parsearDecimalOpcional(valores.latitud),
      longitud: parsearDecimalOpcional(valores.longitud),
      observaciones: convertirAOpcional(valores.observaciones),
    }

    try {
      if (modo === 'crear') {
        const dtoCrear: CrearClienteInput = { ...datosBasicos, ...contacto }
        await mutacionCrear.mutateAsync(dtoCrear)
      } else if (cliente !== undefined) {
        await mutacionActualizar.mutateAsync({
          id: cliente.id,
          datosBasicos,
          contacto,
        })
      } else {
        return
      }
      manejarCierre()
    } catch (error) {
      setErrorServidor(
        obtenerMensajeErrorApi(
          error,
          modo === 'crear'
            ? 'No se pudo crear el cliente.'
            : 'No se pudo actualizar el cliente.',
        ),
      )
    }
  })

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>
        {modo === 'crear' ? 'Nuevo cliente' : 'Editar cliente'}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-cliente"
          onSubmit={alEnviar}
          noValidate
          sx={{ display: 'grid', gap: 2.5 }}
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}
          <TextField
            label="Nombre"
            required
            fullWidth
            autoFocus
            error={errors.nombre !== undefined}
            helperText={errors.nombre?.message}
            {...register('nombre', {
              required: 'El nombre es obligatorio.',
              maxLength: {
                value: 200,
                message: 'El nombre no puede superar los 200 caracteres.',
              },
            })}
          />
          <TextField
            label="Dirección"
            required
            fullWidth
            error={errors.direccion !== undefined}
            helperText={errors.direccion?.message}
            {...register('direccion', {
              required: 'La dirección es obligatoria.',
              maxLength: {
                value: 300,
                message: 'La dirección no puede superar los 300 caracteres.',
              },
            })}
          />
          <TextField
            label="Teléfono"
            fullWidth
            error={errors.telefono !== undefined}
            helperText={errors.telefono?.message}
            {...register('telefono', {
              maxLength: {
                value: 30,
                message: 'El teléfono no puede superar los 30 caracteres.',
              },
            })}
          />
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Latitud"
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              error={errors.latitud !== undefined}
              helperText={errors.latitud?.message}
              {...register('latitud', {
                validate: (valor): string | true => {
                  const recortado = valor.trim()
                  if (recortado.length === 0) return true
                  const numero = Number(recortado.replace(',', '.'))
                  if (Number.isNaN(numero)) return 'La latitud debe ser un número válido.'
                  if (numero < -90 || numero > 90)
                    return 'La latitud debe estar entre -90 y 90.'
                  return true
                },
              })}
            />
            <TextField
              label="Longitud"
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              error={errors.longitud !== undefined}
              helperText={errors.longitud?.message}
              {...register('longitud', {
                validate: (valor): string | true => {
                  const recortado = valor.trim()
                  if (recortado.length === 0) return true
                  const numero = Number(recortado.replace(',', '.'))
                  if (Number.isNaN(numero)) return 'La longitud debe ser un número válido.'
                  if (numero < -180 || numero > 180)
                    return 'La longitud debe estar entre -180 y 180.'
                  return true
                },
              })}
            />
          </Box>
          <TextField
            label="Observaciones"
            fullWidth
            multiline
            minRows={3}
            error={errors.observaciones !== undefined}
            helperText={
              errors.observaciones?.message ?? 'Hasta 1000 caracteres.'
            }
            {...register('observaciones', {
              maxLength: {
                value: 1000,
                message: 'Las observaciones no pueden superar los 1000 caracteres.',
              },
            })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-cliente"
          variant="contained"
          loading={guardando}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
