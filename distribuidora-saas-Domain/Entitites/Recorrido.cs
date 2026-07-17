using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Recorrido : TenantEntity
    {
        public string Nombre { get; private set; } = string.Empty;
        public DiaSemana DiaSemana { get; private set; }
        public bool Activo { get; private set; }

        private readonly List<RecorridoCliente> _clientes = new();
        public IReadOnlyCollection<RecorridoCliente> Clientes => _clientes.AsReadOnly();

        private Recorrido() { }

        public Recorrido(Guid tenantId, string nombre, DiaSemana diaSemana)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                throw new ArgumentException("El nombre del recorrido es obligatorio.", nameof(nombre));
            }
                
            Id = Guid.NewGuid();
            TenantId = tenantId;
            Nombre = nombre;
            DiaSemana = diaSemana;
            Activo = true;
        }

        public void AgregarCliente(Guid clienteId)
        {
            if (_clientes.Any(rc => rc.ClienteId == clienteId))
            {
                throw new InvalidOperationException("Este cliente ya forma parte del recorrido.");
            }

            var siguienteOrden = _clientes.Count == 0 ? 1 : _clientes.Max(rc => rc.Orden) + 1;
            _clientes.Add(new RecorridoCliente(Id, clienteId, siguienteOrden));
        }

        public void QuitarCliente(Guid clienteId)
        {
            var relacion = _clientes.FirstOrDefault(rc => rc.ClienteId == clienteId);
            if (relacion is null)
            {
                throw new InvalidOperationException("Este cliente no forma parte del recorrido.");
            }

            _clientes.Remove(relacion);
            ReordenarSecuencialmente();
        }

        public void ReordenarClientes(List<Guid> clienteIdsEnNuevoOrden)
        {
            if (clienteIdsEnNuevoOrden.Count != _clientes.Count)
            {
                throw new InvalidOperationException("La lista de reordenamiento debe incluir todos los clientes del recorrido.");
            }
                
            for (int i = 0; i < clienteIdsEnNuevoOrden.Count; i++)
            {
                var relacion = _clientes.FirstOrDefault(rc => rc.ClienteId == clienteIdsEnNuevoOrden[i]) ?? throw new InvalidOperationException($"El cliente {clienteIdsEnNuevoOrden[i]} no pertenece a este recorrido.");

                relacion.ActualizarOrden(i + 1);
            }
        }

        private void ReordenarSecuencialmente()
        {
            var ordenados = _clientes.OrderBy(rc => rc.Orden).ToList();
            for (int i = 0; i < ordenados.Count; i++)
            {
                ordenados[i].ActualizarOrden(i + 1);
            }
        }

        public void Desactivar() => Activo = false;
        public void Reactivar() => Activo = true;
    }
}
