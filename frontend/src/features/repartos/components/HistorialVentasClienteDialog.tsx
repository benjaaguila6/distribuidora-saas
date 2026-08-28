import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useClienteQuery } from '../../clientes/hooks/useClienteQuery'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'
import { useHistorialVentasClienteQuery } from '../hooks/useHistorialVentasClienteQuery'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatearFechaHora(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFechaHora.format(instante)
}

const CANTIDAD_FILAS_SKELETON = 5

interface HistorialVentasClienteDialogProps {
  clienteId: string
  clienteNombre: string
  open: boolean
  onClose: () => void
}

export default function HistorialVentasClienteDialog({
  clienteId,
  clienteNombre,
  open,
  onClose,
}: HistorialVentasClienteDialogProps) {
  const consultaCliente = useClienteQuery(open ? clienteId : '')
  const consultaHistorial = useHistorialVentasClienteQuery(clienteId, open)
  const cliente = consultaCliente.data
  const ventas = consultaHistorial.data ?? []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Historial de ventas — {clienteNombre}</DialogTitle>
      <DialogContent dividers>
        {consultaCliente.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        {consultaCliente.isError && (
          <Alert severity="error">
            {obtenerMensajeErrorApi(consultaCliente.error, 'No se pudieron cargar los datos del cliente.')}
          </Alert>
        )}
        {!consultaCliente.isPending && !consultaCliente.isError && cliente !== undefined && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Dirección: {cliente.direccion.length > 0 ? cliente.direccion : '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saldo deuda: {formatoMoneda.format(cliente.saldoDeudaActual)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saldo envases: {cliente.saldoEnvasesActual} envases
            </Typography>
          </Box>
        )}

        {consultaHistorial.isLoading ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Valor entregado</TableCell>
                  <TableCell align="right">Dinero recibido</TableCell>
                  <TableCell align="right">Deuda generada</TableCell>
                  <TableCell align="right">Envases prestados</TableCell>
                  <TableCell align="right">Envases devueltos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: CANTIDAD_FILAS_SKELETON }).map((_, indice) => (
                  <TableRow key={`historial-skeleton-${indice}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : consultaHistorial.isError ? (
          <Alert severity="error">
            {obtenerMensajeErrorApi(
              consultaHistorial.error,
              'No se pudo cargar el historial de ventas del cliente.',
            )}
          </Alert>
        ) : ventas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            El cliente no tiene ventas registradas.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="Historial de ventas del cliente">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Valor entregado</TableCell>
                  <TableCell align="right">Dinero recibido</TableCell>
                  <TableCell align="right">Deuda generada</TableCell>
                  <TableCell align="right">Envases prestados</TableCell>
                  <TableCell align="right">Envases devueltos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.ventaId} hover>
                    <TableCell>{formatearFechaHora(venta.fechaVenta)}</TableCell>
                    <TableCell align="right">{formatoMoneda.format(venta.valorTotalEntregado)}</TableCell>
                    <TableCell align="right">{formatoMoneda.format(venta.dineroRecibido)}</TableCell>
                    <TableCell align="right">{formatoMoneda.format(venta.deudaGenerada)}</TableCell>
                    <TableCell align="right">{venta.envasesPrestados}</TableCell>
                    <TableCell align="right">{venta.envasesDevueltos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
