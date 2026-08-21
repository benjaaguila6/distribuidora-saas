using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Gasto
    {
        public Guid Id { get; private set; }
        public Guid RepartoId { get; private set; }
        public ConceptoGasto Concepto { get; private set; }
        public decimal Monto { get; private set; }
        public string? Descripcion { get; private set; }

        private Gasto() { }

        internal Gasto(Guid repartoId, ConceptoGasto concepto, decimal monto, string? descripcion)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto del gasto debe ser mayor a cero.", nameof(monto));
            }

            Id = Guid.NewGuid();
            RepartoId = repartoId;
            Concepto = concepto;
            Monto = monto;
            Descripcion = descripcion;
        }
    }
}