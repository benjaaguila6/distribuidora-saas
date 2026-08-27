import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useProductosQuery } from '../../productos/hooks/useProductosQuery'
import { useAgregarStockInicialMutation } from '../hooks/useAgregarStockInicialMutation'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const TAMANO_SELECTOR = 100

interface AgregarStockInicialDialogProps {
  repartoId: string
  repartoNombre: string
  productoIdsYaCargados: string[]
  open: boolean
  onClose: () => void
}

export default function AgregarStockInicialDialog({
  repartoId,
  repartoNombre,
  productoIdsYaCargados,
  open,
  onClose,
}: AgregarStockInicialDialogProps) {
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionAgregar = useAgregarStockInicialMutation()

  const consultaProductos = useProductosQuery(1, TAMANO_SELECTOR, '')

  const productosDisponibles = (consultaProductos.data?.items ?? [])
    .filter((producto) => producto.activo)
    .filter((producto) => !productoIdsYaCargados.includes(producto.id))

  const guardando = mutacionAgregar.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    setProductoId('')
    setCantidad('')
    onClose()
  }

  const alEnviar = async () => {
    setErrorServidor(null)

    if (productoId === '') {
      setErrorServidor('Elegí un producto.')
      return
    }

    const cantidadNumerica = Number(cantidad)
    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica < 1) {
      setErrorServidor('La cantidad debe ser un número entero mayor o igual a 1.')
      return
    }

    try {
      await mutacionAgregar.mutateAsync({
        id: repartoId,
        productoId,
        cantidad: cantidadNumerica,
      })
      manejarCierre()
    } catch (error) {
      setErrorServidor(obtenerMensajeErrorApi(error, 'No se pudo agregar el stock inicial.'))
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>Agregar stock inicial — {repartoNombre}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-stock-inicial"
          onSubmit={(evento) => {
            evento.preventDefault()
            void alEnviar()
          }}
          sx={{ display: 'grid', gap: 2.5 }}
          noValidate
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}

          {consultaProductos.isLoading ? (
            <LinearProgress />
          ) : (
            <>
              <TextField
                label="Producto"
                select
                fullWidth
                value={productoId}
                onChange={(evento) => setProductoId(evento.target.value)}
                helperText={
                  productosDisponibles.length === 0
                    ? 'No hay productos activos sin stock cargado.'
                    : ' '
                }
              >
                {productosDisponibles.map((producto) => (
                  <MenuItem key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Cantidad"
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                value={cantidad}
                onChange={(evento) => setCantidad(evento.target.value)}
                helperText="Cantidad inicial del producto en este reparto."
              />
            </>
          )}

          {consultaProductos.isError && (
            <Alert severity="error">No se pudieron cargar los productos.</Alert>
          )}

          {productosDisponibles.length === 0 && !consultaProductos.isLoading && (
            <Typography variant="body2" color="text.secondary">
              Todos los productos ya tienen stock cargado.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-stock-inicial"
          variant="contained"
          loading={guardando}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
