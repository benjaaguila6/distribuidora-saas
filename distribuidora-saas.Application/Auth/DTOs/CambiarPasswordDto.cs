using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Auth.DTOs
{
    public record CambiarPasswordDto(string PasswordActual, string PasswordNueva);
}
