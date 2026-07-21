using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record RepartoResponseDto(
        Guid Id,
        Guid RecorridoId,
        string NombreRecorrido,
        Guid RepartidorId,
        string NombreRepartidor,
        string Estado,
        DateTime FechaReparto,
        DateTime? FechaInicio,
        DateTime? FechaFinalizacion,
        List<StockInicialResponseDto> StockInicial
    );
}
