import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SearchIcon from '@mui/icons-material/Search'
import InventoryIcon from '@mui/icons-material/Inventory'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import CancelIcon from '@mui/icons-material/Cancel'
import HistoryIcon from '@mui/icons-material/History'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DialogoConfirmacion from '../../../shared/components/DialogoConfirmacion'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'
import { useAuth } from '../../auth/hooks/useAuth'
import RegistrarVentaDialog from '../../ventas/components/RegistrarVentaDialog'
import { clavesVentas } from '../../ventas/hooks/clavesVentas'
import { useClientesParaVentaQuery } from '../../ventas/hooks/useClientesParaVentaQuery'
import { useValorConDebounce } from '../../ventas/hooks/useValorConDebounce'
import { useVentasDeRepartoQuery } from '../../ventas/hooks/useVentasDeRepartoQuery'
import type { ClienteSeleccionado, VentaPago, VentaProducto } from '../../ventas/types'
import { clavesRepartos } from '../hooks/clavesRepartos'
import { useCancelarRepartoMutation } from '../hooks/useCancelarRepartoMutation'
import { useIniciarRepartoMutation } from '../hooks/useIniciarRepartoMutation'
import { useRecorridoQuery } from '../hooks/useRecorridoQuery'
import { useCierreRepartoQuery } from '../hooks/useCierreRepartoQuery'
import { useRepartoQuery } from '../hooks/useRepartoQuery'
import AgregarStockInicialDialog from './AgregarStockInicialDialog'
import ChipEstadoReparto from './ChipEstadoReparto'
import DialogoCierreReparto from './DialogoCierreReparto'
import HistorialVentasClienteDialog from './HistorialVentasClienteDialog'
import ResumenFinalizacionReparto from './ResumenFinalizacionReparto'

const DEMORA_BUSQUEDA_MS = 400
const CANTIDAD_FILAS_SKELETON_VENTAS = 5
const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })
const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatearFecha(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFecha.format(instante)
}

function formatearFechaHora(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFechaHora.format(instante)
}

function resumenProductos(productos: VentaProducto[]): string {
  return productos
    .map((producto) => `${producto.cantidad}× ${producto.nombreProducto} (${producto.tipoMovimiento})`)
    .join(' · ')
}

function resumenPagos(pagos: VentaPago[]): string {
  return pagos
    .map((pago) => {
      if (pago.formaPago === 'Efectivo') {
        return (
          `Efectivo ${formatoMoneda.format(pago.monto)}` +
          ` (entregó ${formatoMoneda.format(pago.importeEntregadoPorCliente ?? 0)},` +
          ` vuelto ${formatoMoneda.format(pago.vuelto ?? 0)})`
        )
      }
      return `${pago.formaPago} ${formatoMoneda.format(pago.monto)}`
    })
    .join(' · ')
}

