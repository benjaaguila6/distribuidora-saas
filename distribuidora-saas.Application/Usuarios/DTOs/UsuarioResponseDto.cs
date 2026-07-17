using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.DTOs
{
    public record UsuarioResponseDto(
        Guid Id,
        string Email,
        string NombreCompleto,
        string Rol,
        string Estado,
        DateTime FechaCreacion
    );
}
