import { Navigate, Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../hooks/useAuth'

export default function RutaProtegida() {
  const { estaCargando, usuario } = useAuth()

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

  return <Outlet />
}
