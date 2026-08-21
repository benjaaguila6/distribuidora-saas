import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Distribuidora SAAS
          </Typography>
          {usuario !== null && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {usuario.nombreCompleto}
              </Typography>
              <Button color="inherit" onClick={manejarCerrarSesion}>
                Salir
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }} />
    </Box>
  )
}
