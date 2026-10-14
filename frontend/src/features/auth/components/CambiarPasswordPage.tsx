import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Navigate } from 'react-router-dom'
import { cambiarPassword } from '../api/authService'
import { useAuth } from '../hooks/useAuth'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

interface CambiarPasswordForm {
  passwordActual: string
  passwordNueva: string
  confirmarPassword: string
}

interface ErrorValidacionApi {
  campo: string
  mensaje: string
}

// El backend devuelve el nombre del campo en PascalCase (PropertyName de C#);
// los campos del formulario están en camelCase.
function normalizarCampo(campo: string): string {
  if (campo.length === 0) return campo
  return campo.charAt(0).toLowerCase() + campo.slice(1)
}

function extraerErroresDeValidacion(error: unknown): ErrorValidacionApi[] {
  if (!axios.isAxiosError(error)) return []
  const data: unknown = error.response?.data
  if (typeof data !== 'object' || data === null) return []
  const errores = (data as { errores?: unknown }).errores
  if (!Array.isArray(errores)) return []
  return errores
    .filter(
      (item): item is { campo: string; mensaje: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { campo?: unknown }).campo === 'string' &&
        typeof (item as { mensaje?: unknown }).mensaje === 'string',
    )
    .map((item) => ({ campo: normalizarCampo(item.campo), mensaje: item.mensaje }))
}

export default function CambiarPasswordPage() {
  const { usuario, actualizarSesionTrasCambioPassword } = useAuth()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CambiarPasswordForm>()

  if (usuario !== null && !usuario.debeCambiarPassword) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (valores) => {
    setErrorGeneral(null)

    if (valores.passwordNueva === valores.passwordActual) {
      setError('passwordNueva', {
        type: 'validacion',
        message: 'La contraseña nueva debe ser distinta de la actual.',
      })
      return
    }

    if (valores.passwordNueva !== valores.confirmarPassword) {
      setError('confirmarPassword', {
        type: 'validacion',
        message: 'Las contraseñas no coinciden.',
      })
      return
    }

    try {
      const respuesta = await cambiarPassword({
        passwordActual: valores.passwordActual,
        passwordNueva: valores.passwordNueva,
      })
      actualizarSesionTrasCambioPassword(respuesta)
    } catch (error) {
      const erroresCampos = extraerErroresDeValidacion(error)
      if (erroresCampos.length > 0) {
        for (const { campo, mensaje } of erroresCampos) {
          if (campo === 'passwordActual' || campo === 'passwordNueva') {
            setError(campo, { type: 'server', message: mensaje })
          } else {
            setErrorGeneral(mensaje)
          }
        }
        return
      }
      setErrorGeneral(
        obtenerMensajeErrorApi(error, 'No se pudo cambiar la contraseña. Intentá nuevamente.'),
      )
    }
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        background:
          'radial-gradient(circle at 15% 15%, rgba(40, 87, 164, 0.08), transparent 32%), #F5F7FA',
      }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, mb: 0.5 }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              color: 'primary.main',
              backgroundColor: 'primary.light',
            }}
          >
            <Inventory2OutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
              Distribuidora SAAS
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gestión comercial
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
          <Typography variant="h5" component="h1">
            Cambiar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Por seguridad, definí una contraseña propia antes de continuar.
          </Typography>
        </Box>
        {errorGeneral !== null ? <Alert severity="error">{errorGeneral}</Alert> : null}
        <TextField
          label="Contraseña actual"
          type="password"
          fullWidth
          autoFocus
          autoComplete="current-password"
          error={errors.passwordActual !== undefined}
          helperText={errors.passwordActual?.message}
          {...register('passwordActual', {
            required: 'La contraseña actual es obligatoria.',
          })}
        />
        <TextField
          label="Contraseña nueva"
          type="password"
          fullWidth
          autoComplete="new-password"
          error={errors.passwordNueva !== undefined}
          helperText={
            errors.passwordNueva?.message ??
            'Mínimo 8 caracteres, una mayúscula y un número.'
          }
          {...register('passwordNueva', {
            required: 'La contraseña nueva es obligatoria.',
            minLength: {
              value: 8,
              message: 'La contraseña debe tener al menos 8 caracteres.',
            },
            validate: {
              mayuscula: (valor) =>
                /[A-Z]/.test(valor) || 'La contraseña debe tener al menos una mayúscula.',
              numero: (valor) =>
                /[0-9]/.test(valor) || 'La contraseña debe tener al menos un número.',
            },
          })}
        />
        <TextField
          label="Confirmar contraseña nueva"
          type="password"
          fullWidth
          autoComplete="new-password"
          error={errors.confirmarPassword !== undefined}
          helperText={errors.confirmarPassword?.message}
          {...register('confirmarPassword', {
            required: 'Debés confirmar la contraseña nueva.',
          })}
        />
        <Button type="submit" variant="contained" loading={isSubmitting}>
          Cambiar contraseña
        </Button>
      </Paper>
    </Box>
  )
}
