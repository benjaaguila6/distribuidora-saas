using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record FinalizarRepartoDto(decimal CajaEntregada)
    {
        public List<GastoDto> Gastos { get; init; } = new();
    }
}