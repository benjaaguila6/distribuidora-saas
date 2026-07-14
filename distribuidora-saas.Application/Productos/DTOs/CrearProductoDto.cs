using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Productos.DTOs
{
    public record CrearProductoDto(

        string Nombre,
        decimal Precio,
        decimal Costo,
        TipoEnvase TipoEnvase
    );
}
