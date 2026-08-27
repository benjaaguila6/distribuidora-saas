import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useCierreRepartoQuery } from '../hooks/useCierreRepartoQuery'
import { useFinalizarRepartoMutation } from '../hooks/useFinalizarRepartoMutation'
import type { ConceptoGasto } from '../types'
import { CONCEPTO_GASTO_VALOR, CONCEPTOS_GASTO_ORDEN } from '../types'
import { obtenerMensajeErrorApi } from '../../../shared/lib/obtenerMensajeErrorApi'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

interface FilaGastoForm {
  key: string
  concepto: ConceptoGasto
  monto: string
  descripcion: string
}

function crearFilaGasto(): FilaGastoForm {
  return { key: crypto.randomUUID(), concepto: 'Comida', monto: '', descripcion: '' }
}

function parsearDecimalObligatorio(valor: string): number | null {
  const recortado = valor.trim()
  if (recortado.length === 0) return null
  const numero = Number(recortado.replace(',', '.'))
  return Number.isFinite(numero) ? numero : null
}

interface DialogoCierreRepartoProps {
  repartoId: string
  repartoNombre: string
  open: boolean
  onClose: () => void
  onFinalizado?: () => void
}

export default function DialogoCierreReparto({
  repartoId,
  repartoNombre,
  open,
  onClose,
  onFinalizado,
}: DialogoCierreRepartoProps) {
  const [cajaEntregada, setCajaEntregada] = useState('')
  const [gastos, setGastos] = useState<FilaGastoForm[]>(() => [])
  const [erroresGastos, setErroresGastos] = useState<Record<string, string>>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const consultaCierre = useCierreRepartoQuery(repartoId, open)
  const mutacionFinalizar = useFinalizarRepartoMutation()

  const guardando = mutacionFinalizar.isPending
  const cierre = consultaCierre.data

  const totalGastosCalculado = useMemo(() => {
    let acumulado = 0
    for (const fila of gastos) {
      const monto = parsearDecimalObligatorio(fila.monto)
      if (monto !== null && monto > 0) acumulado += monto
    }
    return Math.round((acumulado + Number.EPSILON) * 100) / 100
  }, [gastos])

  const actualizarGasto = (key: string, cambios: Partial<Omit<FilaGastoForm, 'key'>>) => {
    setGastos((actuales) =>
      actuales.map((fila) => (fila.key === key ? { ...fila, ...cambios } : fila)),
    )
    setErroresGastos((actuales) => {
      const restantes = { ...actuales }
      delete restantes[key]
      return restantes
    })
  }

  const manejarCierre = () => {
    setErrorServidor(null)
    setCajaEntregada('')
    setGastos([])
    setErroresGastos({})
    onClose()
  }

  const alEnviar = async () => {
    setErrorServidor(null)

    const caja = parsearDecimalObligatorio(cajaEntregada)
    if (caja === null || caja <= 0) {
      setErrorServidor('La caja entregada debe ser un monto mayor a cero.')
      return
    }

    const erroresCalculados: Record<string, string> = {}
    for (const fila of gastos) {
      const monto = parsearDecimalObligatorio(fila.monto)
      if (monto === null || monto <= 0) {
        erroresCalculados[fila.key] = 'El monto del gasto debe ser mayor a cero.'
      }
    }

    if (Object.keys(erroresCalculados).length > 0) {
      setErroresGastos(erroresCalculados)
      return
    }

    // Riesgo enum wire (D4): el backend serializa ConceptoGasto como NÚMERO (1-5).
    // Enviamos el valor numérico vía CONCEPTO_GASTO_VALOR; el cierre nos llega como string.
    const gastosDto = gastos.flatMap((fila) => {
      const monto = parsearDecimalObligatorio(fila.monto)
      if (monto === null || monto <= 0) return []
      const descripcion = fila.descripcion.trim()
      return [
        {
          concepto: CONCEPTO_GASTO_VALOR[fila.concepto],
          monto,
          descripcion: descripcion.length > 0 ? descripcion : null,
        },
      ]
    })

    try {
      await mutacionFinalizar.mutateAsync({
        id: repartoId,
        dto: { cajaEntregada: caja, gastos: gastosDto },
      })
      onFinalizado?.()
      manejarCierre()
    } catch (error) {
      setErrorServidor(obtenerMensajeErrorApi(error, 'No se pudo finalizar el reparto.'))
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="md">
      <DialogTitle>Finalizar reparto — {repartoNombre}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-cierre-reparto"
          onSubmit={(evento) => {
            evento.preventDefault()
            void alEnviar()
          }}
          sx={{ display: 'grid', gap: 2.5 }}
          noValidate
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}

          {consultaCierre.isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton height={40} />
              <Skeleton height={120} />
            </Box>
          ) : consultaCierre.isError || cierre === undefined ? (
            <Alert severity="error">No se pudo cargar el cierre del reparto.</Alert>
          ) : (
            <>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Resumen del cierre
                </Typography>
                <TableContainer component={Box}>
                  <Table size="small" aria-label="Cierre del reparto">
                    <TableHead>
                      <TableRow>
                        <TableCell>Concepto</TableCell>
                        <TableCell align="right">Monto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Caja esperada</TableCell>
                        <TableCell align="right">
                          {formatoMoneda.format(cierre.cajaEsperada)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dinero fiado generado</TableCell>
                        <TableCell align="right">
                          {formatoMoneda.format(cierre.dineroFiadoGenerado)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total efectivo</TableCell>
                        <TableCell align="right">
                          {formatoMoneda.format(cierre.totalEfectivo)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total transferencias</TableCell>
                        <TableCell align="right">
                          {formatoMoneda.format(cierre.totalTransferencias)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total QR</TableCell>
                        <TableCell align="right">
                          {formatoMoneda.format(cierre.totalQr)}
                        </TableCell>
                      </TableRow>
                      {cierre.gastos.length > 0 && (
                        <TableRow>
                          <TableCell>Gastos del reparto (guardados)</TableCell>
                          <TableCell align="right">
                            {formatoMoneda.format(cierre.totalGastos)}
                          </TableCell>
                        </TableRow>
                      )}
                      {cierre.diferenciaCaja !== null && (
                        <TableRow>
                          <TableCell>Diferencia de caja</TableCell>
                          <TableCell align="right">
                            {formatoMoneda.format(cierre.diferenciaCaja)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <TextField
                label="Caja entregada"
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                value={cajaEntregada}
                onChange={(evento) => setCajaEntregada(evento.target.value)}
                helperText="Importe en efectivo que el repartidor entrega al finalizar."
                autoFocus
              />

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Gastos del reparto
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {gastos.map((fila) => (
                    <Box
                      key={fila.key}
                      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}
                    >
                      <TextField
                        select
                        label="Concepto"
                        size="small"
                        sx={{ width: 180 }}
                        value={fila.concepto}
                        onChange={(evento) =>
                          actualizarGasto(fila.key, {
                            concepto: evento.target.value as ConceptoGasto,
                          })
                        }
                      >
                        {CONCEPTOS_GASTO_ORDEN.map((concepto) => (
                          <MenuItem key={concepto} value={concepto}>
                            {concepto}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Monto"
                        size="small"
                        sx={{ width: 150 }}
                        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                        value={fila.monto}
                        onChange={(evento) => actualizarGasto(fila.key, { monto: evento.target.value })}
                        error={erroresGastos[fila.key] !== undefined}
                        helperText={erroresGastos[fila.key] ?? ' '}
                      />
                      <TextField
                        label="Descripción"
                        size="small"
                        sx={{ width: 220 }}
                        value={fila.descripcion}
                        onChange={(evento) =>
                          actualizarGasto(fila.key, { descripcion: evento.target.value })
                        }
                        helperText="Opcional."
                      />
                      <Tooltip title="Quitar gasto">
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Quitar gasto"
                            onClick={() => {
                              setGastos((actuales) =>
                                actuales.length <= 1
                                  ? actuales
                                  : actuales.filter((item) => item.key !== fila.key),
                              )
                            }}
                            disabled={gastos.length <= 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                {gastos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    No se registran gastos.
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    Total de gastos: {formatoMoneda.format(totalGastosCalculado)}
                  </Typography>
                )}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setGastos((actuales) => [...actuales, crearFilaGasto()])}
                >
                  Agregar gasto
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="formulario-cierre-reparto"
          variant="contained"
          color="success"
          loading={guardando}
          disabled={consultaCierre.isLoading || consultaCierre.isError}
        >
          Finalizar reparto
        </Button>
      </DialogActions>
    </Dialog>
  )
}
