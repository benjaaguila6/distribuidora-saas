using distribuidora_saas.Application.Ventas.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.DTOs
{
    public record HistorialVentaClienteDto(
        Guid VentaId,
        Guid RepartoId,
        DateTime FechaVenta,
        decimal DineroRecibido,
        decimal ValorTotalEntregado,
        decimal DeudaGenerada,
        int EnvasesPrestados,
        int EnvasesDevueltos,
        List<VentaProductoResponseDto> Productos,
        List<VentaPagoResponseDto> Pagos
    );
}
