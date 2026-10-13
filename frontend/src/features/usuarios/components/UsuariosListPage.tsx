import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import PageHeader from '../../../shared/components/PageHeader'
import { useUsuariosQuery } from '../hooks/useUsuariosQuery'

const OPCIONES_TAMANO_PAGINA = [10, 25, 50]
const CANTIDAD_FILAS_SKELETON = 6
const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })

function formatearFecha(valor: string): string {
  const instante = new Date(valor)
  if (Number.isNaN(instante.getTime())) return valor
  return formatoFecha.format(instante)
}

export default function UsuariosListPage() {
  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])
  const consulta = useUsuariosQuery(pagina, tamanoPagina)
  const usuarios = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader
        title="Usuarios"
        description="Consultá las cuentas registradas, sus roles y su estado de acceso."
      />
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="Listado de usuarios">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de alta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consulta.isLoading ? (
                Array.from({ length: CANTIDAD_FILAS_SKELETON }).map((_, indice) => (
                  <TableRow key={`skeleton-${indice}`}>
                    {Array.from({ length: 4 }).map((__, columna) => (
                      <TableCell key={`skeleton-${indice}-${columna}`}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : consulta.isError ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert severity="error">Ocurrió un error al cargar los usuarios.</Alert>
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <AdminPanelSettingsOutlinedIcon
                        sx={{ color: 'text.disabled', fontSize: 30, mb: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Todavía no hay usuarios registrados.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {usuario.nombreCompleto}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {usuario.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{usuario.rol}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={usuario.estado}
                        color={usuario.estado === 'Activo' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{formatearFecha(usuario.fechaCreacion)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={pagina - 1}
          onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina + 1)}
          rowsPerPage={tamanoPagina}
          rowsPerPageOptions={OPCIONES_TAMANO_PAGINA}
          onRowsPerPageChange={(evento) => {
            setTamanoPagina(Number(evento.target.value))
            setPagina(1)
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>
    </Box>
  )
}
