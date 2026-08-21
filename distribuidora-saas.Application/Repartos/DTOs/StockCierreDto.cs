using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record StockCierreDto(Guid ProductoId, string NombreProducto, int CantidadInicial, int CantidadVendida, int CantidadRestante);
}