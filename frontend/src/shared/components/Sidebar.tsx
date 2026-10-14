import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import PeopleIcon from '@mui/icons-material/People'
import RouteIcon from '@mui/icons-material/Route'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

export const ANCHO_BARRA_LATERAL = 260

const ROL_REPARTIDOR = 'Repartidor'

interface ItemNavegacion {
  texto: string
  ruta: string
  icono: ReactNode
  ocultoParaRepartidor?: boolean
}

const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { texto: 'Inicio', ruta: '/', icono: <DashboardIcon />, ocultoParaRepartidor: true },
  { texto: 'Clientes', ruta: '/clientes', icono: <PeopleIcon />, ocultoParaRepartidor: true },
  { texto: 'Productos', ruta: '/productos', icono: <Inventory2Icon />, ocultoParaRepartidor: true },
  { texto: 'Recorridos', ruta: '/recorridos', icono: <RouteIcon />, ocultoParaRepartidor: true },
  { texto: 'Repartos', ruta: '/repartos', icono: <LocalShippingIcon /> },
  {
    texto: 'Usuarios',
    ruta: '/usuarios',
    icono: <ManageAccountsIcon />,
    ocultoParaRepartidor: true,
  },
]

interface SidebarProps {
  abierta: boolean
  variante: 'permanent' | 'temporary'
  alCerrar: () => void
}

export default function Sidebar({ abierta, variante, alCerrar }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const esRutaActiva = (ruta: string) =>
    ruta === '/' ? location.pathname === '/' : location.pathname.startsWith(ruta)

  // El Repartidor solo ve los items que no estén marcados como ocultos para su
  // rol. Administrador y Gerente ven el resto del menú.
  const esItemVisible = (item: ItemNavegacion) => {
    if (usuario?.rol === ROL_REPARTIDOR) return !item.ocultoParaRepartidor
    return true
  }

  return (
    <Drawer
      variant={variante}
      open={abierta}
      onClose={alCerrar}
      sx={{
        width: ANCHO_BARRA_LATERAL,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: ANCHO_BARRA_LATERAL,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            borderRadius: 2,
            color: 'primary.main',
            backgroundColor: 'primary.light',
          }}
        >
          <Inventory2OutlinedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', lineHeight: 1.25 }}>
            Distribuidora
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestión comercial
          </Typography>
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', px: 1.5, py: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', px: 1.5, mb: 0.75, fontWeight: 700, letterSpacing: '0.08em' }}
        >
          Menú principal
        </Typography>
        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {ITEMS_NAVEGACION.filter(esItemVisible).map((item) => (
            <ListItemButton
              key={item.ruta}
              selected={esRutaActiva(item.ruta)}
              onClick={() => {
                navigate(item.ruta)
                alCerrar()
              }}
              sx={{
                minHeight: 44,
                px: 1.5,
                borderRadius: 2,
                color: 'text.secondary',
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
                '&.Mui-selected': {
                  color: 'primary.dark',
                  backgroundColor: 'primary.light',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 9,
                    bottom: 9,
                    width: 3,
                    borderRadius: '0 3px 3px 0',
                    backgroundColor: 'primary.main',
                  },
                  '&:hover': { backgroundColor: 'primary.light' },
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiTypography-root': { fontWeight: 700 },
                },
                '&:hover': { backgroundColor: '#F5F7FA', color: 'text.primary' },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}>
                {item.icono}
              </ListItemIcon>
              <ListItemText primary={item.texto} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
