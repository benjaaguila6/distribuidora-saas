using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record CrearRepartoDto(Guid RecorridoId, Guid RepartidorId, DateTime FechaReparto);
}
