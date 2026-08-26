import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
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
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../auth/hooks/useAuth'
import type { ClienteResponse } from '../types'
import { useClientesQuery } from '../hooks/useClientesQuery'
import { useDesactivarClienteMutation } from '../hooks/useDesactivarClienteMutation'
import { useReactivarClienteMutation } from '../hooks/useReactivarClienteMutation'
import { useValorConDebounce } from '../hooks/useValorConDebounce'
import ClienteFormDialog, { type ModoFormularioCliente } from './ClienteFormDialog'
import DialogoConfirmacion from '../../../shared/components/DialogoConfirmacion'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const OPCIONES_TAMANO_PAGINA = [10, 25, 50]
const DEMORA_BUSQUEDA_MS = 400
const CANTIDAD_FILAS_SKELETON = 8
const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export default function ClientesListPage() {
  const { usuario } = useAuth()
  const puedeEditar = usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE
  const puedeGestionarEstado = usuario?.rol === ROL_ADMINISTRADOR

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const busqueda = useValorConDebounce(textoBusqueda, DEMORA_BUSQUEDA_MS)
  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])

  const [modoDialogo, setModoDialogo] = useState<ModoFormularioCliente>('crear')
  const [clienteEnEdicion, setClienteEnEdicion] = useState<ClienteResponse | null>(null)
  const [dialogoFormularioAbierto, setDialogoFormularioAbierto] = useState(false)
  const [clienteADesactivar, setClienteADesactivar] = useState<ClienteResponse | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const consulta = useClientesQuery(pagina, tamanoPagina, busqueda)
  const mutacionDesactivar = useDesactivarClienteMutation()
  const mutacionReactivar = useReactivarClienteMutation()

  const clientes = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const cargando = consulta.isLoading
  const accionesVisibles = puedeEditar || puedeGestionarEstado

  const abrirCreacion = () => {
    setModoDialogo('crear')
    setClienteEnEdicion(null)
    setDialogoFormularioAbierto(true)
  }

  const abrirEdicion = (cliente: ClienteResponse) => {
    setModoDialogo('editar')
    setClienteEnEdicion({ ...cliente })
    setDialogoFormularioAbierto(true)
  }

  const cerrarDialogoFormulario = () => {
    setDialogoFormularioAbierto(false)
    setClienteEnEdicion(null)
  }

  const manejarConfirmarDesactivacion = async () => {
    if (clienteADesactivar === null) return
    setErrorAccion(null)
    try {
      await mutacionDesactivar.mutateAsync(clienteADesactivar.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo desactivar el cliente.'),
      )
    } finally {
      setClienteADesactivar(null)
    }
  }

  const manejarReactivacion = async (cliente: ClienteResponse) => {
    setErrorAccion(null)
    try {
      await mutacionReactivar.mutateAsync(cliente.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo reactivar el cliente.'),
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
          Clientes
        </Typography>
        {puedeEditar && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCreacion}>
            Nuevo cliente
          </Button>
        )}
      </Box>

      <TextField
        label="Buscar por nombre"
        placeholder="Buscar por nombre…"
        size="small"
        fullWidth
        value={textoBusqueda}
        onChange={(evento) => {
          setTextoBusqueda(evento.target.value)
          setPagina(1)
        }}
        slotProps={{
          input: {
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          },
        }}
      />

      {errorAccion !== null && <Alert severity="error">{errorAccion}</Alert>}

      <Paper>
        <TableContainer>
          <Table aria-label="Listado de clientes">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Saldo deuda</TableCell>
                <TableCell align="right">Saldo envases</TableCell>
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
                  <TableCell colSpan={accionesVisibles ? 7 : 6}>
                    <Alert severity="error">
                      Ocurrió un error al cargar los clientes.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={accionesVisibles ? 7 : 6}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      {busqueda.length > 0
                        ? 'No hay clientes que coincidan con la búsqueda.'
                        : 'Todavía no hay clientes registrados.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id} hover>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.direccion}</TableCell>
                    <TableCell>{cliente.telefono ?? '—'}</TableCell>
                    <TableCell align="right">
                      {formatoMoneda.format(cliente.saldoDeudaActual)}
                    </TableCell>
                    <TableCell align="right">{cliente.saldoEnvasesActual}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={cliente.estado}
                        color={cliente.estado === 'Activo' ? 'success' : 'error'}
                      />
                    </TableCell>
                    {accionesVisibles && (
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                          {puedeEditar && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                aria-label={`Editar ${cliente.nombre}`}
                                onClick={() => abrirEdicion(cliente)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {puedeGestionarEstado && cliente.estado === 'Activo' && (
                            <Tooltip title="Desactivar">
                              <IconButton
                                size="small"
                                aria-label={`Desactivar ${cliente.nombre}`}
                                onClick={() => setClienteADesactivar(cliente)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {puedeGestionarEstado && cliente.estado === 'Inactivo' && (
                            <Tooltip title="Reactivar">
                              <IconButton
                                size="small"
                                aria-label={`Reactivar ${cliente.nombre}`}
                                onClick={() => void manejarReactivacion(cliente)}
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

      <ClienteFormDialog
        modo={modoDialogo}
        cliente={clienteEnEdicion ?? undefined}
        open={dialogoFormularioAbierto}
        onClose={cerrarDialogoFormulario}
      />

      <DialogoConfirmacion
        abierto={clienteADesactivar !== null}
        titulo="Desactivar cliente"
        mensaje={
          clienteADesactivar !== null
            ? `¿Seguro que querés desactivar a «${clienteADesactivar.nombre}»? El cliente dejará de estar disponible para nuevas operaciones.`
            : ''
        }
        textoConfirmar="Desactivar"
        colorConfirmar="error"
        cargando={mutacionDesactivar.isPending}
        onConfirmar={() => void manejarConfirmarDesactivacion()}
        onCancelar={() => setClienteADesactivar(null)}
      />
    </Box>
  )
}
