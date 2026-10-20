using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.DTOs
{
    // Alta administrativa: la contraseña NO viaja en el request.
    // El servidor genera una contraseña temporal y la devuelve una única vez.
    public record CrearUsuarioDto(
        string Email,
        string NombreCompleto,
        RolUsuario Rol,
        string? Telefono = null
    );
}
