using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Venta : TenantEntity
    {
        public Guid RepartoId { get; private set; }
        public Guid ClienteId { get; private set; }
        public decimal DineroRecibido { get; private set; }
        public string? Observaciones { get; private set; }
        public DateTime FechaVenta { get; private set; }

        private readonly List<VentaProducto> _productos = new();
        public IReadOnlyCollection<VentaProducto> Productos => _productos.AsReadOnly();

        private Venta() { }

        public Venta(Guid tenantId, Guid repartoId, Guid clienteId, decimal dineroRecibido, string? observaciones)
        {
            if (dineroRecibido < 0)
            {
                throw new ArgumentException("El dinero recibido no puede ser negativo.", nameof(dineroRecibido));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            RepartoId = repartoId;
            ClienteId = clienteId;
            DineroRecibido = dineroRecibido;
            Observaciones = observaciones;
            FechaVenta = DateTime.UtcNow;
        }

        public void AgregarProducto(Guid productoId, TipoMovimientoProducto tipoMovimiento, int cantidad)
        {
            if (cantidad <= 0)
            {
                throw new ArgumentException("La cantidad debe ser mayor a cero.", nameof(cantidad));
            }
                
            _productos.Add(new VentaProducto(Id, productoId, tipoMovimiento, cantidad));
        }

    }
}
