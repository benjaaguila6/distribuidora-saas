using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record EnvaseCierreDto(Guid ProductoId, string NombreProducto, int CantidadEsperada, int CantidadRecibida, int Diferencia);
}