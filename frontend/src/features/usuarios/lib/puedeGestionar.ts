import type { RolUsuario } from '../types'

export function esRolUsuario(valor: string | null | undefined): valor is RolUsuario {
  return valor === 'Administrador' || valor === 'Gerente' || valor === 'Repartidor'
}

// Replica la matriz del backend (PoliticaGestionUsuarios) como AYUDA VISUAL para
// decidir qué acciones mostrar. La autorización real siempre la aplica el API.
//  - Administrador -> gestiona Gerentes y Repartidores.
//  - Gerente       -> gestiona SOLO Repartidores.
//  - Repartidor    -> no gestiona a nadie.
//  - El rol Administrador nunca es gestionable desde este módulo.
export function puedeGestionar(rolActor: RolUsuario, rolObjetivo: RolUsuario): boolean {
  switch (rolActor) {
    case 'Administrador':
      return rolObjetivo === 'Gerente' || rolObjetivo === 'Repartidor'
    case 'Gerente':
      return rolObjetivo === 'Repartidor'
    default:
      return false
  }
}

// Roles que el actor puede asignar al crear un empleado o al cambiar un rol.
export function rolesAsignables(rolActor: RolUsuario): RolUsuario[] {
  switch (rolActor) {
    case 'Administrador':
      return ['Gerente', 'Repartidor']
    case 'Gerente':
      return ['Repartidor']
    default:
      return []
  }
}

// Sólo un Administrador puede cambiar el rol de un tercero.
export function puedeCambiarRol(rolActor: RolUsuario): boolean {
  return rolActor === 'Administrador'
}

// Regla completa para mostrar acciones sobre una fila: nadie opera sobre un
// Administrador ni sobre su propia cuenta.
export function puedeActuarSobre(
  rolActor: RolUsuario,
  usuarioObjetivo: { id: string; rol: RolUsuario },
  usuarioIdActor: string | null,
): boolean {
  if (usuarioObjetivo.rol === 'Administrador') return false
  if (usuarioIdActor !== null && usuarioObjetivo.id === usuarioIdActor) return false
  return puedeGestionar(rolActor, usuarioObjetivo.rol)
}
