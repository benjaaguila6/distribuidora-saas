using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
       Guid? UsuarioId { get; }
    }
}