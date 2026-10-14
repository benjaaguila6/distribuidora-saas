using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.DTOs
{
    // Respuesta del alta de empleados. Incluye la contraseña temporal en claro
    // UNA SOLA VEZ: no se persiste en claro ni se registra en logs, y no forma
    // parte del DTO de lectura (UsuarioResponseDto).
    public record UsuarioCreadoResponseDto(
        Guid Id,
        string Email,
        string NombreCompleto,
        string Rol,
        string Estado,
        DateTime FechaCreacion,
        bool DebeCambiarPassword,
        string? Telefono,
        string PasswordTemporal
    );
}
