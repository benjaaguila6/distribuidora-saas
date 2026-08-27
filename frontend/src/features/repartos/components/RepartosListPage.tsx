import VisibilityIcon from '@mui/icons-material/Visibility'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useRepartosQuery } from '../hooks/useRepartosQuery'
import ChipEstadoReparto from './ChipEstadoReparto'

const OPCIONES_TAMANO_PAGINA = [10, 25, 50]
const CANTIDAD_FILAS_SKELETON = 8
const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'
const ROL_REPARTIDOR = 'Repartidor'

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })

function formatearFecha(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFecha.format(instante)
}

function recortarIdentificador(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

export default function RepartosListPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const esRepartidor = usuario?.rol === ROL_REPARTIDOR
  const seMuestraRepartidor =
    usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE

  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])

  // El Repartidor solo consulta la primera página de 1 item: el backend ya
  // devuelve únicamente los repartos EnCurso asignados a ese repartidor.
  const consulta = useRepartosQuery(esRepartidor ? 1 : pagina, esRepartidor ? 1 : tamanoPagina)
  const repartos = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const cargando = consulta.isLoading
  const cantidadColumnas = seMuestraRepartidor ? 5 : 4

  if (esRepartidor) {
    if (cargando) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (consulta.isError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" component="h1">
            Repartos
          </Typography>
          <Alert severity="error">Ocurrió un error al cargar los repartos.</Alert>
        </Box>
      )
    }

    const repartoEnCurso = repartos[0]
    if (repartoEnCurso !== undefined) {
      return <Navigate to={`/repartos/${repartoEnCurso.id}`} replace />
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1">
          Repartos
        </Typography>
        <Alert severity="info">No tenés ningún reparto en curso.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h5" component="h1">
          Repartos
        </Typography>
      </Box>

      <Paper>
        <TableContainer>
          <Table aria-label="Listado de repartos">
            <TableHead>
              <TableRow>
                <TableCell>Recorrido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                {seMuestraRepartidor && <TableCell>Repartidor</TableCell>}
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                Array.from({ length: CANTIDAD_FILAS_SKELETON }).map((_, indice) => (
                  <TableRow key={`skeleton-${indice}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    {seMuestraRepartidor && <TableCell><Skeleton /></TableCell>}
                    <TableCell align="right"><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : consulta.isError ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Alert severity="error">
                      Ocurrió un error al cargar los repartos.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : repartos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Todavía no hay repartos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                repartos.map((reparto) => (
                  <TableRow key={reparto.id} hover>
                    <TableCell>
                      <Tooltip title={`ID del recorrido: ${reparto.recorridoId}`}>
                        <span>{recortarIdentificador(reparto.recorridoId)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatearFecha(reparto.fechaReparto)}</TableCell>
                    <TableCell>
                      <ChipEstadoReparto estado={reparto.estado} />
                    </TableCell>
                    {seMuestraRepartidor && (
                      <TableCell>
                        <Tooltip title={`ID del repartidor: ${reparto.repartidorId}`}>
                          <span>{recortarIdentificador(reparto.repartidorId)}</span>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/repartos/${reparto.id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={pagina - 1}
          onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina + 1)}
          rowsPerPage={tamanoPagina}
          rowsPerPageOptions={OPCIONES_TAMANO_PAGINA}
          onRowsPerPageChange={(evento) => {
            setTamanoPagina(Number(evento.target.value))
            setPagina(1)
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>
    </Box>
  )
}