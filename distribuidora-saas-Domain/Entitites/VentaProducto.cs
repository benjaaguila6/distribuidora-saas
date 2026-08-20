using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class VentaProducto
    {
        public Guid Id { get; private set; }
        public Guid VentaId { get; private set; }
        public Guid ProductoId { get; private set; }
        public TipoMovimientoProducto TipoMovimiento { get; private set; }
        public int Cantidad { get; private set; }

        private VentaProducto() { }

        internal VentaProducto(Guid ventaId, Guid productoId, TipoMovimientoProducto tipoMovimiento, int cantidad)
        {
            Id = Guid.NewGuid();
            VentaId = ventaId;
            ProductoId = productoId;
            TipoMovimiento = tipoMovimiento;
            Cantidad = cantidad;
        }
    }
}
