using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class RepartoEnvaseRetirado
    {
        public Guid Id { get; private set; }
        public Guid RepartoId { get; private set; }
        public Guid ProductoId { get; private set; }
        public int CantidadRetirada { get; private set; }

        private RepartoEnvaseRetirado() { }

        internal RepartoEnvaseRetirado(Guid repartoId, Guid productoId, int cantidadInicial)
        {
            Id = Guid.NewGuid();
            RepartoId = repartoId;
            ProductoId = productoId;
            CantidadRetirada = cantidadInicial;
        }

        internal void AcumularCantidad(int cantidad)
        {
            CantidadRetirada += cantidad;
        }
    }
}
