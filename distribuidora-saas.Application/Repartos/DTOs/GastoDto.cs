using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record GastoDto(ConceptoGasto Concepto, decimal Monto, string? Descripcion);
}