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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface LoginForm {
  email: string
  password: string
}

function obtenerMensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'string' && data.length > 0) {
      return data
    }
    if (error.response !== undefined) {
      return 'Ocurrió un error al intentar iniciar sesión.'
    }
    return 'No se pudo conectar con el servidor.'
  }
  return 'Ocurrió un error inesperado.'
}

export default function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = handleSubmit(async (valores) => {
    setErrorGeneral(null)
    try {
      await iniciarSesion(valores.email, valores.password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorGeneral(obtenerMensajeDeError(error))
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
        sx={{
          width: '100%',
          maxWidth: 420,
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
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ingresá tus credenciales para continuar.
          </Typography>
        </Box>
        {errorGeneral !== null ? <Alert severity="error">{errorGeneral}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          fullWidth
          autoComplete="email"
          error={errors.email !== undefined}
          helperText={errors.email?.message}
          {...register('email', { required: 'El email es obligatorio.' })}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          autoComplete="current-password"
          error={errors.password !== undefined}
          helperText={errors.password?.message}
          {...register('password', { required: 'La contraseña es obligatoria.' })}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Ingresar
        </Button>
      </Paper>
    </Box>
  )
}
