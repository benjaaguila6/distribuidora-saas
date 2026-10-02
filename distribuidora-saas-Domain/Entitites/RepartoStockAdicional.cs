using distribuidora_saas_Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    // Stock cargado a mitad de un reparto ya en curso (decision 3.C: trazable y acumulado).
    // A diferencia de RepartoStockInicial, este registro NO es parte de la colección en memoria
    // del AR Reparto: cada carga es una fila independiente que el reporte de cierre suma por producto.
    // Hereda de TenantEntity para que el Global Query Filter del DbContext lo aísle por tenant.
    public class RepartoStockAdicional : TenantEntity
    {
        public Guid RepartoId { get; private set; }
        public Guid ProductoId { get; private set; }
        public int Cantidad { get; private set; }
        public Guid UsuarioId { get; private set; }
        public DateTime FechaHora { get; private set; }

        private RepartoStockAdicional() { }

        public RepartoStockAdicional(Guid tenantId, Guid repartoId, Guid productoId, Guid usuarioId, int cantidad, DateTime fechaHora)
        {
            if (cantidad <= 0)
            {
                throw new ArgumentException("La cantidad debe ser mayor a cero.", nameof(cantidad));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            RepartoId = repartoId;
            ProductoId = productoId;
            UsuarioId = usuarioId;
            Cantidad = cantidad;
            FechaHora = fechaHora;
        }

        internal void DescontarCantidad(int cantidad)
        {
            if (cantidad <= 0)
            {
                return;
            }

            if (cantidad >= Cantidad)
            {
                Cantidad = 0;
                return;
            }

            Cantidad -= cantidad;
        }
    }
}
