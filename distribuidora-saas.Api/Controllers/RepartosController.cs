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

        public RepartosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTodos([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Repartos.AsQueryable();
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
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reparto is null) return NotFound();

            return Ok(await ArmarResponseDto(reparto));
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
        public async Task<ActionResult> Finalizar(Guid id)
        {
            var reparto = await _context.Repartos.FindAsync(id);
            if (reparto is null) return NotFound();

            try
            {
                reparto.FinalizarReparto();
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
                    s.CantidadInicial))
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
                stockDto);
        }
    }
}
