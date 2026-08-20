using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Reparto : TenantEntity
    {
        public Guid RecorridoId { get; private set; }
        public Guid RepartidorId { get; private set; }
        public EstadoReparto Estado { get; private set; }
        public DateTime FechaReparto { get; private set; }
        public DateTime? FechaInicio { get; private set; }
        public DateTime? FechaFinalizacion { get; private set; }

        private readonly List<RepartoStockInicial> _stockInicial = new();
        public IReadOnlyCollection<RepartoStockInicial> StockInicial => _stockInicial.AsReadOnly();

        private readonly List<RepartoEnvaseRetirado> _envasesRetirados = new();
        public IReadOnlyCollection<RepartoEnvaseRetirado> EnvasesRetirados => _envasesRetirados.AsReadOnly();

        private Reparto() { }

        public Reparto(Guid tenantId, Guid recorridoId, Guid repartidorId, DateTime fechaReparto)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            RecorridoId = recorridoId;
            RepartidorId = repartidorId;
            FechaReparto = fechaReparto;
            Estado = EstadoReparto.Planificado;
        }

        public void AgregarStockInicial(Guid productoId, int cantidad)
        {
            if (Estado != EstadoReparto.Planificado)
                throw new InvalidOperationException("Solo se puede cargar stock inicial mientras el reparto está en estado Planificado.");

            if (cantidad <= 0)
                throw new ArgumentException("La cantidad debe ser mayor a cero.", nameof(cantidad));

            if (_stockInicial.Any(s => s.ProductoId == productoId))
                throw new InvalidOperationException("Este producto ya tiene stock inicial cargado en este reparto.");

            _stockInicial.Add(new RepartoStockInicial(Id, productoId, cantidad));
        }

        public void DescontarStock(Guid productoId, int cantidad)
        {
            if (Estado != EstadoReparto.EnCurso)
            {
                throw new InvalidOperationException("Solo se puede descontar stock de un reparto que esté en curso.");
            }

            var stockProducto = _stockInicial.FirstOrDefault(s => s.ProductoId == productoId) ?? throw new InvalidOperationException("Este producto no fue cargado en el stock inicial de este reparto.");

            stockProducto.DescontarCantidad(cantidad);
        }

        public void RegistrarEnvaseRetirado(Guid productoId, int cantidad)
        {
            if (Estado != EstadoReparto.EnCurso)
            {
                throw new InvalidOperationException("Solo se puede registrar envases retirados en un reparto que esté en curso.");
            }

            var registro = _envasesRetirados.FirstOrDefault(e => e.ProductoId == productoId);

            if (registro is null)
            {
                _envasesRetirados.Add(new RepartoEnvaseRetirado(Id, productoId, cantidad));
            }
            else
            {
                registro.AcumularCantidad(cantidad);
            }
        }

        // Método de consulta para el cierre del reparto
        public int ObtenerCantidadEsperadaDeEnvases(Guid productoId)
        {
            throw new NotImplementedException("Se implementa en el bloque de Cierre de Reparto.");
        }

        public void IniciarReparto()
        {
            if (Estado != EstadoReparto.Planificado)
            {
                throw new InvalidOperationException("Solo se puede iniciar un reparto que esté en estado Planificado.");
            }

            if (_stockInicial.Count == 0)
            {
                throw new InvalidOperationException("No se puede iniciar un reparto sin stock inicial cargado.");
            }

            Estado = EstadoReparto.EnCurso;
            FechaInicio = DateTime.UtcNow;
        }

        public void FinalizarReparto()
        {
            if (Estado != EstadoReparto.EnCurso)
                throw new InvalidOperationException("Solo se puede finalizar un reparto que esté en curso.");

            Estado = EstadoReparto.Finalizado;
            FechaFinalizacion = DateTime.UtcNow;
        }

        public void CancelarReparto()
        {
            if (Estado == EstadoReparto.Finalizado)
                throw new InvalidOperationException("No se puede cancelar un reparto que ya fue finalizado.");

            Estado = EstadoReparto.Cancelado;
        }
    }
}
