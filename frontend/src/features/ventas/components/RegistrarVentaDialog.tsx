import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'
import { useClientesParaVentaQuery } from '../hooks/useClientesParaVentaQuery'
import { useCrearVentaMutation } from '../hooks/useCrearVentaMutation'
import { useProductosParaVentaQuery } from '../hooks/useProductosParaVentaQuery'
import { useValorConDebounce } from '../hooks/useValorConDebounce'
import type {
  ClienteSeleccionado,
  CrearVentaInput,
  FormaPagoVenta,
  TipoMovimientoVenta,
} from '../types'

const OPCIONES_TIPO_MOVIMIENTO: TipoMovimientoVenta[] = ['Entregado', 'Retirado', 'Cambio']
const OPCIONES_FORMA_PAGO: FormaPagoVenta[] = ['Efectivo', 'Transferencia', 'Qr']
const DEMORA_BUSQUEDA_MS = 400

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

interface FilaProductoForm {
  key: string
  productoId: string
  tipoMovimiento: TipoMovimientoVenta
  cantidad: string
}

interface FilaPagoForm {
  key: string
  formaPago: FormaPagoVenta
  monto: string
  importeEntregado: string
}

function crearFilaProducto(): FilaProductoForm {
  return { key: crypto.randomUUID(), productoId: '', tipoMovimiento: 'Entregado', cantidad: '1' }
}

function crearFilaPago(): FilaPagoForm {
  return { key: crypto.randomUUID(), formaPago: 'Efectivo', monto: '', importeEntregado: '' }
}

function parsearDecimalOpcional(valor: string): number | null {
  const recortado = valor.trim()
  if (recortado.length === 0) return null
  const numero = Number(recortado.replace(',', '.'))
  return Number.isFinite(numero) ? numero : null
}

function enteroDesdeTexto(valor: string): number | null {
  const recortado = valor.trim()
  if (!/^\d+$/.test(recortado)) return null
  return Number(recortado)
}

function convertirAOpcional(valor: string): string | null {
  const recortado = valor.trim()
  return recortado.length === 0 ? null : recortado
}

function redondearDinero(monto: number): number {
  return Math.round((monto + Number.EPSILON) * 100) / 100
}

interface RegistrarVentaDialogProps {
  repartoId: string
  repartoNombre: string
  clienteInicial: ClienteSeleccionado | null
  open: boolean
  onClose: () => void
  onVentaCreada?: () => void
}

