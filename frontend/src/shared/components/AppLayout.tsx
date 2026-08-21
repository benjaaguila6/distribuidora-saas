import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import Sidebar, { ANCHO_BARRA_LATERAL } from './Sidebar'

export default function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const enEscritorio = useMediaQuery((tema: Theme) => tema.breakpoints.up('md'))
  const [menuAbierto, setMenuAbierto] = useState(false)

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        abierta={enEscritorio || menuAbierto}
        variante={enEscritorio ? 'permanent' : 'temporary'}
        alCerrar={() => setMenuAbierto(false)}
      />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          ...(enEscritorio && {
            width: `calc(100% - ${ANCHO_BARRA_LATERAL}px)`,
            ml: `${ANCHO_BARRA_LATERAL}px`,
          }),
        }}
      >
        <Toolbar>
          {!enEscritorio && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Abrir menú de navegación"
              onClick={() => setMenuAbierto(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Distribuidora SAAS
          </Typography>
          {usuario !== null && (
            <>
              <Box
                sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right', mr: 2 }}
              >
                <Typography variant="body2">{usuario.nombreCompleto}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuario.rol}
                </Typography>
              </Box>
              <Tooltip title="Cerrar sesión">
                <IconButton color="inherit" onClick={manejarCerrarSesion}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
