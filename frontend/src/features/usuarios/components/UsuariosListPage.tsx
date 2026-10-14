import { useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../auth/hooks/useAuth'
import DialogoConfirmacion from '../../../shared/components/DialogoConfirmacion'
import PageHeader from '../../../shared/components/PageHeader'
import { useDesactivarUsuarioMutation } from '../hooks/useDesactivarUsuarioMutation'
import { useReactivarUsuarioMutation } from '../hooks/useReactivarUsuarioMutation'
import { useResetearPasswordMutation } from '../hooks/useResetearPasswordMutation'
import { useUsuariosQuery } from '../hooks/useUsuariosQuery'
import { generarPasswordTemporal } from '../lib/generarPasswordTemporal'
import { obtenerMensajeErrorAccion } from '../lib/mensajeErrorUsuarios'
import { esRolUsuario, puedeActuarSobre, rolesAsignables } from '../lib/puedeGestionar'
import type { EstadoUsuario, RolUsuario, UsuarioCreadoResponse, UsuarioResponse } from '../types'
import DialogoPasswordTemporal from './DialogoPasswordTemporal'
import UsuarioFormDialog, { type ModoFormularioUsuario } from './UsuarioFormDialog'

const OPCIONES_TAMANO_PAGINA = [10, 25, 50]
const CANTIDAD_FILAS_SKELETON = 8

const ROLES: RolUsuario[] = ['Administrador', 'Gerente', 'Repartidor']
const ESTADOS: EstadoUsuario[] = ['Activo', 'Inactivo']

type FiltroRol = RolUsuario | 'todos'
type FiltroEstado = EstadoUsuario | 'todos'

export default function UsuariosListPage() {
  const { usuario: actor } = useAuth()
  const rolTexto = actor?.rol ?? ''
  const rolActor: RolUsuario = esRolUsuario(rolTexto) ? rolTexto : 'Repartidor'
  const actorId = actor?.usuarioId ?? null
  const puedeCrear = rolesAsignables(rolActor).length > 0

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(OPCIONES_TAMANO_PAGINA[0])

  const [modoDialogo, setModoDialogo] = useState<ModoFormularioUsuario>('crear')
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<UsuarioResponse | null>(null)
  const [dialogoFormularioAbierto, setDialogoFormularioAbierto] = useState(false)
  const [usuarioADesactivar, setUsuarioADesactivar] = useState<UsuarioResponse | null>(null)
  const [usuarioAReactivar, setUsuarioAReactivar] = useState<UsuarioResponse | null>(null)
  const [usuarioAResetear, setUsuarioAResetear] = useState<UsuarioResponse | null>(null)
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const consulta = useUsuariosQuery(pagina, tamanoPagina)
  const mutacionDesactivar = useDesactivarUsuarioMutation()
  const mutacionReactivar = useReactivarUsuarioMutation()
  const mutacionResetear = useResetearPasswordMutation()

  const usuarios = useMemo(() => consulta.data?.items ?? [], [consulta.data])
  const total = consulta.data?.total ?? 0
  const cargando = consulta.isLoading

  // El endpoint de listado sólo acepta page y pageSize: el texto, el rol y el
  // estado se filtran del lado del cliente y afectan ÚNICAMENTE a la página
  // actualmente cargada.
  const usuariosFiltrados = useMemo(() => {
    const texto = textoBusqueda.trim().toLowerCase()
    return usuarios.filter((usuario) => {
      const coincideTexto =
        texto.length === 0 ||
        usuario.nombreCompleto.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto)
      const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol
      const coincideEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado
      return coincideTexto && coincideRol && coincideEstado
    })
  }, [usuarios, textoBusqueda, filtroRol, filtroEstado])

  const hayFiltrosActivos =
    textoBusqueda.trim().length > 0 || filtroRol !== 'todos' || filtroEstado !== 'todos'

  const abrirCreacion = () => {
    setModoDialogo('crear')
    setUsuarioEnEdicion(null)
    setDialogoFormularioAbierto(true)
  }

  const abrirEdicion = (usuario: UsuarioResponse) => {
    setModoDialogo('editar')
    setUsuarioEnEdicion({ ...usuario })
    setDialogoFormularioAbierto(true)
  }

  const cerrarDialogoFormulario = () => {
    setDialogoFormularioAbierto(false)
    setUsuarioEnEdicion(null)
  }

  const manejarCreado = (creado: UsuarioCreadoResponse) => {
    setPasswordTemporal(creado.passwordTemporal)
  }

  const manejarConfirmarDesactivacion = async () => {
    if (usuarioADesactivar === null) return
    setErrorAccion(null)
    try {
      await mutacionDesactivar.mutateAsync(usuarioADesactivar.id)
    } catch (error) {
      setErrorAccion(obtenerMensajeErrorAccion(error, 'No se pudo desactivar el empleado.'))
    } finally {
      setUsuarioADesactivar(null)
    }
  }

  const manejarConfirmarReactivacion = async () => {
    if (usuarioAReactivar === null) return
    setErrorAccion(null)
    try {
      await mutacionReactivar.mutateAsync(usuarioAReactivar.id)
    } catch (error) {
      setErrorAccion(obtenerMensajeErrorAccion(error, 'No se pudo reactivar el empleado.'))
    } finally {
      setUsuarioAReactivar(null)
    }
  }

  const manejarConfirmarReset = async () => {
    if (usuarioAResetear === null) return
    setErrorAccion(null)
    // El backend no genera la contraseña: la generamos acá y la enviamos.
    const passwordNueva = generarPasswordTemporal()
    try {
      await mutacionResetear.mutateAsync({ id: usuarioAResetear.id, passwordNueva })
      setPasswordTemporal(passwordNueva)
    } catch (error) {
      setErrorAccion(
        obtenerMensajeErrorAccion(error, 'No se pudo resetear la contraseña del empleado.'),
      )
    } finally {
      setUsuarioAResetear(null)
    }
  }

  const cerrarPasswordTemporal = () => {
    setPasswordTemporal(null)
    // La contraseña (y las variables de la mutación) no deben quedar en memoria.
    mutacionResetear.reset()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader
        title="Usuarios"
        description="Gestioná las cuentas del equipo, sus roles, accesos y contraseñas."
        action={
          puedeCrear ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCreacion}>
              Nuevo empleado
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Buscar por nombre o email"
          placeholder="Buscar…"
          sx={{ flex: '1 1 260px', maxWidth: { sm: 360 } }}
          value={textoBusqueda}
          onChange={(evento) => setTextoBusqueda(evento.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            },
          }}
        />
        <TextField
          select
          label="Rol"
          sx={{ minWidth: 170 }}
          value={filtroRol}
          onChange={(evento) => setFiltroRol(evento.target.value as FiltroRol)}
        >
          <MenuItem value="todos">Todos</MenuItem>
          {ROLES.map((rol) => (
            <MenuItem key={rol} value={rol}>
              {rol}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          sx={{ minWidth: 150 }}
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value as FiltroEstado)}
        >
          <MenuItem value="todos">Todos</MenuItem>
          {ESTADOS.map((estado) => (
            <MenuItem key={estado} value={estado}>
              {estado}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary" sx={{ flexBasis: '100%' }}>
          Los filtros se aplican sobre la página actual.
        </Typography>
      </Paper>

      {errorAccion !== null && <Alert severity="error">{errorAccion}</Alert>}

      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="Listado de usuarios">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                {puedeCrear && <TableCell align="right">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                Array.from({ length: CANTIDAD_FILAS_SKELETON }).map((_, indice) => (
                  <TableRow key={`skeleton-${indice}`}>
                    {Array.from({ length: puedeCrear ? 6 : 5 }).map((__, columna) => (
                      <TableCell key={`skeleton-${indice}-${columna}`}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : consulta.isError ? (
                <TableRow>
                  <TableCell colSpan={puedeCrear ? 6 : 5}>
                    <Alert severity="error">Ocurrió un error al cargar los usuarios.</Alert>
                  </TableCell>
                </TableRow>
              ) : usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={puedeCrear ? 6 : 5}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      {hayFiltrosActivos
                        ? 'No hay usuarios que coincidan con los filtros en esta página.'
                        : 'Todavía no hay usuarios registrados.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const accionable = puedeActuarSobre(
                    rolActor,
                    { id: usuario.id, rol: usuario.rol },
                    actorId,
                  )
                  return (
                    <TableRow key={usuario.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {usuario.nombreCompleto}
                        </Typography>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono ?? '—'}</TableCell>
                      <TableCell>{usuario.rol}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                          <Chip
                            size="small"
                            label={usuario.estado}
                            color={usuario.estado === 'Activo' ? 'success' : 'error'}
                          />
                          {usuario.debeCambiarPassword && (
                            <Chip size="small" variant="outlined" color="warning" label="Cambio pendiente" />
                          )}
                        </Box>
                      </TableCell>
                      {puedeCrear && (
                        <TableCell align="right">
                          {accionable ? (
                            <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  aria-label={`Editar ${usuario.nombreCompleto}`}
                                  onClick={() => abrirEdicion(usuario)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Resetear contraseña">
                                <IconButton
                                  size="small"
                                  aria-label={`Resetear contraseña de ${usuario.nombreCompleto}`}
                                  onClick={() => setUsuarioAResetear(usuario)}
                                >
                                  <LockResetIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {usuario.estado === 'Activo' ? (
                                <Tooltip title="Desactivar">
                                  <IconButton
                                    size="small"
                                    aria-label={`Desactivar ${usuario.nombreCompleto}`}
                                    onClick={() => setUsuarioADesactivar(usuario)}
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Reactivar">
                                  <IconButton
                                    size="small"
                                    aria-label={`Reactivar ${usuario.nombreCompleto}`}
                                    onClick={() => setUsuarioAReactivar(usuario)}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
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

      <UsuarioFormDialog
        modo={modoDialogo}
        usuario={usuarioEnEdicion ?? undefined}
        rolActor={rolActor}
        open={dialogoFormularioAbierto}
        onClose={cerrarDialogoFormulario}
        onCreado={manejarCreado}
      />

      <DialogoPasswordTemporal
        abierto={passwordTemporal !== null}
        password={passwordTemporal ?? ''}
        onCerrar={cerrarPasswordTemporal}
      />

      <DialogoConfirmacion
        abierto={usuarioADesactivar !== null}
        titulo="Desactivar empleado"
        mensaje={
          usuarioADesactivar !== null
            ? `¿Seguro que querés desactivar a «${usuarioADesactivar.nombreCompleto}»? No podrá iniciar sesión hasta que lo reactives.`
            : ''
        }
        textoConfirmar="Desactivar"
        colorConfirmar="error"
        cargando={mutacionDesactivar.isPending}
        onConfirmar={() => void manejarConfirmarDesactivacion()}
        onCancelar={() => setUsuarioADesactivar(null)}
      />

      <DialogoConfirmacion
        abierto={usuarioAReactivar !== null}
        titulo="Reactivar empleado"
        mensaje={
          usuarioAReactivar !== null
            ? `¿Seguro que querés reactivar a «${usuarioAReactivar.nombreCompleto}»? Volverá a poder iniciar sesión.`
            : ''
        }
        textoConfirmar="Reactivar"
        colorConfirmar="success"
        cargando={mutacionReactivar.isPending}
        onConfirmar={() => void manejarConfirmarReactivacion()}
        onCancelar={() => setUsuarioAReactivar(null)}
      />

      <DialogoConfirmacion
        abierto={usuarioAResetear !== null}
        titulo="Resetear contraseña"
        mensaje={
          usuarioAResetear !== null
            ? `¿Seguro que querés resetear la contraseña de «${usuarioAResetear.nombreCompleto}»? Se generará una contraseña temporal que deberás entregarle.`
            : ''
        }
        textoConfirmar="Resetear"
        colorConfirmar="warning"
        cargando={mutacionResetear.isPending}
        onConfirmar={() => void manejarConfirmarReset()}
        onCancelar={() => setUsuarioAResetear(null)}
      />
    </Box>
  )
}
