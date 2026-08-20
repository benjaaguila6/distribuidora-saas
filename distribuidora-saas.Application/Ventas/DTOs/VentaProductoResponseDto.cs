using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.DTOs
{
    public record VentaProductoResponseDto(Guid ProductoId, string NombreProducto, string TipoMovimiento, int Cantidad);
}
