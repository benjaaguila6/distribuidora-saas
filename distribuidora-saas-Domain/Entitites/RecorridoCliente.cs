using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class RecorridoCliente
    {
        public Guid Id { get; private set; }
        public Guid RecorridoId { get; private set; }
        public Guid ClienteId { get; private set; }
        public int Orden { get; private set; }

        private RecorridoCliente() { }

        internal RecorridoCliente(Guid recorridoId, Guid clienteId, int orden)
        {
            Id = Guid.NewGuid();
            RecorridoId = recorridoId;
            ClienteId = clienteId;
            Orden = orden;
        }

        internal void ActualizarOrden(int nuevoOrden)
        {
            Orden = nuevoOrden;
        }
    }
}
