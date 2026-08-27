using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.DTOs
{
    public record RecorridoClienteResponseDto(Guid ClienteId, string NombreCliente, string Direccion, int Orden);
}
