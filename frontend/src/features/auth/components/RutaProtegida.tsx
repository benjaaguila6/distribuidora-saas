import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../hooks/useAuth'

const RUTA_CAMBIO_PASSWORD = '/cambiar-password'

export default function RutaProtegida() {
  const { estaCargando, usuario } = useAuth()
  const location = useLocation()

  if (estaCargando) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (usuario === null) {
    return <Navigate to="/login" replace />
  }

  // Mientras el cambio de contraseña esté pendiente, cualquier otra ruta
  // redirige al formulario. La propia ruta de cambio queda exenta para evitar
  // un bucle de redirecciones.
  const enCambioPassword = location.pathname === RUTA_CAMBIO_PASSWORD

  if (usuario.debeCambiarPassword && !enCambioPassword) {
    return <Navigate to={RUTA_CAMBIO_PASSWORD} replace />
  }

  return <Outlet />
}
