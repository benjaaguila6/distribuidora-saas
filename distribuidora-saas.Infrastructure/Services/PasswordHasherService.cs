using distribuidora_saas.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Services
{
    public class PasswordHasherService : IPasswordHasher
    {
        private readonly PasswordHasher<object> _hasher = new();
        public string HashPassword(string password)
        {
            return _hasher.HashPassword(new object(), password);
        }

        public bool VerificarPassword(string passwordHasheado, string passwordIngresado)
        {
            var resultado = _hasher.VerifyHashedPassword(new object(), passwordHasheado, passwordIngresado);
            return resultado == PasswordVerificationResult.Success;
        }
    }
}
