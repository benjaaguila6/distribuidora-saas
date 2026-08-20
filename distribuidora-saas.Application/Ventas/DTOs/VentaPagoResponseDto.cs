using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.DTOs
{
    public record VentaPagoResponseDto(string FormaPago, decimal Monto, decimal? ImporteEntregadoPorCliente, decimal? Vuelto);
}