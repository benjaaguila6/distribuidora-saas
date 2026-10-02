import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Producto } from '../../productos/types'
import { useProductosQuery } from '../../productos/hooks/useProductosQuery'
import { useValorConDebounce } from '../../productos/hooks/useValorConDebounce'
import { useAgregarStockAdicionalMutation } from '../hooks/useAgregarStockAdicionalMutation'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const DEMORA_BUSQUEDA_MS = 400
const TAMANO_SELECTOR = 50

interface AgregarStockAdicionalDialogProps {
  repartoId: string
  repartoNombre: string
  open: boolean
  onClose: () => void
}

export default function AgregarStockAdicionalDialog({
  repartoId,
  repartoNombre,
  open,
  onClose,
}: AgregarStockAdicionalDialogProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionAgregar = useAgregarStockAdicionalMutation()

  const busquedaProducto = useValorConDebounce(textoBusquedaProducto, DEMORA_BUSQUEDA_MS)
  const consultaProductos = useProductosQuery(1, TAMANO_SELECTOR, busquedaProducto)

  const productosActivos = (consultaProductos.data?.items ?? []).filter((producto) => producto.activo)
  const guardando = mutacionAgregar.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    setProductoSeleccionado(null)
    setTextoBusquedaProducto('')
    setCantidad('')
    onClose()
  }

  const alEnviar = async () => {
    setErrorServidor(null)

    if (productoSeleccionado === null) {
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
        productoId: productoSeleccionado.id,
        cantidad: cantidadNumerica,
      })
      manejarCierre()
    } catch (error) {
      setErrorServidor(obtenerMensajeErrorApi(error, 'No se pudo agregar el stock adicional.'))
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>Agregar stock adicional (a mitad del reparto) — {repartoNombre}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-stock-adicional"
          onSubmit={(evento) => {
            evento.preventDefault()
            void alEnviar()
          }}
          sx={{ display: 'grid', gap: 2.5 }}
          noValidate
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}

          <Autocomplete
            size="small"
            options={productosActivos}
            getOptionLabel={(opcion) => opcion.nombre}
            isOptionEqualToValue={(opcion, valor) => opcion.id === valor?.id}
            value={productoSeleccionado}
            onChange={(_, opcion) => setProductoSeleccionado(opcion)}
            onInputChange={(_, nuevoValor) => setTextoBusquedaProducto(nuevoValor)}
            loading={consultaProductos.isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Producto"
                placeholder="Buscar producto…"
                helperText=" "
              />
            )}
          />

          <TextField
            label="Cantidad"
            fullWidth
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            helperText="Unidades que se suman al stock disponible de este producto en el reparto."
          />

          {consultaProductos.isError && (
            <Alert severity="error">No se pudieron cargar los productos.</Alert>
          )}

          {productosActivos.length === 0 &&
            !consultaProductos.isLoading &&
            !consultaProductos.isError && (
              <Typography variant="body2" color="text.secondary">
                No hay productos activos para cargar.
              </Typography>
            )}

          <Typography variant="body2" color="text.secondary">
            Las cargas se acumulan: podés repetirla las veces que necesites mientras el reparto esté
            en curso.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-stock-adicional"
          variant="contained"
          loading={guardando}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
