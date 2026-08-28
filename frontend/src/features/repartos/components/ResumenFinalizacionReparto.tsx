import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { CierreReparto, StockCierreReparto } from '../types'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function textoUnidades(cantidad: number): string {
  return `${cantidad} unidad${cantidad === 1 ? '' : 'es'}`
}

function FilaProducto({ item }: { item: StockCierreReparto }) {
  return (
    <TableRow>
      <TableCell>{item.nombreProducto}</TableCell>
      <TableCell align="right">{textoUnidades(item.cantidadInicial)}</TableCell>
      <TableCell align="right">{textoUnidades(item.cantidadVendida)}</TableCell>
      <TableCell align="right">{textoUnidades(item.cantidadRestante)}</TableCell>
    </TableRow>
  )
}

interface ResumenFinalizacionRepartoProps {
  cierre: CierreReparto
}

export default function ResumenFinalizacionReparto({ cierre }: ResumenFinalizacionRepartoProps) {
  const productosVendidos = cierre.stockPorProducto.reduce(
    (acumulado, item) => acumulado + item.cantidadVendida,
    0,
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Resumen de finalización
      </Typography>
      <TableContainer component={Box}>
        <Table size="small" aria-label="Resumen de finalización del reparto">
          <TableBody>
            <TableRow>
              <TableCell>Productos vendidos (total)</TableCell>
              <TableCell align="right">{textoUnidades(productosVendidos)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Monto esperado</TableCell>
              <TableCell align="right">{formatoMoneda.format(cierre.cajaEsperada)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Monto traído (caja entregada)</TableCell>
              <TableCell align="right">
                {cierre.cajaEntregada !== null
                  ? formatoMoneda.format(cierre.cajaEntregada)
                  : '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Monto fiado generado</TableCell>
              <TableCell align="right">
                {formatoMoneda.format(cierre.dineroFiadoGenerado)}
              </TableCell>
            </TableRow>
            {cierre.diferenciaCaja !== null && (
              <TableRow>
                <TableCell>Diferencia de caja</TableCell>
                <TableCell align="right">{formatoMoneda.format(cierre.diferenciaCaja)}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>Total efectivo</TableCell>
              <TableCell align="right">{formatoMoneda.format(cierre.totalEfectivo)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total transferencias</TableCell>
              <TableCell align="right">
                {formatoMoneda.format(cierre.totalTransferencias)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total QR</TableCell>
              <TableCell align="right">{formatoMoneda.format(cierre.totalQr)}</TableCell>
            </TableRow>
            {cierre.totalGastos > 0 && (
              <TableRow>
                <TableCell>Gastos del reparto</TableCell>
                <TableCell align="right">{formatoMoneda.format(cierre.totalGastos)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {cierre.stockPorProducto.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cantidad vendida por producto
          </Typography>
          <TableContainer>
            <Table size="small" aria-label="Cantidad vendida por producto">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Inicial</TableCell>
                  <TableCell align="right">Vendido</TableCell>
                  <TableCell align="right">Restante</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cierre.stockPorProducto.map((item) => (
                  <FilaProducto key={item.productoId} item={item} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  )
}

