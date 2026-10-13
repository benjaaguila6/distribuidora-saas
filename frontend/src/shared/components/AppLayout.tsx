import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import { useState, type MouseEvent } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import Sidebar, { ANCHO_BARRA_LATERAL } from './Sidebar'

export default function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const enEscritorio = useMediaQuery((tema: Theme) => tema.breakpoints.up('md'))
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [anclaMenuCuenta, setAnclaMenuCuenta] = useState<HTMLElement | null>(null)

  const manejarCerrarSesion = () => {
    setAnclaMenuCuenta(null)
    cerrarSesion()
    navigate('/login')
  }

  const abrirMenuCuenta = (evento: MouseEvent<HTMLElement>) => {
    setAnclaMenuCuenta(evento.currentTarget)
  }

  const inicialUsuario = usuario?.nombreCompleto.trim().charAt(0).toUpperCase() ?? 'U'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar
        abierta={enEscritorio || menuAbierto}
        variante={enEscritorio ? 'permanent' : 'temporary'}
        alCerrar={() => setMenuAbierto(false)}
      />
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ...(enEscritorio && {
            width: `calc(100% - ${ANCHO_BARRA_LATERAL}px)`,
            ml: `${ANCHO_BARRA_LATERAL}px`,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: '68px !important', px: { xs: 2, sm: 3 } }}>
          {!enEscritorio && (
            <IconButton
              edge="start"
              aria-label="Abrir menú de navegación"
              onClick={() => setMenuAbierto(true)}
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" component="div" sx={{ lineHeight: 1.3 }}>
              Distribuidora SAAS
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.4 }}
            >
              Panel de gestión
            </Typography>
          </Box>
          {usuario !== null && (
            <ButtonBasePerfil
              nombre={usuario.nombreCompleto}
              rol={usuario.rol}
              inicial={inicialUsuario}
              onClick={abrirMenuCuenta}
            />
          )}
          <Menu
            anchorEl={anclaMenuCuenta}
            open={anclaMenuCuenta !== null}
            onClose={() => setAnclaMenuCuenta(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 190, mt: 1 } } }}
          >
            <MenuItem disabled sx={{ opacity: '1 !important', py: 1.25 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  {usuario?.nombreCompleto}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuario?.rol}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={manejarCerrarSesion} sx={{ gap: 1.25, py: 1.1 }}>
              <LogoutIcon fontSize="small" color="action" />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, backgroundColor: 'background.default' }}>
        <Toolbar sx={{ minHeight: '68px !important' }} />
        <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 3.5 }, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

interface ButtonBasePerfilProps {
  nombre: string
  rol: string
  inicial: string
  onClick: (evento: MouseEvent<HTMLElement>) => void
}

function ButtonBasePerfil({ nombre, rol, inicial, onClick }: ButtonBasePerfilProps) {
  return (
    <Tooltip title="Menú de cuenta">
      <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-label={`Menú de cuenta de ${nombre}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: 0,
          background: 'transparent',
          color: 'text.primary',
          cursor: 'pointer',
          borderRadius: 2,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: '#F5F7FA' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {inicial}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
            {nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rol}
          </Typography>
        </Box>
        <KeyboardArrowDownIcon
          fontSize="small"
          sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}
        />
      </Box>
    </Tooltip>
  )
}
