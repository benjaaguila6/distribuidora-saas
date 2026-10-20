import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useActualizarUsuarioMutation } from '../hooks/useActualizarUsuarioMutation'
import { useCrearUsuarioMutation } from '../hooks/useCrearUsuarioMutation'
import { puedeCambiarRol, rolesAsignables } from '../lib/puedeGestionar'
import { analizarErrorFormularioUsuarios } from '../lib/mensajeErrorUsuarios'
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  RolUsuario,
  UsuarioCreadoResponse,
  UsuarioResponse,
} from '../types'

export type ModoFormularioUsuario = 'crear' | 'editar'

interface ValoresFormularioUsuario {
  nombreCompleto: string
  email: string
  telefono: string
  rol: RolUsuario
}

interface UsuarioFormDialogProps {
  modo: ModoFormularioUsuario
  usuario?: UsuarioResponse
  rolActor: RolUsuario
  open: boolean
  onClose: () => void
  onCreado: (usuario: UsuarioCreadoResponse) => void
}

const CAMPOS_FORMULARIO = ['nombreCompleto', 'email', 'telefono', 'rol'] as const

function convertirAOpcional(valor: string): string | null {
  const recortado = valor.trim()
  return recortado.length === 0 ? null : recortado
}

export default function UsuarioFormDialog({
  modo,
  usuario,
  rolActor,
  open,
  onClose,
  onCreado,
}: UsuarioFormDialogProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacionCrear = useCrearUsuarioMutation()
  const mutacionActualizar = useActualizarUsuarioMutation()

  const opcionesRol = useMemo(() => rolesAsignables(rolActor), [rolActor])
  const puedeEditarRol = puedeCambiarRol(rolActor)
  const esCreacion = modo === 'crear'

  const valoresIniciales = useMemo<ValoresFormularioUsuario>(
    () => ({
      nombreCompleto: usuario?.nombreCompleto ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      rol: usuario?.rol ?? opcionesRol[0] ?? 'Repartidor',
    }),
    [usuario, opcionesRol],
  )

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ValoresFormularioUsuario>({ values: valoresIniciales })

  const guardando = mutacionCrear.isPending || mutacionActualizar.isPending

  const manejarCierre = () => {
    setErrorServidor(null)
    onClose()
  }

  const alEnviar = handleSubmit(async (valores) => {
    setErrorServidor(null)

    const telefono = convertirAOpcional(valores.telefono)

    try {
      if (esCreacion) {
        const dtoCrear: CrearUsuarioInput = {
          email: valores.email.trim(),
          nombreCompleto: valores.nombreCompleto.trim(),
          rol: valores.rol,
          telefono,
        }
        const creado = await mutacionCrear.mutateAsync(dtoCrear)
        onCreado(creado)
        // La contraseña temporal no debe quedar en el estado de la mutación.
        mutacionCrear.reset()
        manejarCierre()
      } else if (usuario !== undefined) {
        const datos: ActualizarUsuarioInput = {
          nombreCompleto: valores.nombreCompleto.trim(),
          rol: puedeEditarRol ? valores.rol : usuario.rol,
          telefono,
        }
        await mutacionActualizar.mutateAsync({ id: usuario.id, datos })
        manejarCierre()
      }
    } catch (error) {
      const analisis = analizarErrorFormularioUsuarios(
        error,
        esCreacion ? 'No se pudo crear el empleado.' : 'No se pudo actualizar el empleado.',
      )

      if (analisis.esEmailDuplicado) {
        setError('email', {
          type: 'server',
          message: 'Ya existe un usuario registrado con ese email.',
        })
        return
      }

      for (const { campo, mensaje } of analisis.erroresCampos) {
        const campoValido = CAMPOS_FORMULARIO.find((nombre) => nombre === campo)
        if (campoValido !== undefined) {
          setError(campoValido, { type: 'server', message: mensaje })
        } else {
          setErrorServidor(mensaje)
        }
      }

      if (analisis.mensajeGeneral !== null) {
        setErrorServidor(analisis.mensajeGeneral)
      }
    }
  })

  return (
    <Dialog open={open} onClose={guardando ? undefined : manejarCierre} fullWidth maxWidth="sm">
      <DialogTitle>{esCreacion ? 'Nuevo empleado' : 'Editar empleado'}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="formulario-usuario"
          onSubmit={alEnviar}
          noValidate
          sx={{ display: 'grid', gap: 2.5 }}
        >
          {errorServidor !== null && <Alert severity="error">{errorServidor}</Alert>}
          <TextField
            label="Nombre completo"
            required
            fullWidth
            autoFocus
            error={errors.nombreCompleto !== undefined}
            helperText={errors.nombreCompleto?.message}
            {...register('nombreCompleto', {
              required: 'El nombre completo es obligatorio.',
              maxLength: {
                value: 200,
                message: 'El nombre no puede superar los 200 caracteres.',
              },
            })}
          />
          <TextField
            label="Email"
            type="email"
            required={esCreacion}
            fullWidth
            disabled={!esCreacion}
            error={errors.email !== undefined}
            helperText={
              errors.email?.message ??
              (esCreacion ? undefined : 'El email no puede modificarse.')
            }
            {...register('email', {
              required: esCreacion ? 'El email es obligatorio.' : false,
              pattern: esCreacion
                ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'El formato del email no es válido.' }
                : undefined,
            })}
          />
          <TextField
            label="Teléfono"
            fullWidth
            error={errors.telefono !== undefined}
            helperText={errors.telefono?.message}
            {...register('telefono', {
              maxLength: {
                value: 30,
                message: 'El teléfono no puede superar los 30 caracteres.',
              },
              validate: (valor) =>
                valor.trim().length === 0 ||
                /^[0-9+\-\s()]*$/.test(valor) ||
                'El formato del teléfono no es válido.',
            })}
          />
          {esCreacion ? (
            <Controller
              name="rol"
              control={control}
              rules={{ required: 'El rol es obligatorio.' }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Rol"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error !== undefined}
                  helperText={fieldState.error?.message}
                >
                  {opcionesRol.map((opcion) => (
                    <MenuItem key={opcion} value={opcion}>
                      {opcion}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          ) : (
            puedeEditarRol && (
              <Controller
                name="rol"
                control={control}
                rules={{ required: 'El rol es obligatorio.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    label="Rol"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error !== undefined}
                    helperText={fieldState.error?.message}
                  >
                    {opcionesRol.map((opcion) => (
                      <MenuItem key={opcion} value={opcion}>
                        {opcion}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={manejarCierre} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" form="formulario-usuario" variant="contained" loading={guardando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
