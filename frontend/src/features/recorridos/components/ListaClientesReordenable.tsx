import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { RecorridoCliente } from '../types'
import { useReordenarClientesRecorridoMutation } from '../hooks/useReordenarClientesRecorridoMutation'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

interface ItemOrdenableProps {
  cliente: RecorridoCliente
  puedeEditar: boolean
  onQuitar: (cliente: RecorridoCliente) => void
  onVerDetalle: (cliente: RecorridoCliente) => void
}

function ItemClienteOrdenable({ cliente, puedeEditar, onQuitar, onVerDetalle }: ItemOrdenableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cliente.clienteId,
  })

  const estilo = {
    transform: transform !== null ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  const manejarEliminacion = (evento: MouseEvent) => {
    evento.stopPropagation()
    onQuitar(cliente)
  }

  const manejarVerDetalle = (evento: MouseEvent) => {
    evento.stopPropagation()
    onVerDetalle(cliente)
  }

  return (
    <Paper
      ref={setNodeRef}
      style={estilo}
      variant="outlined"
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        opacity: isDragging ? 0.6 : 1,
        ...(isDragging && { boxShadow: (tema) => tema.shadows[8] }),
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ width: 28, textAlign: 'center' }}>
        {cliente.orden}
      </Typography>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {cliente.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {cliente.direccion}
        </Typography>
      </Box>
      <Tooltip title="Ver detalle del cliente">
        <IconButton
          size="small"
          aria-label={`Ver detalle de ${cliente.nombre}`}
          onClick={manejarVerDetalle}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {puedeEditar && (
        <Tooltip title="Eliminar del recorrido">
          <IconButton
            size="small"
            aria-label={`Eliminar ${cliente.nombre} del recorrido`}
            onClick={manejarEliminacion}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {puedeEditar && (
        <Tooltip title="Arrastrar para reordenar">
          <IconButton size="small" aria-label="Arrastrar para reordenar" {...attributes} {...listeners}>
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  )
}

interface ListaClientesReordenableProps {
  recorridoId: string
  clientes: RecorridoCliente[]
  puedeEditar: boolean
  onQuitar: (cliente: RecorridoCliente) => void
  onVerDetalle: (cliente: RecorridoCliente) => void
}

export default function ListaClientesReordenable({
  recorridoId,
  clientes,
  puedeEditar,
  onQuitar,
  onVerDetalle,
}: ListaClientesReordenableProps) {
  const [items, setItems] = useState<RecorridoCliente[]>(clientes)
  const mutacionReordenar = useReordenarClientesRecorridoMutation()
  const [errorReordenar, setErrorReordenar] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const manejarFinArrastre = async (evento: DragEndEvent) => {
    const { active, over } = evento
    if (over === null || active.id === over.id) return

    const indiceViejo = items.findIndex((item) => item.clienteId === active.id)
    const indiceNuevo = items.findIndex((item) => item.clienteId === over.id)
    if (indiceViejo === -1 || indiceNuevo === -1) return

    const nuevosItems = arrayMove(items, indiceViejo, indiceNuevo)
    const reordenados = nuevosItems.map((item, indice) => ({
      ...item,
      orden: indice + 1,
    }))
    setItems(reordenados)
    setErrorReordenar(null)

    try {
      await mutacionReordenar.mutateAsync({
        id: recorridoId,
        clienteIdsEnOrden: reordenados.map((item) => item.clienteId),
      })
    } catch (error) {
      setErrorReordenar(
        obtenerMensajeErrorApi(error, 'No se pudo guardar el nuevo orden.'),
      )
      setItems(clientes)
    }
  }

  if (!puedeEditar) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {clientes.map((cliente) => (
          <Paper key={cliente.clienteId} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 28, textAlign: 'center' }}>
              {cliente.orden}
            </Typography>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {cliente.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {cliente.direccion}
              </Typography>
            </Box>
            <Tooltip title="Ver detalle del cliente">
              <IconButton
                size="small"
                aria-label={`Ver detalle de ${cliente.nombre}`}
                onClick={() => onVerDetalle(cliente)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {errorReordenar !== null && <Alert severity="error">{errorReordenar}</Alert>}
      {mutacionReordenar.isPending && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((cliente) => (
            <Skeleton key={cliente.clienteId} height={40} />
          ))}
        </Box>
      )}
      {!mutacionReordenar.isPending && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(evento) => void manejarFinArrastre(evento)}
        >
          <SortableContext items={items.map((item) => item.clienteId)} strategy={verticalListSortingStrategy}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {items.map((cliente) => (
                <ItemClienteOrdenable
                  key={cliente.clienteId}
                  cliente={cliente}
                  puedeEditar={puedeEditar}
                  onQuitar={onQuitar}
                  onVerDetalle={onVerDetalle}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      )}
    </Box>
  )
}
