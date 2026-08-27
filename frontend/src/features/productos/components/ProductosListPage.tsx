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
import type { ProductoResponse } from '../types'
import { ETIQUETAS_TIPO_ENVASE } from '../types'
import { useProductosQuery } from '../hooks/useProductosQuery'
import { useDesactivarProductoMutation } from '../hooks/useDesactivarProductoMutation'
import { useReactivarProductoMutation } from '../hooks/useReactivarProductoMutation'
import { useValorConDebounce } from '../hooks/useValorConDebounce'
import ProductoFormDialog, { type ModoFormularioProducto } from './ProductoFormDialog'
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

export default function ProductosListPage() {
  const { usuario } = useAuth()
  const puedeEditar = usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE
  const puedeGestionarEstado = usuario?.rol === ROL_ADMINISTRADOR

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const busqueda = useValorConDebounce(textoBusqueda, DEMORA_BUSQUEDA_MS)
  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])

  const [modoDialogo, setModoDialogo] = useState<ModoFormularioProducto>('crear')
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoResponse | null>(null)
  const [dialogoFormularioAbierto, setDialogoFormularioAbierto] = useState(false)
  const [productoADesactivar, setProductoADesactivar] = useState<ProductoResponse | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const consulta = useProductosQuery(pagina, tamanoPagina, busqueda)
  const mutacionDesactivar = useDesactivarProductoMutation()
  const mutacionReactivar = useReactivarProductoMutation()

  const productos = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const cargando = consulta.isLoading
  const accionesVisibles = puedeEditar || puedeGestionarEstado
  const cantidadColumnas = accionesVisibles ? 6 : 5

  const abrirCreacion = () => {
    setModoDialogo('crear')
    setProductoEnEdicion(null)
    setDialogoFormularioAbierto(true)
  }

  const abrirEdicion = (producto: ProductoResponse) => {
    setModoDialogo('editar')
    setProductoEnEdicion({ ...producto })
    setDialogoFormularioAbierto(true)
  }

  const cerrarDialogoFormulario = () => {
    setDialogoFormularioAbierto(false)
    setProductoEnEdicion(null)
  }

  const manejarConfirmarDesactivacion = async () => {
    if (productoADesactivar === null) return
    setErrorAccion(null)
    try {
      await mutacionDesactivar.mutateAsync(productoADesactivar.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo desactivar el producto.'),
      )
    } finally {
      setProductoADesactivar(null)
    }
  }

  const manejarReactivacion = async (producto: ProductoResponse) => {
    setErrorAccion(null)
    try {
      await mutacionReactivar.mutateAsync(producto.id)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo reactivar el producto.'),
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
          Productos
        </Typography>
        {puedeEditar && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCreacion}>
            Nuevo producto
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
          <Table aria-label="Listado de productos">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Costo</TableCell>
                <TableCell>Tipo de envase</TableCell>
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
                    {accionesVisibles && (
                      <TableCell align="right"><Skeleton /></TableCell>
                    )}
                  </TableRow>
                ))
              ) : consulta.isError ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Alert severity="error">
                      Ocurrió un error al cargar los productos.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={cantidadColumnas}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      {busqueda.length > 0
                        ? 'No hay productos que coincidan con la búsqueda.'
                        : 'Todavía no hay productos registrados.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto) => (
                  <TableRow key={producto.id} hover>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell align="right">
                      {formatoMoneda.format(producto.precio)}
                    </TableCell>
                    <TableCell align="right">
                      {formatoMoneda.format(producto.costo)}
                    </TableCell>
                    <TableCell>{ETIQUETAS_TIPO_ENVASE[producto.tipoEnvase]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={producto.activo ? 'Activo' : 'Inactivo'}
                        color={producto.activo ? 'success' : 'error'}
                      />
                    </TableCell>
                    {accionesVisibles && (
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                          {puedeEditar && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                aria-label={`Editar ${producto.nombre}`}
                                onClick={() => abrirEdicion(producto)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {puedeGestionarEstado && producto.activo && (
                            <Tooltip title="Desactivar">
                              <IconButton
                                size="small"
                                aria-label={`Desactivar ${producto.nombre}`}
                                onClick={() => setProductoADesactivar(producto)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {puedeGestionarEstado && !producto.activo && (
                            <Tooltip title="Reactivar">
                              <IconButton
                                size="small"
                                aria-label={`Reactivar ${producto.nombre}`}
                                onClick={() => void manejarReactivacion(producto)}
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

      <ProductoFormDialog
        modo={modoDialogo}
        producto={productoEnEdicion ?? undefined}
        open={dialogoFormularioAbierto}
        onClose={cerrarDialogoFormulario}
      />

      <DialogoConfirmacion
        abierto={productoADesactivar !== null}
        titulo="Desactivar producto"
        mensaje={
          productoADesactivar !== null
            ? `¿Seguro que querés desactivar «${productoADesactivar.nombre}»? El producto dejará de estar disponible para nuevas operaciones.`
            : ''
        }
        textoConfirmar="Desactivar"
        colorConfirmar="error"
        cargando={mutacionDesactivar.isPending}
        onConfirmar={() => void manejarConfirmarDesactivacion()}
        onCancelar={() => setProductoADesactivar(null)}
      />
    </Box>
  )
}
