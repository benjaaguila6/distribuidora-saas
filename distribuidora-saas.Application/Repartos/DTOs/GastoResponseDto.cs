using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record GastoResponseDto(string Concepto, decimal Monto, string? Descripcion);
}