using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Usuario : TenantEntity
    {
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string NombreCompleto { get; private set; } = string.Empty;
        public RolUsuario Rol { get; private set; }
        public EstadoUsuario Estado { get; private set; }
        public string? RefreshToken { get; private set; }
        public DateTime? RefreshTokenExpiracion { get; private set; }

        private Usuario() { }

        public Usuario(Guid tenantId, string email, string passwordHash, string nombreCompleto, RolUsuario rol)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("El email es obligatorio.", nameof(email));
            }
               

            if (string.IsNullOrWhiteSpace(passwordHash))
            {
                throw new ArgumentException("La contraseña es obligatoria.", nameof(passwordHash));
            }
               

            if (string.IsNullOrWhiteSpace(nombreCompleto))
            {
                throw new ArgumentException("El nombre completo es obligatorio.", nameof(nombreCompleto));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            Email = email.Trim().ToLowerInvariant();
            PasswordHash = passwordHash;
            NombreCompleto = nombreCompleto;
            Rol = rol;
            Estado = EstadoUsuario.Activo;
        }

        public void EstablecerRefreshToken(string refreshToken, DateTime expiracion)
        {
            RefreshToken = refreshToken;
            RefreshTokenExpiracion = expiracion;
        }

        public void InvalidarRefreshToken()
        {
            RefreshToken = null;
            RefreshTokenExpiracion = null;
        }

        public bool TieneRefreshTokenValido(string refreshToken)
        {
            return RefreshToken == refreshToken && RefreshTokenExpiracion.HasValue && RefreshTokenExpiracion.Value > DateTime.UtcNow;
        }

        public void Desactivar() => Estado = EstadoUsuario.Inactivo;
        public void Reactivar() => Estado = EstadoUsuario.Activo;

        public void CambiarPasswordHash(string nuevoPasswordHash)
        {
            if (string.IsNullOrWhiteSpace(nuevoPasswordHash))
            {
                throw new ArgumentException("La contraseña es obligatoria.", nameof(nuevoPasswordHash));
            }

            PasswordHash = nuevoPasswordHash;
        }
    }
}
