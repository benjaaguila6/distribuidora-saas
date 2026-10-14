import { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

interface DialogoPasswordTemporalProps {
  abierto: boolean
  password: string
  onCerrar: () => void
}

// Este diálogo NO puede cerrarse con click en el fondo ni con Escape: la
// contraseña temporal sólo se muestra una vez y debe copiarse explícitamente.
export default function DialogoPasswordTemporal({
  abierto,
  password,
  onCerrar,
}: DialogoPasswordTemporalProps) {
  const [copiado, setCopiado] = useState(false)

  // No-op intencional: bloquea el cierre por click en el fondo y por Escape.
  // El diálogo sólo se cierra con el botón explícito "Ya la copié".
  const bloquearCierre = () => undefined

  const cerrar = () => {
    setCopiado(false)
    onCerrar()
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={bloquearCierre} maxWidth="xs" fullWidth>
      <DialogTitle>Contraseña temporal</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Copiá esta contraseña y entregásela al usuario. No volverá a mostrarse.
        </Alert>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Contraseña"
            value={password}
            fullWidth
            slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace' } } }}
          />
          <Tooltip title={copiado ? 'Copiada' : 'Copiar'}>
            <IconButton
              aria-label="Copiar contraseña temporal"
              color={copiado ? 'success' : 'default'}
              onClick={() => void copiar()}
            >
              {copiado ? <CheckIcon /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          El usuario deberá cambiarla al iniciar sesión.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={cerrar}>
          Ya la copié
        </Button>
      </DialogActions>
    </Dialog>
  )
}
