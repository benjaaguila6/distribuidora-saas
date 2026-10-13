import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth'
import PageHeader from '../../shared/components/PageHeader'

const ROL_REPARTIDOR = 'Repartidor'

const accesos = [
  {
    titulo: 'Clientes',
    descripcion: 'Consultá los datos de contacto, saldos y estado de tus clientes.',
    ruta: '/clientes',
    icono: <PeopleAltOutlinedIcon />,
    ocultoParaRepartidor: true,
  },
  {
    titulo: 'Productos',
    descripcion: 'Administrá el catálogo, los precios y los tipos de envase.',
    ruta: '/productos',
    icono: <Inventory2OutlinedIcon />,
    ocultoParaRepartidor: true,
  },
  {
    titulo: 'Recorridos',
    descripcion: 'Organizá recorridos y consultá los clientes asignados.',
    ruta: '/recorridos',
    icono: <RouteOutlinedIcon />,
    ocultoParaRepartidor: true,
  },
  {
    titulo: 'Repartos',
    descripcion: 'Accedé a la planificación y al seguimiento de repartos.',
    ruta: '/repartos',
    icono: <LocalShippingOutlinedIcon />,
    ocultoParaRepartidor: false,
  },
]

export default function InicioPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const modulosVisibles = accesos.filter(
    (acceso) => usuario?.rol !== ROL_REPARTIDOR || !acceso.ocultoParaRepartidor,
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title={`Hola, ${usuario?.nombreCompleto.split(' ')[0] ?? 'bienvenido'}`}
        description="Bienvenido a tu panel de gestión. Elegí un módulo para continuar."
      />
      <Box>
        <Typography variant="h6" component="h2" sx={{ mb: 1.75 }}>
          Accesos directos
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {modulosVisibles.map((modulo) => (
            <Card key={modulo.ruta} sx={{ overflow: 'hidden' }}>
              <CardActionArea
                onClick={() => navigate(modulo.ruta)}
                sx={{
                  height: '100%',
                  '&:hover .modulo-icono': { backgroundColor: '#DCE7F8' },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2.5,
                    '&:last-child': { pb: 2.5 },
                  }}
                >
                  <Box
                    className="modulo-icono"
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '& .MuiSvgIcon-root': { fontSize: 23 },
                    }}
                  >
                    {modulo.icono}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1">{modulo.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                      {modulo.descripcion}
                    </Typography>
                  </Box>
                  <ArrowForwardIcon
                    fontSize="small"
                    sx={{ flexShrink: 0, color: 'text.secondary' }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
