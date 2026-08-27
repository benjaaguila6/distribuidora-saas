import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import PeopleIcon from '@mui/icons-material/People'
import RouteIcon from '@mui/icons-material/Route'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

export const ANCHO_BARRA_LATERAL = 260

const ROL_ADMINISTRADOR = 'Administrador'
const ROL_REPARTIDOR = 'Repartidor'

interface ItemNavegacion {
  texto: string
  ruta: string
  icono: ReactNode
  soloAdministrador?: boolean
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
    soloAdministrador: true,
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

  // El Repartidor solo ve los items que no estén marcados como ocultos para su rol.
  const esItemVisible = (item: ItemNavegacion) => {
    if (usuario?.rol === ROL_REPARTIDOR) return !item.ocultoParaRepartidor
    return !item.soloAdministrador || usuario?.rol === ROL_ADMINISTRADOR
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
        },
      }}
    >
      <Box sx={{ overflowY: 'auto' }}>
        <List>
          {ITEMS_NAVEGACION.filter(esItemVisible).map((item) => (
            <ListItemButton
              key={item.ruta}
              selected={esRutaActiva(item.ruta)}
              onClick={() => {
                navigate(item.ruta)
                alCerrar()
              }}
            >
              <ListItemIcon>{item.icono}</ListItemIcon>
              <ListItemText primary={item.texto} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
