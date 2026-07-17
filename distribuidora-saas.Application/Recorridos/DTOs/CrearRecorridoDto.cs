using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.DTOs
{
    public record CrearRecorridoDto(string Nombre, DiaSemana DiaSemana);
}
