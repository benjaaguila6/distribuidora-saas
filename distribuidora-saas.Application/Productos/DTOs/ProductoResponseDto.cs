using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Productos.DTOs
{
    public record ProductoResponseDto(
        Guid Id,
        string Nombre,
        decimal Precio,
        decimal Costo,
        string TipoEnvase,
        bool Activo,
        DateTime FechaCreacion
    );
}
