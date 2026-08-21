import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
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
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        sx={{ width: '100%', maxWidth: 400, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="h5" sx={{ textAlign: 'center' }}>
          Iniciar sesión
        </Typography>
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
