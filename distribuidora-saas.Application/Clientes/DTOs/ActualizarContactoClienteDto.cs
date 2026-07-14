using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.DTOs
{
    public record ActualizarContactoClienteDto(

        string? Telefono,
        decimal? Latitud,
        decimal? Longitud,
        string? Observaciones

    );
}
