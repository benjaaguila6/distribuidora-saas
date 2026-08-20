using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.DTOs
{
    public record CrearVentaDto(
        Guid RepartoId,
        Guid ClienteId,
        decimal DineroRecibido,
        string? Observaciones,
        List<ProductoVentaDto> Productos
    )
    {
        public List<PagoVentaDto> Pagos { get; init; } = new();
    }
}
