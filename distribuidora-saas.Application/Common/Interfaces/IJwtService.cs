using distribuidora_saas_Domain.Entitites;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerarAccessToken(Usuario usuario);
        string GenerarRefreshToken();
    }
}
