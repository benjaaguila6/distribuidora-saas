import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { ReactNode } from 'react'

type ColorBotonConfirmar = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

interface DialogoConfirmacionProps {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar?: string
  textoCancelar?: string
  colorConfirmar?: ColorBotonConfirmar
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export default function DialogoConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  colorConfirmar = 'primary',
  cargando = false,
  onConfirmar,
  onCancelar,
}: DialogoConfirmacionProps) {
  return (
    <Dialog
      open={abierto}
      onClose={cargando ? undefined : onCancelar}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar} disabled={cargando}>
          {textoCancelar}
        </Button>
        <Button onClick={onConfirmar} color={colorConfirmar} variant="contained" loading={cargando}>
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
