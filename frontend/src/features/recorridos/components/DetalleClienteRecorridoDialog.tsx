import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useClienteQuery } from '../../clientes/hooks/useClienteQuery'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function valorOpcional(valor: string | null | undefined): string {
  return valor !== null && valor !== undefined && valor.trim().length > 0 ? valor : '—'
}

interface DetalleClienteRecorridoDialogProps {
  clienteId: string
  open: boolean
  onClose: () => void
}

export default function DetalleClienteRecorridoDialog({
  clienteId,
  open,
  onClose,
}: DetalleClienteRecorridoDialogProps) {
  const consulta = useClienteQuery(clienteId)
  const cliente = consulta.data

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{cliente?.nombre ?? 'Detalle del cliente'}</DialogTitle>
      <DialogContent dividers>
        {consulta.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        {consulta.isError && (
          <Alert severity="error">
            {obtenerMensajeErrorApi(consulta.error, 'No se pudieron cargar los datos del cliente.')}
          </Alert>
        )}
        {!consulta.isPending && !consulta.isError && cliente !== undefined && (
          <List dense>
            <ListItem disableGutters>
              <ListItemText primary="Dirección" secondary={valorOpcional(cliente.direccion)} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Teléfono" secondary={valorOpcional(cliente.telefono)} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="Observaciones"
                secondary={valorOpcional(cliente.observaciones)}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="Saldo deuda"
                secondary={formatoMoneda.format(cliente.saldoDeudaActual)}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="Saldo envases"
                secondary={`${cliente.saldoEnvasesActual} envases`}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Estado" secondary={cliente.estado} />
            </ListItem>
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
