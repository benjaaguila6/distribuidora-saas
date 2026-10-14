using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.DTOs
{
    public record ActualizarUsuarioDto(
        string Email,
        string NombreCompleto,
        RolUsuario Rol,
        string? Telefono = null
    );
}
