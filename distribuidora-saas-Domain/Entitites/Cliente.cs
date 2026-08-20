using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Cliente : TenantEntity
    {
        public string Nombre { get; private set; } = string.Empty;
        public string Direccion { get; private set; } = string.Empty;
        public string? Telefono { get; private set; }
        public decimal? Latitud { get; private set; }
        public decimal? Longitud { get; private set; }
        public string? Observaciones { get; private set; }
        public decimal SaldoDeudaActual { get; private set; }
        public int SaldoEnvasesActual { get; private set; }
        public EstadoCliente Estado { get; private set; }

        private Cliente(){}

        public Cliente(Guid tenantId, string nombre, string direccion)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                throw new ArgumentException("El nombre del cliente es obligatorio.", nameof(nombre));
            }
            if (string.IsNullOrWhiteSpace(direccion))
            {
                throw new ArgumentException("La dirección del cliente es obligatoria.", nameof(direccion));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            Nombre = nombre;
            Direccion = direccion;
            Estado = EstadoCliente.Activo;
            SaldoDeudaActual = 0;
            SaldoEnvasesActual = 0;
        }

        public void ActualizarDatosContacto(string? telefono, decimal? latitud, decimal? longitud, string? observaciones)
        {
            Telefono = telefono;
            Latitud = latitud;
            Longitud = longitud;
            Observaciones = observaciones;
        }

        public void RegistrarDeuda(decimal monto)
        {
            if (monto < 0)
            {
                throw new ArgumentException("El monto de deuda no puede ser negativo.", nameof(monto));
            }

            SaldoDeudaActual += monto;
        }

        public void RegistrarPagoDeuda(decimal monto)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto a descontar de la deuda debe ser mayor a cero.", nameof(monto));
            }

            if (monto > SaldoDeudaActual)
            {
                throw new InvalidOperationException($"No hay suficiente deuda para descontar. Disponible: {SaldoDeudaActual}, solicitado: {monto}.");
            }

            SaldoDeudaActual -= monto;
        }

        public void ActualizarSaldoEnvases(int diferencia)
        {
            var nuevoSaldo = SaldoEnvasesActual + diferencia;

            if (nuevoSaldo < 0)
            {
                throw new InvalidOperationException("El saldo de envases no puede ser negativo.");
            }

            SaldoEnvasesActual = nuevoSaldo;
        }

        public void Desactivar()
        {
            Estado = EstadoCliente.Inactivo;
        }

        public void Reactivar()
        {
            Estado = EstadoCliente.Activo;
        }
    }
}
