using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    // MovimientoEnvase crece indefinidamente (cada movimiento de envase a lo largo del tiempo),
    // a diferencia de RecorridoCliente que es acotado por recorrido; cargarlo como colección del
    // AR Cliente generaría lecturas y memoria desproporcionadas.
    public class MovimientoEnvase : TenantEntity
    {
        public Guid ClienteId { get; private set; }
        public Guid VentaId { get; private set; }
        public Guid ProductoId { get; private set; }
        public TipoMovimientoEnvase TipoMovimiento { get; private set; }
        public int Cantidad { get; private set; }
        public DateTime Fecha { get; private set; }

        private MovimientoEnvase() { }

        // Constructor internal: solo el código de Domain puede instanciar la entidad directamente,
        // manteniendo el mismo control de invariantes que las entidades de detalle (VentaProducto,
        // RepartoEnvaseRetirado, etc.). Como MovimientoEnvase no vive en una colección en memoria de
        // un Aggregate Root, la creación desde Application/Infrastructure (Etapa 3) se hace a través
        // de la fábrica pública Crear(...), que valida los argumentos antes de instanciar.
        internal MovimientoEnvase(Guid tenantId, Guid clienteId, Guid ventaId, Guid productoId, TipoMovimientoEnvase tipoMovimiento, int cantidad)
        {
            if (cantidad <= 0)
            {
                throw new ArgumentException("La cantidad debe ser mayor a cero.", nameof(cantidad));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            ClienteId = clienteId;
            VentaId = ventaId;
            ProductoId = productoId;
            TipoMovimiento = tipoMovimiento;
            Cantidad = cantidad;
            Fecha = DateTime.UtcNow;
        }

        public static MovimientoEnvase Crear(Guid tenantId, Guid clienteId, Guid ventaId, Guid productoId, TipoMovimientoEnvase tipoMovimiento, int cantidad)
        {
            return new MovimientoEnvase(tenantId, clienteId, ventaId, productoId, tipoMovimiento, cantidad);
        }
    }
}