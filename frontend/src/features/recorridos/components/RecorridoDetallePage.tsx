import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useRecorridoQuery } from '../hooks/useRecorridoQuery'
import { useQuitarClienteRecorridoMutation } from '../hooks/useQuitarClienteRecorridoMutation'
import type { RecorridoCliente } from '../types'
import ListaClientesReordenable from './ListaClientesReordenable'
import AgregarClienteRecorridoDialog from './AgregarClienteRecorridoDialog'
import DialogoConfirmacion from '../../../shared/components/DialogoConfirmacion'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })

function formatearFecha(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFecha.format(instante)
}

const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'

export default function RecorridoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const puedeEditar = usuario?.rol === ROL_ADMINISTRADOR || usuario?.rol === ROL_GERENTE

  const recorridoId = id ?? ''
  const consulta = useRecorridoQuery(recorridoId)
  const recorrido = consulta.data
  const mutacionQuitar = useQuitarClienteRecorridoMutation()

  const [dialogoAgregarAbierto, setDialogoAgregarAbierto] = useState(false)
  const [clienteAQuitar, setClienteAQuitar] = useState<RecorridoCliente | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const confirmarQuitar = async () => {
    if (clienteAQuitar === null) return
    setErrorAccion(null)
    try {
      await mutacionQuitar.mutateAsync({ id: recorridoId, clienteId: clienteAQuitar.clienteId })
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorApi(error, 'No se pudo quitar el cliente del recorrido.'),
      )
    } finally {
      setClienteAQuitar(null)
    }
  }

  if (consulta.isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton width={160} />
        <Paper sx={{ p: 2 }}>
          <Skeleton width="40%" height={40} />
          <Skeleton width="30%" />
        </Paper>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={`cliente-skeleton-${indice}`} height={44} />
          ))}
        </Box>
      </Box>
    )
  }

  if (consulta.isError || recorrido === undefined) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/recorridos')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a recorridos
        </Button>
        <Alert severity="error">
          {obtenerMensajeErrorApi(consulta.error, 'No se pudo cargar el detalle del recorrido.')}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/recorridos')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Volver a recorridos
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
              {recorrido.nombre}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip size="small" label={recorrido.diaSemana} />
              <Chip
                size="small"
                label={recorrido.activo ? 'Activo' : 'Inactivo'}
                color={recorrido.activo ? 'success' : 'error'}
              />
              <Typography variant="caption" color="text.secondary">
                Creado: {formatearFecha(recorrido.fechaCreacion)}
              </Typography>
            </Box>
          </Box>
          {puedeEditar && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogoAgregarAbierto(true)}
            >
              Agregar cliente
            </Button>
          )}
        </Box>
      </Paper>

      {errorAccion !== null && <Alert severity="error">{errorAccion}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Clientes del recorrido (en orden)
        </Typography>
        {recorrido.clientes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {puedeEditar
              ? 'El recorrido todavía no tiene clientes. Usá «Agregar cliente» para asignarlos.'
              : 'El recorrido no tiene clientes asignados.'}
          </Typography>
        ) : (
          <ListaClientesReordenable
            key={recorrido.clientes.map((cliente) => cliente.clienteId).join(',')}
            recorridoId={recorrido.id}
            clientes={recorrido.clientes}
            puedeEditar={puedeEditar}
            onQuitar={setClienteAQuitar}
          />
        )}
      </Paper>

      <AgregarClienteRecorridoDialog
        recorridoId={recorrido.id}
        clientesYaAgregados={recorrido.clientes.map((cliente) => cliente.clienteId)}
        open={dialogoAgregarAbierto}
        onClose={() => setDialogoAgregarAbierto(false)}
      />

      <DialogoConfirmacion
        abierto={clienteAQuitar !== null}
        titulo="Quitar cliente"
        mensaje={
          clienteAQuitar !== null
            ? `¿Seguro que querés quitar «${clienteAQuitar.nombre}» del recorrido?`
            : ''
        }
        textoConfirmar="Quitar"
        colorConfirmar="error"
        cargando={mutacionQuitar.isPending}
        onConfirmar={() => void confirmarQuitar()}
        onCancelar={() => setClienteAQuitar(null)}
      />
    </Box>
  )
}
