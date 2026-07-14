using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Auth.DTOs
{
    public record LoginResponseDto(
        string AccessToken,
        string RefreshToken,
        DateTime AccessTokenExpiracion,
        string NombreCompleto,
        string Rol
    );
}