export default function RegistrarVentaDialog({
  repartoId,
  repartoNombre,
  clienteInicial,
  open,
  onClose,
  onVentaCreada,
}: RegistrarVentaDialogProps) {
  const [clienteActual, setClienteActual] = useState<ClienteSeleccionado | null>(clienteInicial)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [textoBusquedaCliente, setTextoBusquedaCliente] = useState('')
  const [productos, setProductos] = useState<FilaProductoForm[]>(() => [crearFilaProducto()])
  const [pagos, setPagos] = useState<FilaPagoForm[]>(() => [crearFilaPago()])
  const [observaciones, setObservaciones] = useState('')
  const [erroresProductos, setErroresProductos] = useState<Record<string, string>>({})
  const [erroresPagos, setErroresPagos] = useState<Record<string, string>>({})

  const busquedaProducto = useValorConDebounce(textoBusquedaProducto, DEMORA_BUSQUEDA_MS)
  const busquedaCliente = useValorConDebounce(textoBusquedaCliente, DEMORA_BUSQUEDA_MS)

  const consultaProductos = useProductosParaVentaQuery(busquedaProducto)
  const consultaClientes = useClientesParaVentaQuery(busquedaCliente)
  const mutacionCrear = useCrearVentaMutation()

  const guardando = mutacionCrear.isPending

  const productosDisponibles = useMemo(
    () => consultaProductos.data ?? [],
    [consultaProductos.data],
  )
  const clientesParaVenta = useMemo(
    () => consultaClientes.data ?? [],
    [consultaClientes.data],
  )

  const totalProductosEntregados = useMemo(() => {
    let acumulado = 0
    for (const fila of productos) {
      if (fila.tipoMovimiento !== 'Entregado') continue
      const cantidad = enteroDesdeTexto(fila.cantidad)
      const producto = productosDisponibles.find((item) => item.id === fila.productoId)
      if (cantidad !== null && producto !== undefined) {
        acumulado += cantidad * producto.precio
      }
    }
    return acumulado
  }, [productos, productosDisponibles])

  const totalRecibido = useMemo(() => {
    let acumulado = 0
    for (const fila of pagos) {
      const monto = parsearDecimalOpcional(fila.monto)
      if (monto !== null && monto > 0) acumulado += monto
    }
    return acumulado
  }, [pagos])

  const vueltoTotal = useMemo(() => {
    let acumulado = 0
    for (const fila of pagos) {
      if (fila.formaPago !== 'Efectivo') continue
      const monto = parsearDecimalOpcional(fila.monto)
      const importe = parsearDecimalOpcional(fila.importeEntregado)
      if (monto !== null && importe !== null) acumulado += Math.max(0, importe - monto)
    }
    return acumulado
  }, [pagos])

  const actualizarProducto = (key: string, cambios: Partial<Omit<FilaProductoForm, 'key'>>) => {
    setProductos((actuales) =>
      actuales.map((fila) => (fila.key === key ? { ...fila, ...cambios } : fila)),
    )
    setErroresProductos((actuales) => {
      const restantes = { ...actuales }
      delete restantes[`${key}:producto`]
      delete restantes[`${key}:cantidad`]
      return restantes
    })
  }

  const actualizarPago = (key: string, cambios: Partial<Omit<FilaPagoForm, 'key'>>) => {
    setPagos((actuales) =>
      actuales.map((fila) => (fila.key === key ? { ...fila, ...cambios } : fila)),
    )
    setErroresPagos((actuales) => {
      const restantes = { ...actuales }
      delete restantes[`${key}:monto`]
      delete restantes[`${key}:importe`]
      return restantes
    })
  }

  const manejarCierre = () => {
    setErrorServidor(null)
    onClose()
  }

  const alEnviar = async () => {
    setErrorServidor(null)

    if (clienteActual === null) {
      setErrorServidor('Seleccioná un cliente antes de registrar la venta.')
      return
    }

    const erroresProductosCalculados: Record<string, string> = {}
    for (const fila of productos) {
      if (fila.productoId === '') {
        erroresProductosCalculados[`${fila.key}:producto`] = 'Elegí un producto.'
      }

      const cantidad = enteroDesdeTexto(fila.cantidad)
      if (cantidad === null || cantidad < 1) {
        erroresProductosCalculados[`${fila.key}:cantidad`] =
          'La cantidad debe ser un número entero mayor o igual a 1.'
      }
    }

    const erroresPagosCalculados: Record<string, string> = {}
    for (const fila of pagos) {
      const monto = parsearDecimalOpcional(fila.monto)
      if (monto === null || monto <= 0) {
        erroresPagosCalculados[`${fila.key}:monto`] = 'El monto debe ser mayor a cero.'
      }

      if (fila.formaPago === 'Efectivo') {
        const importe = parsearDecimalOpcional(fila.importeEntregado)
        if (importe === null) {
          erroresPagosCalculados[`${fila.key}:importe`] =
            'Indicá el importe entregado por el cliente.'
        } else if (monto !== null && importe < monto) {
          erroresPagosCalculados[`${fila.key}:importe`] =
            'El importe entregado no puede ser menor al monto del pago.'
        }
      }
    }

    const hayErrores =
      Object.keys(erroresProductosCalculados).length > 0 ||
      Object.keys(erroresPagosCalculados).length > 0

    if (hayErrores) {
      setErroresProductos(erroresProductosCalculados)
      setErroresPagos(erroresPagosCalculados)
      return
    }

    const productosDto = productos.flatMap((fila) => {
      if (fila.productoId === '') return []
      const cantidad = enteroDesdeTexto(fila.cantidad)
      if (cantidad === null) return []
      return [{ productoId: fila.productoId, tipoMovimiento: fila.tipoMovimiento, cantidad }]
    })

    const pagosDto = pagos.flatMap((fila) => {
      const monto = parsearDecimalOpcional(fila.monto)
      if (monto === null || monto <= 0) return []
      return [
        {
          formaPago: fila.formaPago,
          monto,
          importeEntregadoPorCliente:
            fila.formaPago === 'Efectivo' ? parsearDecimalOpcional(fila.importeEntregado) : null,
        },
      ]
    })

    const dto: CrearVentaInput = {
      repartoId,
      clienteId: clienteActual.id,
      dineroRecibido: redondearDinero(pagosDto.reduce((suma, pago) => suma + pago.monto, 0)),
      observaciones: convertirAOpcional(observaciones),
      productos: productosDto,
      pagos: pagosDto,
    }

    try {
      await mutacionCrear.mutateAsync(dto)
      onVentaCreada?.()
      manejarCierre()
    } catch (error) {
      setErrorServidor(obtenerMensajeErrorApi(error, 'No se pudo registrar la venta.'))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={guardando ? undefined : manejarCierre}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Registrar venta — {repartoNombre}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-venta"
          onSubmit={(evento) => {
            evento.preventDefault()
            void alEnviar()
          }}
          sx={{ display: 'grid', gap: 2.5 }}
          noValidate
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cliente
            </Typography>
            {clienteActual !== null ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={clienteActual.nombre} color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Cliente fijo para esta venta.
                </Typography>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="Buscar cliente por nombre"
                  placeholder="Escribí para buscar…"
                  size="small"
                  fullWidth
                  value={textoBusquedaCliente}
                  onChange={(evento) => setTextoBusquedaCliente(evento.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    },
                  }}
                />
                {consultaClientes.isLoading && (
                  <Box sx={{ py: 1 }}>
                    <LinearProgress />
                  </Box>
                )}
                {consultaClientes.isError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    No se pudieron buscar los clientes.
                  </Alert>
                )}
                {clientesParaVenta.length === 0 &&
                  busquedaCliente.trim().length > 0 &&
                  !consultaClientes.isLoading && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No hay clientes activos que coincidan con la búsqueda.
                    </Typography>
                  )}
                <List dense sx={{ maxHeight: 220, overflowY: 'auto' }}>
                  {clientesParaVenta.map((cliente) => (
                    <ListItemButton
                      key={cliente.id}
                      onClick={() => setClienteActual({ id: cliente.id, nombre: cliente.nombre })}
                    >
                      <ListItemText primary={cliente.nombre} secondary={cliente.direccion} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Productos
            </Typography>
            {consultaProductos.isError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                No se pudieron cargar los productos.
              </Alert>
            )}
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {productos.map((fila) => {
                const productoSeleccionado =
                  productosDisponibles.find((item) => item.id === fila.productoId) ?? null

                return (
                  <Box
                    key={fila.key}
                    sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}
                  >
                    <Autocomplete
                      size="small"
                      sx={{ width: { xs: '100%', sm: 340 } }}
                      options={productosDisponibles}
                      getOptionLabel={(opcion) => opcion.nombre}
                      isOptionEqualToValue={(opcion, valor) => opcion.id === valor?.id}
                      value={productoSeleccionado}
                      onChange={(_, opcion) =>
                        actualizarProducto(fila.key, { productoId: opcion?.id ?? '' })
                      }
                      onInputChange={(_, nuevoValor) => setTextoBusquedaProducto(nuevoValor)}
                      loading={consultaProductos.isLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Producto"
                          placeholder="Buscar producto…"
                          error={erroresProductos[`${fila.key}:producto`] !== undefined}
                          helperText={
                            erroresProductos[`${fila.key}:producto`] ??
                            (productoSeleccionado !== null
                              ? `Precio unitario: ${formatoMoneda.format(productoSeleccionado.precio)}`
                              : ' ')
                          }
                        />
                      )}
                    />
                    <TextField
                      select
                      label="Movimiento"
                      size="small"
                      sx={{ width: 150 }}
                      value={fila.tipoMovimiento}
                      onChange={(evento) =>
                        actualizarProducto(fila.key, {
                          tipoMovimiento: evento.target.value as TipoMovimientoVenta,
                        })
                      }
                    >
                      {OPCIONES_TIPO_MOVIMIENTO.map((opcion) => (
                        <MenuItem key={opcion} value={opcion}>
                          {opcion}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Cantidad"
                      size="small"
                      sx={{ width: 110 }}
                      slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                      value={fila.cantidad}
                      onChange={(evento) => actualizarProducto(fila.key, { cantidad: evento.target.value })}
                      error={erroresProductos[`${fila.key}:cantidad`] !== undefined}
                      helperText={erroresProductos[`${fila.key}:cantidad`] ?? ' '}
                    />
                    <Tooltip title="Quitar producto">
                      <span>
                        <IconButton
                          size="small"
                          aria-label="Quitar producto"
                          onClick={() => {
                            setProductos((actuales) =>
                              actuales.length <= 1 ? actuales : actuales.filter((item) => item.key !== fila.key),
                            )
                          }}
                          disabled={productos.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                )
              })}
            </Box>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setProductos((actuales) => [...actuales, crearFilaProducto()])}
              sx={{ mt: 1 }}
            >
              Agregar producto
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Pagos
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {pagos.map((fila) => (
                <Box
                  key={fila.key}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}
                >
                  <TextField
                    select
                    label="Forma de pago"
                    size="small"
                    sx={{ width: 180 }}
                    value={fila.formaPago}
                    onChange={(evento) =>
                      actualizarPago(fila.key, {
                        formaPago: evento.target.value as FormaPagoVenta,
                      })
                    }
                  >
                    {OPCIONES_FORMA_PAGO.map((opcion) => (
                      <MenuItem key={opcion} value={opcion}>
                        {opcion}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Monto"
                    size="small"
                    sx={{ width: 150 }}
                    slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                    value={fila.monto}
                    onChange={(evento) => actualizarPago(fila.key, { monto: evento.target.value })}
                    error={erroresPagos[`${fila.key}:monto`] !== undefined}
                    helperText={erroresPagos[`${fila.key}:monto`] ?? ' '}
                  />
                  {fila.formaPago === 'Efectivo' && (
                    <TextField
                      label="Entregado por el cliente"
                      size="small"
                      sx={{ width: 190 }}
                      slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                      value={fila.importeEntregado}
                      onChange={(evento) =>
                        actualizarPago(fila.key, { importeEntregado: evento.target.value })
                      }
                      error={erroresPagos[`${fila.key}:importe`] !== undefined}
                      helperText={
                        erroresPagos[`${fila.key}:importe`] ??
                        'El vuelto se calcula automáticamente.'
                      }
                    />
                  )}
                  <Tooltip title="Quitar pago">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Quitar pago"
                        onClick={() => {
                          setPagos((actuales) =>
                            actuales.length <= 1 ? actuales : actuales.filter((item) => item.key !== fila.key),
                          )
                        }}
                        disabled={pagos.length <= 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Box>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setPagos((actuales) => [...actuales, crearFilaPago()])}
              sx={{ mt: 1 }}
            >
              Agregar pago
            </Button>
          </Box>

          <TextField
            label="Observaciones"
            fullWidth
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
            helperText="Opcional."
          />

          <Alert severity="info">
            Total a cobrar (solo entregados): {formatoMoneda.format(totalProductosEntregados)} · Dinero
            recibido (suma de montos de pago): {formatoMoneda.format(totalRecibido)} · Vuelto a
            devolver en efectivo: {formatoMoneda.format(vueltoTotal)}. El vuelto de cada pago en
            efectivo se calcula automáticamente como el importe entregado menos el monto del pago.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-venta"
          variant="contained"
          loading={guardando}
        >
          Registrar venta
        </Button>
      </DialogActions>
    </Dialog>
  )
}