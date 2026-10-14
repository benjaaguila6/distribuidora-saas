using distribuidora_saas_Domain.Enums;

namespace distribuidora_saas.Application.Usuarios
{
    /// <summary>
    /// Reglas puras de la matriz de permisos del módulo de gestión de usuarios.
    /// No depende de infraestructura: recibe roles y devuelve un booleano, de modo
    /// que pueda reutilizarse y testearse de forma aislada.
    ///
    /// Matriz:
    ///  - Administrador -> gestiona Gerentes y Repartidores.
    ///  - Gerente       -> gestiona SOLO Repartidores.
    ///  - Repartidor    -> no gestiona a nadie.
    /// El rol Administrador nunca es gestionable ni asignable desde este módulo.
    /// </summary>
    public static class PoliticaGestionUsuarios
    {
        /// <summary>Indica si <paramref name="actor"/> puede operar sobre un usuario con rol <paramref name="objetivo"/>.</summary>
        public static bool PuedeGestionar(RolUsuario actor, RolUsuario objetivo) => actor switch
        {
            RolUsuario.Administrador => objetivo is RolUsuario.Gerente or RolUsuario.Repartidor,
            RolUsuario.Gerente => objetivo is RolUsuario.Repartidor,
            _ => false
        };

        /// <summary>Solo el Administrador puede cambiar el rol de un usuario.</summary>
        public static bool PuedeCambiarRol(RolUsuario actor) => actor == RolUsuario.Administrador;

        /// <summary>Roles que <paramref name="actor"/> puede asignar (al crear o al cambiar el rol de un tercero).</summary>
        public static bool PuedeAsignarRol(RolUsuario actor, RolUsuario nuevoRol) => nuevoRol switch
        {
            RolUsuario.Repartidor => actor is RolUsuario.Administrador or RolUsuario.Gerente,
            RolUsuario.Gerente => actor is RolUsuario.Administrador,
            _ => false
        };

        /// <summary>Colección de roles asignables al crear un empleado según el actor.</summary>
        public static IReadOnlyCollection<RolUsuario> RolesAsignables(RolUsuario actor) => actor switch
        {
            RolUsuario.Administrador => new[] { RolUsuario.Gerente, RolUsuario.Repartidor },
            RolUsuario.Gerente => new[] { RolUsuario.Repartidor },
            _ => Array.Empty<RolUsuario>()
        };
    }
}
