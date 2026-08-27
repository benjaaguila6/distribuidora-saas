import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useActualizarProductoMutation } from '../hooks/useActualizarProductoMutation'
import { useCrearProductoMutation } from '../hooks/useCrearProductoMutation'
import type { ProductoResponse, TipoEnvaseProducto } from '../types'
import { ETIQUETAS_TIPO_ENVASE, OPCIONES_TIPO_ENVASE } from '../types'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

export type ModoFormularioProducto = 'crear' | 'editar'

interface ValoresFormularioProducto {
  nombre: string
  precio: string
  costo: string
  tipoEnvase: TipoEnvaseProducto
}

interface ProductoFormDialogProps {
  modo: ModoFormularioProducto
  producto?: ProductoResponse
  open: boolean
  onClose: () => void
}

function parsearMonto(valor: string): number | null {
  const recortado = valor.trim()
  if (recortado.length === 0) return null
  const numero = Number(recortado.replace(',', '.'))
  return Number.isFinite(numero) ? numero : null
}

export default function ProductoFormDialog({ modo, producto, open, onClose }: ProductoFormDialogProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionCrear = useCrearProductoMutation()
  const mutacionActualizar = useActualizarProductoMutation()

  const esEdicion = modo === 'editar'

  const valoresIniciales = useMemo<ValoresFormularioProducto>(
    () => ({
      nombre: producto?.nombre ?? '',
      precio: producto?.precio?.toString() ?? '',
      costo: producto?.costo?.toString() ?? '',
      tipoEnvase: producto?.tipoEnvase ?? 'SinEnvase',
    }),
    [producto],
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ValoresFormularioProducto>({ values: valoresIniciales })

  const guardando = mutacionCrear.isPending || mutacionActualizar.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    onClose()
  }

  const alEnviar = handleSubmit(async (valores) => {
    setErrorServidor(null)

    const precio = parsearMonto(valores.precio)
    const costo = parsearMonto(valores.costo)

    try {
      if (modo === 'crear') {
        if (precio === null || costo === null) return
        await mutacionCrear.mutateAsync({
          nombre: valores.nombre.trim(),
          precio,
          costo,
          tipoEnvase: valores.tipoEnvase,
        })
      } else if (producto !== undefined && precio !== null && costo !== null) {
        await mutacionActualizar.mutateAsync({
          id: producto.id,
          nombre: valores.nombre.trim(),
          precio,
          costo,
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
            ? 'No se pudo crear el producto.'
            : 'No se pudo actualizar el producto.',
        ),
      )
    }
  })

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-producto"
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
            helperText={
              errors.nombre?.message ?? (esEdicion ? 'El tipo de envase no se puede modificar.' : ' ')
            }
            {...register('nombre', {
              required: 'El nombre es obligatorio.',
              maxLength: {
                value: 150,
                message: 'El nombre no puede superar los 150 caracteres.',
              },
            })}
          />
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Precio"
              required
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              error={errors.precio !== undefined}
              helperText={errors.precio?.message}
              {...register('precio', {
                required: 'El precio es obligatorio.',
                validate: (valor): string | true => {
                  const numero = parsearMonto(valor)
                  if (numero === null) return 'El precio debe ser un número válido.'
                  if (numero < 0) return 'El precio no puede ser negativo.'
                  return true
                },
              })}
            />
            <TextField
              label="Costo"
              required
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              error={errors.costo !== undefined}
              helperText={errors.costo?.message}
              {...register('costo', {
                required: 'El costo es obligatorio.',
                validate: (valor): string | true => {
                  const numero = parsearMonto(valor)
                  if (numero === null) return 'El costo debe ser un número válido.'
                  if (numero < 0) return 'El costo no puede ser negativo.'
                  return true
                },
              })}
            />
          </Box>
          <Controller
            name="tipoEnvase"
            control={control}
            rules={{ required: 'El tipo de envase es obligatorio.' }}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Tipo de envase"
                fullWidth
                disabled={esEdicion}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error !== undefined}
                helperText={
                  fieldState.error?.message ??
                  (esEdicion ? 'Solo se puede definir al crear el producto.' : ' ')
                }
              >
                {OPCIONES_TIPO_ENVASE.map((opcion) => (
                  <MenuItem key={opcion} value={opcion}>
                    {ETIQUETAS_TIPO_ENVASE[opcion]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-producto"
          variant="contained"
          loading={guardando}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
