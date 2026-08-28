import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useRecorridosQuery } from '../../recorridos/hooks/useRecorridosQuery'
import { useUsuariosQuery } from '../../usuarios/hooks/useUsuariosQuery'
import { useCrearRepartoMutation } from '../hooks/useCrearRepartoMutation'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const TAMANO_SELECTOR = 100

interface ValoresFormularioReparto {
  recorridoId: string
  repartidorId: string
  fechaReparto: string
}

interface CrearRepartoDialogProps {
  open: boolean
  onClose: () => void
}

export default function CrearRepartoDialog({ open, onClose }: CrearRepartoDialogProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionCrear = useCrearRepartoMutation()

  const consultaRecorridos = useRecorridosQuery(1, TAMANO_SELECTOR)
  const consultaUsuarios = useUsuariosQuery(1, TAMANO_SELECTOR)

  const recorridosDisponibles = (consultaRecorridos.data?.items ?? []).filter(
    (recorrido) => recorrido.activo,
  )
  const repartidoresDisponibles = (consultaUsuarios.data?.items ?? []).filter(
    (usuario) => usuario.rol === 'Repartidor' && usuario.estado === 'Activo',
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValoresFormularioReparto>({
    defaultValues: { recorridoId: '', repartidorId: '', fechaReparto: '' },
  })

  const guardando = mutacionCrear.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    reset()
    onClose()
  }

  const alEnviar = handleSubmit(async (valores) => {
    setErrorServidor(null)
    try {
      await mutacionCrear.mutateAsync({
        recorridoId: valores.recorridoId,
        repartidorId: valores.repartidorId,
        fechaReparto: new Date(valores.fechaReparto).toISOString(),
      })
      manejarCierre()
    } catch (error) {
      setErrorServidor(
        obtenerMensajeErrorApi(error, 'No se pudo crear el reparto.'),
      )
    }
  })

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo reparto</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-reparto"
          onSubmit={alEnviar}
          noValidate
          sx={{ display: 'grid', gap: 2.5 }}
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}

          {consultaRecorridos.isLoading || consultaUsuarios.isLoading ? (
            <LinearProgress />
          ) : (
            <>
              <TextField
                label="Recorrido"
                select
                fullWidth
                error={errors.recorridoId !== undefined}
                helperText={
                  errors.recorridoId?.message ??
                  (recorridosDisponibles.length === 0
                    ? 'No hay recorridos activos disponibles.'
                    : ' ')
                }
                {...register('recorridoId', { required: 'Elegí un recorrido.' })}
              >
                {recorridosDisponibles.map((recorrido) => (
                  <MenuItem key={recorrido.id} value={recorrido.id}>
                    {recorrido.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Repartidor"
                select
                fullWidth
                error={errors.repartidorId !== undefined}
                helperText={
                  errors.repartidorId?.message ??
                  (repartidoresDisponibles.length === 0
                    ? 'No hay repartidores activos disponibles.'
                    : ' ')
                }
                {...register('repartidorId', { required: 'Elegí un repartidor.' })}
              >
                {repartidoresDisponibles.map((repartidor) => (
                  <MenuItem key={repartidor.id} value={repartidor.id}>
                    {repartidor.nombreCompleto}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Fecha del reparto"
                type="datetime-local"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                error={errors.fechaReparto !== undefined}
                helperText={errors.fechaReparto?.message ?? ' '}
                {...register('fechaReparto', {
                  required: 'La fecha del reparto es obligatoria.',
                })}
              />
            </>
          )}

          {(consultaRecorridos.isError || consultaUsuarios.isError) && (
            <Alert severity="error">
              No se pudieron cargar los datos para crear el reparto.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" form="formulario-reparto" variant="contained" loading={guardando}>
          Crear reparto
        </Button>
      </DialogActions>
    </Dialog>
  )
}
