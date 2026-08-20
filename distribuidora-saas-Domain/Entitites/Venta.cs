using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
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

        private readonly List<VentaPago> _pagos = new();
        public IReadOnlyCollection<VentaPago> Pagos => _pagos.AsReadOnly();

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

        public void AgregarPago(FormaPago formaPago, decimal monto, decimal? importeEntregadoPorCliente = null)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto del pago debe ser mayor a cero.", nameof(monto));
            }

            if (formaPago == FormaPago.Efectivo)
            {
                if (!importeEntregadoPorCliente.HasValue || importeEntregadoPorCliente.Value < monto)
                {
                    throw new ArgumentException("Para pagos en efectivo el importe entregado debe ser mayor o igual al monto.", nameof(importeEntregadoPorCliente));
                }
            }
            else if (importeEntregadoPorCliente.HasValue)
            {
                throw new ArgumentException("El importe entregado solo aplica a pagos en efectivo.", nameof(importeEntregadoPorCliente));
            }

            _pagos.Add(new VentaPago(Id, formaPago, monto, importeEntregadoPorCliente));
        }

        public decimal CalcularValorTotalEntregado(Func<Guid, decimal> obtenerPrecioProducto)
        {
            return _productos
                .Where(p => p.TipoMovimiento == TipoMovimientoProducto.Entregado)
                .Sum(p => p.Cantidad * obtenerPrecioProducto(p.ProductoId));
        }

        public decimal CalcularDeudaGenerada(Func<Guid, decimal> obtenerPrecioProducto)
        {
            return Math.Max(0, CalcularValorTotalEntregado(obtenerPrecioProducto) - DineroRecibido);
        }

        public decimal CalcularExcedenteOFaltante(Func<Guid, decimal> obtenerPrecioProducto)
        {
            return DineroRecibido - CalcularValorTotalEntregado(obtenerPrecioProducto);
        }

        public void ValidarPagosCompletos()
        {
            var totalPagos = _pagos.Sum(p => p.Monto);

            if (totalPagos != DineroRecibido)
            {
                throw new InvalidOperationException($"La suma de los pagos ({totalPagos}) no coincide con el dinero recibido ({DineroRecibido}).");
            }
        }

    }
}
