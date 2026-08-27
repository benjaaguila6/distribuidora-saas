import Chip from '@mui/material/Chip'
import type { EstadoReparto } from '../types'

const COLORES_ESTADO: Record<EstadoReparto, 'default' | 'info' | 'success' | 'error'> = {
  Planificado: 'default',
  EnCurso: 'success',
  Finalizado: 'info',
  Cancelado: 'error',
}

interface ChipEstadoRepartoProps {
  estado: EstadoReparto
}

export default function ChipEstadoReparto({ estado }: ChipEstadoRepartoProps) {
  return <Chip size="small" label={estado} color={COLORES_ESTADO[estado]} />
}