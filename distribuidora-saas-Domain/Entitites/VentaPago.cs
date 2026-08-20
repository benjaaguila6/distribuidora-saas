using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class VentaPago
    {
        public Guid Id { get; private set; }
        public Guid VentaId { get; private set; }
        public FormaPago FormaPago { get; private set; }
        public decimal Monto { get; private set; }
        public decimal? ImporteEntregadoPorCliente { get; private set; }
        public decimal? Vuelto { get; private set; }

        private VentaPago() { }

        internal VentaPago(Guid ventaId, FormaPago formaPago, decimal monto, decimal? importeEntregadoPorCliente)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto debe ser mayor a cero.", nameof(monto));
            }

            decimal? importe = null;
            decimal? vuelto = null;

            if (formaPago == FormaPago.Efectivo)
            {
                if (!importeEntregadoPorCliente.HasValue)
                {
                    throw new ArgumentException("Para pagos en efectivo el importe entregado es obligatorio.", nameof(importeEntregadoPorCliente));
                }

                if (importeEntregadoPorCliente.Value < monto)
                {
                    throw new ArgumentException("El importe entregado no puede ser menor al monto del pago.", nameof(importeEntregadoPorCliente));
                }

                importe = importeEntregadoPorCliente.Value;
                vuelto = importe - monto;
            }
            else if (importeEntregadoPorCliente.HasValue)
            {
                throw new ArgumentException("El importe entregado solo aplica a pagos en efectivo.", nameof(importeEntregadoPorCliente));
            }

            Id = Guid.NewGuid();
            VentaId = ventaId;
            FormaPago = formaPago;
            Monto = monto;
            ImporteEntregadoPorCliente = importe;
            Vuelto = vuelto;
        }
    }
}