using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.DTOs
{
    public record CrearClienteDto
    (
        string Nombre,
        string Direccion,
        string? Telefono,
        decimal? Latitud,
        decimal? Longitud,
        string? Observaciones
    );
}
