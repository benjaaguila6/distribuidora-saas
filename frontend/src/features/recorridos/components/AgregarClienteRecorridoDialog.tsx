import { keepPreviousData, useQuery } from '@tanstack/react-query'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { listar } from '../../clientes/api/clientesService'
import type { ClienteResponse } from '../../clientes/types'
import { clavesClientes } from '../../clientes/hooks/clavesClientes'
import { useValorConDebounce } from '../../productos/hooks/useValorConDebounce'
import { useAgregarClienteRecorridoMutation } from '../hooks/useAgregarClienteRecorridoMutation'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const DEMORA_BUSQUEDA_MS = 400
const TAMANO_PAGINA_CLIENTES = 50

interface AgregarClienteRecorridoDialogProps {
  recorridoId: string
  clientesYaAgregados: string[]
  open: boolean
  onClose: () => void
}

export default function AgregarClienteRecorridoDialog({
  recorridoId,
  clientesYaAgregados,
  open,
  onClose,
}: AgregarClienteRecorridoDialogProps) {
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const busqueda = useValorConDebounce(textoBusqueda, DEMORA_BUSQUEDA_MS)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const mutacionAgregar = useAgregarClienteRecorridoMutation()

  const consulta = useQuery({
    queryKey: clavesClientes.lista(1, TAMANO_PAGINA_CLIENTES, busqueda),
    queryFn: () => listar(1, TAMANO_PAGINA_CLIENTES, busqueda),
    placeholderData: keepPreviousData,
  })

  const clientesDisponibles = (consulta.data?.items ?? [])
    .filter((cliente) => cliente.estado === 'Activo')
    .filter((cliente) => !clientesYaAgregados.includes(cliente.id))

  const manejarSeleccion = async (cliente: ClienteResponse) => {
    setErrorAccion(null)
    try {
      await mutacionAgregar.mutateAsync({ id: recorridoId, clienteId: cliente.id })
      onClose()
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo agregar el cliente al recorrido.'),
      )
    }
  }

  const manejarCierre = () => {
    setErrorAccion(null)
    setTextoBusqueda('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={mutacionAgregar.isPending ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>Agregar cliente al recorrido</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorAccion !== null && <Alert severity="error">{errorAccion}</Alert>}
          <TextField
            label="Buscar cliente"
            placeholder="Buscar por nombre…"
            size="small"
            fullWidth
            value={textoBusqueda}
            onChange={(evento) => setTextoBusqueda(evento.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              },
            }}
          />
          {consulta.isError && (
            <Alert severity="error">No se pudieron cargar los clientes.</Alert>
          )}
          {consulta.isLoading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, indice) => (
                <Skeleton key={`cliente-skeleton-${indice}`} height={40} />
              ))}
            </Box>
          )}
          {!consulta.isLoading && clientesDisponibles.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay clientes activos disponibles para agregar.
            </Typography>
          )}
          <List dense>
            {clientesDisponibles.map((cliente) => (
              <ListItemButton
                key={cliente.id}
                disabled={mutacionAgregar.isPending}
                onClick={() => void manejarSeleccion(cliente)}
              >
                <ListItemText primary={cliente.nombre} secondary={cliente.direccion} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={mutacionAgregar.isPending}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
