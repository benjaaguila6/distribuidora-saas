using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Application.Repartos.DTOs;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas_Domain.Entitites;
using distribuidora_saas_Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace distribuidora_saas.Api.Controllers
{
    
    [ApiController]
    [Route("api/repartos")]
    [Authorize]
    public class RepartosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public RepartosController(ApplicationDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTodos([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Repartos.AsQueryable();

            if (User.IsInRole("Repartidor") && _currentUser.UsuarioId is Guid repartidorId)
                query = query.Where(r => r.RepartidorId == repartidorId);

            var total = await query.CountAsync();

            var repartos = await query
                .OrderByDescending(r => r.FechaReparto)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new { r.Id, r.RecorridoId, r.RepartidorId, Estado = r.Estado.ToString(), r.FechaReparto })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = repartos });
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RepartoResponseDto>> ObtenerPorId(Guid id)
        {
            var reparto = await _context.Repartos
                .Include(r => r.StockInicial)
                .Include(r => r.EnvasesRetirados)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            if (User.IsInRole("Repartidor") && reparto.RepartidorId != _currentUser.UsuarioId)
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene acceso a este reparto.");

            return Ok(await ArmarResponseDto(reparto));
        }

        [HttpGet("{id:guid}/cierre")]
        public async Task<ActionResult<CierreRepartoResponseDto>> ObtenerCierre(Guid id)
        {
            var reparto = await _context.Repartos
                .Include(r => r.StockInicial)
                .Include(r => r.EnvasesRetirados)
                .Include(r => r.Gastos)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            if (User.IsInRole("Repartidor") && reparto.RepartidorId != _currentUser.UsuarioId)
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene acceso a este reparto.");

            var ventas = await _context.Ventas
                .Include(v => v.Productos)
                .Include(v => v.Pagos)
                .Where(v => v.RepartoId == id)
                .ToListAsync();

            var productoIds = reparto.StockInicial.Select(s => s.ProductoId)
                .Concat(reparto.EnvasesRetirados.Select(e => e.ProductoId))
                .Concat(ventas.SelectMany(v => v.Productos.Select(p => p.ProductoId)))
                .Distinct()
                .ToList();

            var productos = await _context.Productos
                .Where(p => productoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p);

            var stockPorProducto = reparto.StockInicial
                .Select(s => new StockCierreDto(
                    s.ProductoId,
                    productos.GetValueOrDefault(s.ProductoId)?.Nombre ?? "Producto no encontrado",
                    s.CantidadInicial,
                    s.CantidadInicial - s.CantidadRestante,
                    s.CantidadRestante))
                .ToList();

            var esperadosPorProducto = ventas
                .SelectMany(v => v.Productos)
                .Where(p => p.TipoMovimiento == TipoMovimientoProducto.Entregado)
                .Where(p => productos.TryGetValue(p.ProductoId, out var prod) && prod.TipoEnvase == TipoEnvase.Retornable)
                .GroupBy(p => p.ProductoId)
                .ToDictionary(g => g.Key, g => g.Sum(p => p.Cantidad));

            var recibidosPorProducto = reparto.EnvasesRetirados
                .GroupBy(e => e.ProductoId)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.CantidadRetirada));

            var envasesPorProducto = esperadosPorProducto.Keys
                .Concat(recibidosPorProducto.Keys)
                .Distinct()
                .Select(pid =>
                {
                    var cantidadEsperada = esperadosPorProducto.GetValueOrDefault(pid, 0);
                    var cantidadRecibida = recibidosPorProducto.GetValueOrDefault(pid, 0);
                    return new EnvaseCierreDto(
                        pid,
                        productos.GetValueOrDefault(pid)?.Nombre ?? "Producto no encontrado",
                        cantidadEsperada,
                        cantidadRecibida,
                        cantidadEsperada - cantidadRecibida);
                })
                .ToList();

            var cajaEsperada = ventas.Sum(v => v.DineroRecibido);

            var dineroFiadoGenerado = ventas.Sum(v =>
            {
                var excedente = v.CalcularExcedenteOFaltante(pid => productos[pid].Precio);
                return excedente < 0 ? Math.Abs(excedente) : 0m;
            });

            var totalTransferencias = ventas
                .SelectMany(v => v.Pagos)
                .Where(p => p.FormaPago == FormaPago.Transferencia)
                .Sum(p => p.Monto);

            var totalEfectivo = ventas
                .SelectMany(v => v.Pagos)
                .Where(p => p.FormaPago == FormaPago.Efectivo)
                .Sum(p => p.Monto);

            var totalQr = ventas
                .SelectMany(v => v.Pagos)
                .Where(p => p.FormaPago == FormaPago.Qr)
                .Sum(p => p.Monto);

            var gastos = reparto.Gastos
                .Select(g => new GastoResponseDto(g.Concepto.ToString(), g.Monto, g.Descripcion))
                .ToList();

            var totalGastos = reparto.Gastos.Sum(g => g.Monto);

            decimal? cajaEntregada = reparto.CajaEntregada;
            decimal? diferenciaCaja = cajaEntregada.HasValue ? Math.Round(cajaEsperada - cajaEntregada.Value, 2) : null;

            return Ok(new CierreRepartoResponseDto(
                reparto.Id,
                reparto.Estado.ToString(),
                reparto.FechaReparto,
                reparto.FechaFinalizacion,
                stockPorProducto,
                envasesPorProducto,
                cajaEsperada,
                cajaEntregada,
                diferenciaCaja,
                dineroFiadoGenerado,
                totalTransferencias,
                totalEfectivo,
                totalQr,
                gastos,
                totalGastos
            ));
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<RepartoResponseDto>> Crear(
            [FromBody] CrearRepartoDto dto,
            [FromServices] ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
                return BadRequest("No se pudo determinar el tenant actual.");

            var recorrido = await _context.Recorridos.FindAsync(dto.RecorridoId);
            if (recorrido is null || !recorrido.Activo)
                return BadRequest("El recorrido indicado no existe o está inactivo.");

            var repartidor = await _context.Usuarios.FindAsync(dto.RepartidorId);
            if (repartidor is null || repartidor.Estado == EstadoUsuario.Inactivo)
                return BadRequest("El repartidor indicado no existe o está inactivo.");

            if (repartidor.Rol != RolUsuario.Repartidor)
                return BadRequest("El usuario seleccionado no tiene el rol de Repartidor.");

            var repartidorYaOcupado = await _context.Repartos
                .AnyAsync(r => r.RepartidorId == dto.RepartidorId && r.Estado == EstadoReparto.EnCurso);

            if (repartidorYaOcupado)
                return Conflict("Este repartidor ya tiene un reparto en curso.");

            var reparto = new Reparto(currentTenant.TenantId.Value, dto.RecorridoId, dto.RepartidorId, dto.FechaReparto);

            _context.Repartos.Add(reparto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPorId), new { id = reparto.Id }, await ArmarResponseDto(reparto));
        }

        [HttpPost("{id:guid}/stock-inicial")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> AgregarStockInicial(Guid id, [FromBody] AgregarStockInicialDto dto)
        {
            var reparto = await _context.Repartos
                .Include(r => r.StockInicial)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            var productoExiste = await _context.Productos.AnyAsync(p => p.Id == dto.ProductoId && p.Activo);
            if (!productoExiste) return NotFound("El producto indicado no existe o está inactivo.");

            try
            {
                reparto.AgregarStockInicial(dto.ProductoId, dto.Cantidad);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/iniciar")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Iniciar(Guid id)
        {
            var reparto = await _context.Repartos
                .Include(r => r.StockInicial)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            try
            {
                reparto.IniciarReparto();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/finalizar")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Finalizar(Guid id, [FromBody] FinalizarRepartoDto dto)
        {
            var reparto = await _context.Repartos
                .Include(r => r.Gastos)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            try
            {
                reparto.FinalizarReparto(dto.CajaEntregada, (dto.Gastos ?? Enumerable.Empty<GastoDto>()).Select(g => (g.Concepto, g.Monto, g.Descripcion)));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/cancelar")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Cancelar(Guid id)
        {
            var reparto = await _context.Repartos.FindAsync(id);
            if (reparto is null) return NotFound();

            try
            {
                reparto.CancelarReparto();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<RepartoResponseDto> ArmarResponseDto(Reparto reparto)
        {
            var recorrido = await _context.Recorridos.FindAsync(reparto.RecorridoId);
            var repartidor = await _context.Usuarios.FindAsync(reparto.RepartidorId);

            var productoIds = reparto.StockInicial.Select(s => s.ProductoId).ToList();
            var nombresProductos = await _context.Productos
                .Where(p => productoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Nombre);

            var stockDto = reparto.StockInicial
                .Select(s => new StockInicialResponseDto(
                    s.ProductoId,
                    nombresProductos.GetValueOrDefault(s.ProductoId, "Producto no encontrado"),
                    s.CantidadInicial,
                    s.CantidadRestante))
                .ToList();

            var productoIdsEnvases = reparto.EnvasesRetirados.Select(e => e.ProductoId).ToList();
            var nombresProductosEnvases = await _context.Productos
                .Where(p => productoIdsEnvases.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Nombre);

            var envasesDto = reparto.EnvasesRetirados
                .Select(e => new EnvaseRetiradoResponseDto(
                    e.ProductoId,
                    nombresProductosEnvases.GetValueOrDefault(e.ProductoId, "Producto no encontrado"),
                    e.CantidadRetirada))
                .ToList();

            return new RepartoResponseDto(
                reparto.Id,
                reparto.RecorridoId,
                recorrido?.Nombre ?? "Recorrido no encontrado",
                reparto.RepartidorId,
                repartidor?.NombreCompleto ?? "Repartidor no encontrado",
                reparto.Estado.ToString(),
                reparto.FechaReparto,
                reparto.FechaInicio,
                reparto.FechaFinalizacion,
                stockDto,
                envasesDto
            );
        }
    }
}
