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
        public string? Telefono { get; private set; }
        public RolUsuario Rol { get; private set; }
        public EstadoUsuario Estado { get; private set; }
        public bool DebeCambiarPassword { get; private set; }
        public string? RefreshToken { get; private set; }
        public DateTime? RefreshTokenExpiracion { get; private set; }

        private Usuario() { }

        public Usuario(Guid tenantId, string email, string passwordHash, string nombreCompleto, RolUsuario rol, string? telefono = null)
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
            EstablecerTelefono(telefono);
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

        public void Desactivar()
        {
            Estado = EstadoUsuario.Inactivo;
            InvalidarRefreshToken();
        }

        public void Reactivar() => Estado = EstadoUsuario.Activo;

        public void ActualizarNombreCompleto(string nombreCompleto)
        {
            if (string.IsNullOrWhiteSpace(nombreCompleto))
            {
                throw new ArgumentException("El nombre completo es obligatorio.", nameof(nombreCompleto));
            }

            NombreCompleto = nombreCompleto.Trim();
        }

        public void ActualizarEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("El email es obligatorio.", nameof(email));
            }

            Email = email.Trim().ToLowerInvariant();
        }

        // Actualiza los datos personales editables (nombre y teléfono).
        public void ActualizarDatosBasicos(string nombreCompleto, string? telefono)
        {
            ActualizarNombreCompleto(nombreCompleto);
            EstablecerTelefono(telefono);
        }

        // El cambio de rol nunca puede otorgar el rol Administrador desde este módulo.
        public void CambiarRol(RolUsuario nuevoRol)
        {
            if (nuevoRol == RolUsuario.Administrador)
            {
                throw new ArgumentException("No está permitido asignar el rol Administrador.", nameof(nuevoRol));
            }

            Rol = nuevoRol;
        }

        private void EstablecerTelefono(string? telefono)
        {
            if (telefono is not null && telefono.Trim().Length > 30)
            {
                throw new ArgumentException("El teléfono no puede superar los 30 caracteres.", nameof(telefono));
            }

            Telefono = string.IsNullOrWhiteSpace(telefono) ? null : telefono.Trim();
        }

        public void CambiarPasswordHash(string nuevoPasswordHash)
        {
            if (string.IsNullOrWhiteSpace(nuevoPasswordHash))
            {
                throw new ArgumentException("La contraseña es obligatoria.", nameof(nuevoPasswordHash));
            }

            PasswordHash = nuevoPasswordHash;
        }

        // Reseteo administrativo: se asigna una contraseña temporal y el usuario
        // deberá cambiarla en su próximo inicio de sesión.
        public void ResetearPassword(string nuevoPasswordHash)
        {
            CambiarPasswordHash(nuevoPasswordHash);
            DebeCambiarPassword = true;
            InvalidarRefreshToken();
        }

        // El propio usuario define su contraseña definitiva.
        public void EstablecerPasswordPropia(string nuevoPasswordHash)
        {
            CambiarPasswordHash(nuevoPasswordHash);
            DebeCambiarPassword = false;
        }
    }
}
