using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.DTOs
{
    public record ReordenarClientesRecorridoDto(List<Guid> ClienteIdsEnOrden);
}
