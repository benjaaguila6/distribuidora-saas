using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.DTOs
{
    public record PagoVentaDto(FormaPago FormaPago, decimal Monto, decimal? ImporteEntregadoPorCliente);
}