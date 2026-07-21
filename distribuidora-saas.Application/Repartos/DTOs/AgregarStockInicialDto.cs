using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record AgregarStockInicialDto(Guid ProductoId, int Cantidad);
}
