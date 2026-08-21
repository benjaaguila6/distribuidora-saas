using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.DTOs
{
    public record CierreRepartoResponseDto(
        Guid RepartoId,
        string Estado,
        DateTime FechaReparto,
        DateTime? FechaFinalizacion,
        List<StockCierreDto> StockPorProducto,
        List<EnvaseCierreDto> EnvasesPorProducto,
        decimal CajaEsperada,
        decimal? CajaEntregada,
        decimal? DiferenciaCaja,
        decimal DineroFiadoGenerado,
        decimal TotalTransferencias,
        decimal TotalEfectivo,
        decimal TotalQr,
        List<GastoResponseDto> Gastos,
        decimal TotalGastos
    );
}