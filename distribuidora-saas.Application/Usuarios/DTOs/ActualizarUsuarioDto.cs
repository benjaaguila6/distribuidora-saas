using distribuidora_saas_Domain.Enums;

namespace distribuidora_saas.Application.Usuarios.DTOs
{
    // Edición administrativa: el email no es editable.
    // El rol sólo puede cambiarlo un Administrador (validado en el controlador).
    public record ActualizarUsuarioDto(
        string NombreCompleto,
        RolUsuario Rol,
        string? Telefono = null
    );
}
