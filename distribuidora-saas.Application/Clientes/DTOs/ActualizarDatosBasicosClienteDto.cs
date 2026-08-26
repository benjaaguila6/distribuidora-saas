using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.DTOs
{
    public record ActualizarDatosBasicosClienteDto(

        string Nombre,
        string Direccion

    );
}
