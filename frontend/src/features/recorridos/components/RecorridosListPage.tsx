import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import type { RecorridoEnLista } from '../types'
import { useRecorridosQuery } from '../hooks/useRecorridosQuery'
import { useDesactivarRecorridoMutation } from '../hooks/useDesactivarRecorridoMutation'
import { useReactivarRecorridoMutation } from '../hooks/useReactivarRecorridoMutation'
import RecorridoFormDialog from './RecorridoFormDialog'
import DialogoConfirmacion from '../../../shared/components/DialogoConfirmacion'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const OPCIONES_TAMANO_PAGINA = [10, 25, 50]
const CANTIDAD_FILAS_SKELETON = 8
const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'

export default function RecorridosListPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const puedeEditar = usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE
  const puedeGestionarEstado = usuario?.rol === ROL_ADMINISTRADOR

  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])
  const [dialogoFormularioAbierto, setDialogoFormularioAbierto] = useState(false)
  const [recorridoADesactivar, setRecorridoADesactivar] = useState<RecorridoEnLista | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const consulta = useRecorridosQuery(pagina, tamanoPagina)
  const mutacionDesactivar = useDesactivarRecorridoMutation()
  const mutacionReactivar = useReactivarRecorridoMutation()

  const recorridos = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const cargando = consulta.isLoading
  const accionesVisibles = puedeEditar || puedeGestionarEstado
  const cantidadColumnas = accionesVisibles ? 5 : 4

  const manejarConfirmarDesactivacion = async () => {
    if (recorridoADesactivar === null) return
    setErrorAccion(null)
    try {
      await mutacionDesactivar.mutateAsync(recorridoADesactivar.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo desactivar el recorrido.'),
      )
    } finally {
      setRecorridoADesactivar(null)
    }
  }

  const manejarReactivacion = async (recorrido: RecorridoEnLista) => {
    setErrorAccion(null)
    try {
      await mutacionReactivar.mutateAsync(recorrido.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo reactivar el recorrido.'),
      )
    }
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
          Recorridos
        </Typography>
        {puedeEditar && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogoFormularioAbierto(true)}
          >
            Nuevo recorrido
          </Button>
        )}
      </Box>

      {errorAccion !== null && <Alert severity="error">{errorAccion}</Alert>}

      <Paper>
        <TableContainer>
          <Table aria-label="Listado de recorridos">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Día de la semana</TableCell>
                <TableCell>Estado</TableCell>
                {accionesVisibles && <TableCell align="right">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                Array.from({ length: CANTIDAD_FILAS_SKELETON }).map((_, indice) => (
                  <TableRow key={`skeleton-${indice}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    {accionesVisibles && (
                      <TableCell align="right"><Skeleton /></TableCell>
                    )}
                  </TableRow>
                ))
              ) : consulta.isError ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Alert severity="error">
                      Ocurrió un error al cargar los recorridos.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : recorridos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Todavía no hay recorridos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recorridos.map((recorrido) => (
                  <TableRow key={recorrido.id} hover>
                    <TableCell>{recorrido.nombre}</TableCell>
                    <TableCell>{recorrido.diaSemana}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={recorrido.activo ? 'Activo' : 'Inactivo'}
                        color={recorrido.activo ? 'success' : 'error'}
                      />
                    </TableCell>
                    {accionesVisibles && (
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              aria-label={`Ver detalle de ${recorrido.nombre}`}
                              onClick={() => navigate(`/recorridos/${recorrido.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {puedeGestionarEstado && recorrido.activo && (
                            <Tooltip title="Desactivar">
                              <IconButton
                                size="small"
                                aria-label={`Desactivar ${recorrido.nombre}`}
                                onClick={() => setRecorridoADesactivar(recorrido)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {puedeGestionarEstado && !recorrido.activo && (
                            <Tooltip title="Reactivar">
                              <IconButton
                                size="small"
                                aria-label={`Reactivar ${recorrido.nombre}`}
                                onClick={() => void manejarReactivacion(recorrido)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
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

      <RecorridoFormDialog
        open={dialogoFormularioAbierto}
        onClose={() => setDialogoFormularioAbierto(false)}
      />

      <DialogoConfirmacion
        abierto={recorridoADesactivar !== null}
        titulo="Desactivar recorrido"
        mensaje={
          recorridoADesactivar !== null
            ? `¿Seguro que querés desactivar «${recorridoADesactivar.nombre}»? El recorrido dejará de estar disponible para nuevos repartos.`
            : ''
        }
        textoConfirmar="Desactivar"
        colorConfirmar="error"
        cargando={mutacionDesactivar.isPending}
        onConfirmar={() => void manejarConfirmarDesactivacion()}
        onCancelar={() => setRecorridoADesactivar(null)}
      />
    </Box>
  )
}
