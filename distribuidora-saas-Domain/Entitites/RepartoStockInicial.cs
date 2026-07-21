using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class RepartoStockInicial
    {
        public Guid Id { get; private set; }
        public Guid RepartoId { get; private set; }
        public Guid ProductoId { get; private set; }
        public int CantidadInicial { get; private set; }

        private RepartoStockInicial() { }

        internal RepartoStockInicial(Guid repartoId, Guid productoId, int cantidadInicial)
        {
            Id = Guid.NewGuid();
            RepartoId = repartoId;
            ProductoId = productoId;
            CantidadInicial = cantidadInicial;
        }
    }
}
