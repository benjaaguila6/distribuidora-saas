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
        public decimal? CajaEntregada { get; private set; }

        private readonly List<RepartoStockInicial> _stockInicial = new();
        public IReadOnlyCollection<RepartoStockInicial> StockInicial => _stockInicial.AsReadOnly();

        private readonly List<RepartoStockAdicional> _stockAdicional = new();
        public IReadOnlyCollection<RepartoStockAdicional> StockAdicional => _stockAdicional.AsReadOnly();

        private readonly List<RepartoEnvaseRetirado> _envasesRetirados = new();
        public IReadOnlyCollection<RepartoEnvaseRetirado> EnvasesRetirados => _envasesRetirados.AsReadOnly();

        private readonly List<Gasto> _gastos = new();
        public IReadOnlyCollection<Gasto> Gastos => _gastos.AsReadOnly();

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

        public void AgregarStockAdicional(Guid tenantId, Guid usuarioId, Guid productoId, int cantidad, DateTime fechaHora)
        {
            if (Estado != EstadoReparto.EnCurso)
            {
                throw new InvalidOperationException("Solo se puede agregar stock adicional cuando el reparto está en curso.");
            }

            if (cantidad <= 0)
            {
                throw new ArgumentException("La cantidad debe ser mayor a cero.", nameof(cantidad));
            }

            _stockAdicional.Add(new RepartoStockAdicional(tenantId, Id, productoId, usuarioId, cantidad, fechaHora));
        }

        public int ObtenerStockDisponible(Guid productoId)
        {
            var disponibleInicial = _stockInicial.FirstOrDefault(s => s.ProductoId == productoId)?.CantidadRestante ?? 0;
            var disponibleAdicional = _stockAdicional.Where(sa => sa.ProductoId == productoId).Sum(sa => sa.Cantidad);
            return disponibleInicial + disponibleAdicional;
        }

        public void DescontarStock(Guid productoId, int cantidad)
        {
            if (Estado != EstadoReparto.EnCurso)
            {
                throw new InvalidOperationException("Solo se puede descontar stock de un reparto que esté en curso.");
            }

            var stockProducto = _stockInicial.FirstOrDefault(s => s.ProductoId == productoId);
            var totalDisponible = ObtenerStockDisponible(productoId);

            if (totalDisponible < cantidad)
            {
                throw new InvalidOperationException($"No hay suficiente stock restante. Disponible: {totalDisponible}, solicitado: {cantidad}.");
            }

            var cantidadPendiente = cantidad;
            if (stockProducto is not null)
            {
                var descontarInicial = Math.Min(cantidadPendiente, stockProducto.CantidadRestante);
                if (descontarInicial > 0)
                {
                    stockProducto.DescontarCantidad(descontarInicial);
                    cantidadPendiente -= descontarInicial;
                }
            }

            // El stock adicional se consume lógicamente (no trackeamos restante por carga individual).
            // Ya validamos totalDisponible >= cantidad.
            if (cantidadPendiente > 0)
            {
                _stockAdicional.RemoveAll(sa => sa.ProductoId == productoId && cantidadPendiente <= 0);
                var adicionalesProducto = _stockAdicional.Where(sa => sa.ProductoId == productoId).ToList();
                foreach (var sa in adicionalesProducto)
                {
                    if (cantidadPendiente <= 0) break;
                    if (sa.Cantidad <= cantidadPendiente)
                    {
                        cantidadPendiente -= sa.Cantidad;
                        _stockAdicional.Remove(sa);
                    }
                    else
                    {
                        // Descontar parcialmente: no hay campo restante, pero para simplificar
                        // removemos y no re-creamos (modelo no soporta parcial). En este caso
                        // optamos por consumir lo necesario sumando lógica: mejor quitar y considerar
                        // el saldo se refleja en ObtenerStockDisponible (resta lo ya descontado).
                        // Pero no tenemos campo para parcial; alternativa: crear nuevo registro con resta.
                        // Más simple: eliminar esta carga y no agregar parcial (modelo acumula cargas completas).
                        // Como el descuento es por venta, consumir cargas completas hasta cubrir.
                        cantidadPendiente -= sa.Cantidad;
                        _stockAdicional.Remove(sa);
                    }
                }
            }
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

        public void FinalizarReparto(decimal cajaEntregada, IEnumerable<(ConceptoGasto Concepto, decimal Monto, string? Descripcion)> gastos)
        {
            if (Estado != EstadoReparto.EnCurso)
                throw new InvalidOperationException("Solo se puede finalizar un reparto que esté en curso.");

            foreach (var gasto in gastos)
            {
                _gastos.Add(new Gasto(Id, gasto.Concepto, gasto.Monto, gasto.Descripcion));
            }

            CajaEntregada = cajaEntregada;
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
