using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.DTOs
{
    public record VentaResponseDto(
        Guid Id,
        Guid RepartoId,
        Guid ClienteId,
        string NombreCliente,
        decimal DineroRecibido,
        string? Observaciones,
        DateTime FechaVenta,
        List<VentaProductoResponseDto> Productos,
        List<VentaPagoResponseDto> Pagos
    );
}
