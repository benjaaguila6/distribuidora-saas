using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Common.Interfaces
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerificarPassword(string passwordHasheado, string passwordIngresado);
    }
}
