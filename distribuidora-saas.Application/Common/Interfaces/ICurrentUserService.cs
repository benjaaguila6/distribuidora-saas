using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
       Guid? UsuarioId { get; }
       RolUsuario? Rol { get; }
    }
}