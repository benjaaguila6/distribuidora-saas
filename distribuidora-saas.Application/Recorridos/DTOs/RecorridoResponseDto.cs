using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.DTOs
{
    public record RecorridoResponseDto(
        Guid Id,
        string Nombre,
        string DiaSemana,
        bool Activo,
        DateTime FechaCreacion,
        List<RecorridoClienteResponseDto> Clientes
    );
}
