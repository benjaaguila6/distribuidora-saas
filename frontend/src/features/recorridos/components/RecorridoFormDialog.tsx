import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useCrearRecorridoMutation } from '../hooks/useCrearRecorridoMutation'
import type { DiaSemana } from '../types'
import { DIAS_SEMANA_ORDEN } from '../types'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

interface ValoresFormularioRecorrido {
  nombre: string
  diaSemana: DiaSemana
}

interface RecorridoFormDialogProps {
  open: boolean
  onClose: () => void
}

export default function RecorridoFormDialog({ open, onClose }: RecorridoFormDialogProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionCrear = useCrearRecorridoMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValoresFormularioRecorrido>({
    defaultValues: { nombre: '', diaSemana: 'Lunes' },
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
        nombre: valores.nombre.trim(),
        diaSemana: valores.diaSemana,
      })
      manejarCierre()
    } catch (error) {
      setErrorServidor(
        obtenerMensajeErrorApi(error, 'No se pudo crear el recorrido.'),
      )
    }
  })

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo recorrido</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-recorrido"
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
                value: 150,
                message: 'El nombre no puede superar los 150 caracteres.',
              },
            })}
          />
          <TextField
            label="Día de la semana"
            select
            required
            fullWidth
            defaultValue="Lunes"
            error={errors.diaSemana !== undefined}
            helperText={errors.diaSemana?.message}
            {...register('diaSemana', { required: 'El día de la semana es obligatorio.' })}
          >
            {DIAS_SEMANA_ORDEN.map((dia) => (
              <MenuItem key={dia} value={dia}>
                {dia}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" form="formulario-recorrido" variant="contained" loading={guardando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
