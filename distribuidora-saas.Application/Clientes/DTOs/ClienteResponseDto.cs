using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.DTOs
{
    public record ClienteResponseDto(
        Guid Id,
        string Nombre,
        string Direccion,
        string? Telefono,
        decimal? Latitud,
        decimal? Longitud,
        string? Observaciones,
        decimal SaldoDeudaActual,
        int SaldoEnvasesActual,
        string Estado,
        DateTime FechaCreacion
    );
}