export default function RepartoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { usuario } = useAuth()

  const repartoId = id ?? ''
  const consultaReparto = useRepartoQuery(repartoId)
  const reparto = consultaReparto.data
  const consultaRecorrido = useRecorridoQuery(reparto?.recorridoId ?? '')
  const consultaVentas = useVentasDeRepartoQuery(repartoId)
  const esFinalizado = reparto?.estado === 'Finalizado'
  const consultaCierre = useCierreRepartoQuery(repartoId, esFinalizado)

  const esGestion = usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE
  const mutacionIniciar = useIniciarRepartoMutation()
  const mutacionCancelar = useCancelarRepartoMutation()

  const [dialogoVentaAbierto, setDialogoVentaAbierto] = useState(false)
  const [indiceAperturaVenta, setIndiceAperturaVenta] = useState(0)
  const [dialogoStockAbierto, setDialogoStockAbierto] = useState(false)
  const [dialogoCierreAbierto, setDialogoCierreAbierto] = useState(false)
  const [dialogoHistorialCliente, setDialogoHistorialCliente] = useState<{
    clienteId: string
    clienteNombre: string
    abierto: boolean
  } | null>(null)
  const [confirmarCancelar, setConfirmarCancelar] = useState(false)
  const [errorGestion, setErrorGestion] = useState<string | null>(null)
  const [clienteParaVenta, setClienteParaVenta] = useState<ClienteSeleccionado | null>(null)
  const [textoBusquedaCliente, setTextoBusquedaCliente] = useState('')
  const busquedaCliente = useValorConDebounce(textoBusquedaCliente, DEMORA_BUSQUEDA_MS)
  const consultaClientes = useClientesParaVentaQuery(busquedaCliente)

  const clientesParaVenta = consultaClientes.data ?? []
  const ventas = consultaVentas.data ?? []
  const puedeRegistrarVentas = reparto?.estado === 'EnCurso'
  const esPlanificado = reparto?.estado === 'Planificado'
  const enCurso = reparto?.estado === 'EnCurso'
  const tieneStockInicial = (reparto?.stockInicial.length ?? 0) > 0

  const abrirVenta = (cliente: ClienteSeleccionado | null) => {
    setIndiceAperturaVenta((actual) => actual + 1)
    setClienteParaVenta(cliente)
    setDialogoVentaAbierto(true)
  }

  const cerrarVenta = () => {
    setDialogoVentaAbierto(false)
    setClienteParaVenta(null)
  }

  const manejarIniciar = async () => {
    setErrorGestion(null)
    try {
      await mutacionIniciar.mutateAsync(repartoId)
    } catch (error) {
      setErrorGestion(obtenerMensajeErrorApi(error, 'No se pudo iniciar el reparto.'))
    }
  }

  const manejarConfirmarCancelar = async () => {
    setErrorGestion(null)
    try {
      await mutacionCancelar.mutateAsync(repartoId)
      setConfirmarCancelar(false)
    } catch (error) {
      setErrorGestion(obtenerMensajeErrorApi(error, 'No se pudo cancelar el reparto.'))
      setConfirmarCancelar(false)
    }
  }

  if (consultaReparto.isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton width={160} />
        <Paper sx={{ p: 2 }}>
          <Skeleton width="40%" height={40} />
          <Skeleton width="60%" />
          <Skeleton width="30%" />
        </Paper>
        <Skeleton height={180} />
      </Box>
    )
  }

  if (consultaReparto.isError || reparto === undefined) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/repartos')} sx={{ alignSelf: 'flex-start' }}>
          Volver a repartos
        </Button>
        <Alert severity="error">
          {obtenerMensajeErrorApi(consultaReparto.error, 'No se pudo cargar el detalle del reparto.')}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/repartos')} sx={{ alignSelf: 'flex-start' }}>
        Volver a repartos
      </Button>

      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1">
              {reparto.nombreRecorrido}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fecha del reparto: {formatearFecha(reparto.fechaReparto)} · Repartidor:{' '}
              {reparto.nombreRepartidor}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <ChipEstadoReparto estado={reparto.estado} />
              {reparto.fechaInicio !== null && (
                <Typography variant="caption" color="text.secondary">
                  Inicio: {formatearFechaHora(reparto.fechaInicio)}
                </Typography>
              )}
              {reparto.fechaFinalizacion !== null && (
                <Typography variant="caption" color="text.secondary">
                  Fin: {formatearFechaHora(reparto.fechaFinalizacion)}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {esGestion && esPlanificado && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<InventoryIcon />}
                  onClick={() => setDialogoStockAbierto(true)}
                >
                  Agregar stock
                </Button>
                <Tooltip title={tieneStockInicial ? '' : 'Agregá stock inicial antes de iniciar.'}>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      disabled={!tieneStockInicial || mutacionIniciar.isPending}
                      onClick={() => void manejarIniciar()}
                    >
                      Iniciar
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setConfirmarCancelar(true)}
                >
                  Cancelar
                </Button>
              </>
            )}
            {esGestion && enCurso && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FactCheckIcon />}
                  onClick={() => setDialogoCierreAbierto(true)}
                >
                  Finalizar reparto
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setConfirmarCancelar(true)}
                >
                  Cancelar
                </Button>
              </>
            )}
            {puedeRegistrarVentas && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => abrirVenta(null)}>
                Registrar venta
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {errorGestion !== null && <Alert severity="error">{errorGestion}</Alert>}

      {reparto.stockInicial.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Stock inicial
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {reparto.stockInicial.map((item) => (
              <Chip
                key={item.productoId}
                label={`${item.nombreProducto}: ${item.cantidadRestante}/${item.cantidadInicial}`}
              />
            ))}
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Clientes del recorrido (en orden)
        </Typography>
        {consultaRecorrido.isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={`cliente-skeleton-${indice}`} height={40} />
            ))}
          </Box>
        ) : consultaRecorrido.isError ? (
          <Alert severity="error">No se pudo cargar el recorrido del reparto.</Alert>
        ) : consultaRecorrido.data === undefined || consultaRecorrido.data.clientes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            El recorrido no tiene clientes asignados.
          </Typography>
        ) : (
          <List dense>
            {consultaRecorrido.data.clientes.map((cliente) => (
              <ListItem
                key={cliente.clienteId}
                disableGutters
                secondaryAction={
                  <IconButton
                    aria-label="Ver historial"
                    title="Ver historial de ventas"
                    edge="end"
                    onClick={() =>
                      setDialogoHistorialCliente({
                        clienteId: cliente.clienteId,
                        clienteNombre: cliente.nombreCliente,
                        abierto: true,
                      })
                    }
                  >
                    <HistoryIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  disabled={!puedeRegistrarVentas}
                  onClick={() => abrirVenta({ id: cliente.clienteId, nombre: cliente.nombreCliente })}
                >
                  <ListItemIcon>
                    <Typography variant="body2" color="text.secondary">
                      {cliente.orden}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={cliente.nombreCliente}
                    secondary={
                      <>
                        {cliente.direccion} · Deuda: {formatoMoneda.format(cliente.saldoDeudaActual)} ·
                        Envases: {cliente.saldoEnvasesActual}
                      </>
                    }
                    sx={{ pr: 2 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {puedeRegistrarVentas ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Vender a otro cliente
          </Typography>
          <TextField
            label="Buscar cliente por nombre"
            placeholder="Escribí para buscar…"
            size="small"
            fullWidth
            value={textoBusquedaCliente}
            onChange={(evento) => {
              setTextoBusquedaCliente(evento.target.value)
            }}
            slotProps={{
              input: {
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              },
            }}
          />
          {consultaClientes.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              No se pudieron buscar los clientes.
            </Alert>
          )}
          {consultaClientes.isLoading && (
            <Box sx={{ py: 1 }}>
              <Skeleton height={36} />
            </Box>
          )}
          {clientesParaVenta.length === 0 &&
            busquedaCliente.trim().length > 0 &&
            !consultaClientes.isLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No hay clientes activos que coincidan con la búsqueda.
              </Typography>
            )}
          <List dense>
            {clientesParaVenta.map((cliente) => (
              <ListItemButton
                key={cliente.id}
                onClick={() => abrirVenta({ id: cliente.id, nombre: cliente.nombre })}
              >
                <ListItemText primary={cliente.nombre} secondary={cliente.direccion} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : (
        <Alert severity="info">
          Este reparto no está en curso, por lo que el registro de ventas está deshabilitado.
        </Alert>
      )}

      <Paper>
        <Box sx={{ p: 2, paddingBottom: 0 }}>
          <Typography variant="h6" component="h2">
            Ventas del reparto
          </Typography>
        </Box>
        <TableContainer>
          <Table aria-label="Ventas del reparto">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell>Pagos</TableCell>
                <TableCell align="right">Total recibido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultaVentas.isLoading ? (
                Array.from({ length: CANTIDAD_FILAS_SKELETON_VENTAS }).map((_, indice) => (
                  <TableRow key={`venta-skeleton-${indice}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : consultaVentas.isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Alert severity="error">
                      Ocurrió un error al cargar las ventas del reparto.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Todavía no se registraron ventas en este reparto.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((venta) => (
                  <TableRow key={venta.id} hover>
                    <TableCell>{venta.nombreCliente}</TableCell>
                    <TableCell>{formatearFechaHora(venta.fechaVenta)}</TableCell>
                    <TableCell>{resumenProductos(venta.productos)}</TableCell>
                    <TableCell>{resumenPagos(venta.pagos)}</TableCell>
                    <TableCell align="right">
                      {formatoMoneda.format(venta.dineroRecibido)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {esFinalizado &&
        (consultaCierre.isLoading ? (
          <Paper sx={{ p: 2 }}>
            <Skeleton height={40} />
            <Skeleton height={160} />
          </Paper>
        ) : consultaCierre.isError ? (
          <Alert severity="error">No se pudo cargar el resumen de finalización del reparto.</Alert>
        ) : consultaCierre.data === undefined ? null : (
          <ResumenFinalizacionReparto cierre={consultaCierre.data} />
        ))}

      <RegistrarVentaDialog
        key={indiceAperturaVenta}
        open={dialogoVentaAbierto}
        repartoId={reparto.id}
        repartoNombre={reparto.nombreRecorrido}
        clienteInicial={clienteParaVenta}
        onClose={cerrarVenta}
        onVentaCreada={() => {
          void queryClient.invalidateQueries({ queryKey: clavesRepartos.raiz })
          void queryClient.invalidateQueries({ queryKey: clavesVentas.ventasDeReparto(reparto.id) })
        }}
      />

      <AgregarStockInicialDialog
        repartoId={reparto.id}
        repartoNombre={reparto.nombreRecorrido}
        productoIdsYaCargados={reparto.stockInicial.map((item) => item.productoId)}
        open={dialogoStockAbierto}
        onClose={() => setDialogoStockAbierto(false)}
      />

      <DialogoCierreReparto
        repartoId={reparto.id}
        repartoNombre={reparto.nombreRecorrido}
        open={dialogoCierreAbierto}
        onClose={() => setDialogoCierreAbierto(false)}
        onFinalizado={() => {
          setDialogoCierreAbierto(false)
        }}
      />

      <HistorialVentasClienteDialog
        clienteId={dialogoHistorialCliente?.clienteId ?? ''}
        clienteNombre={dialogoHistorialCliente?.clienteNombre ?? ''}
        open={dialogoHistorialCliente?.abierto ?? false}
        onClose={() => setDialogoHistorialCliente(null)}
      />

      <DialogoConfirmacion
        abierto={confirmarCancelar}
        titulo="Cancelar reparto"
        mensaje="¿Seguro que querés cancelar este reparto? Esta acción no se puede deshacer."
        textoConfirmar="Cancelar reparto"
        colorConfirmar="error"
        cargando={mutacionCancelar.isPending}
        onConfirmar={() => void manejarConfirmarCancelar()}
        onCancelar={() => setConfirmarCancelar(false)}
      />
    </Box>
  )
}