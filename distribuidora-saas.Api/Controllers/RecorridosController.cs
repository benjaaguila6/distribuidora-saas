using distribuidora_saas.Application.Recorridos.DTOs;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas_Domain.Entitites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace distribuidora_saas.Api.Controllers
{
    [ApiController]
    [Route("api/recorridos")]
    [Authorize]
    public class RecorridosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RecorridosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTodos([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Recorridos.AsQueryable();
            var total = await query.CountAsync();

            var recorridos = await query
                .OrderBy(r => r.DiaSemana)
                .ThenBy(r => r.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new { r.Id, r.Nombre, DiaSemana = r.DiaSemana.ToString(), r.Activo })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = recorridos });
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RecorridoResponseDto>> ObtenerPorId(Guid id)
        {
            var recorrido = await _context.Recorridos
                .Include(r => r.Clientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recorrido is null) return NotFound();

            return Ok(await ArmarResponseDto(recorrido));
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<RecorridoResponseDto>> Crear(
            [FromBody] CrearRecorridoDto dto,
            [FromServices] Application.Common.Interfaces.ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
                return BadRequest("No se pudo determinar el tenant actual.");

            var recorrido = new Recorrido(currentTenant.TenantId.Value, dto.Nombre, dto.DiaSemana);

            _context.Recorridos.Add(recorrido);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPorId), new { id = recorrido.Id }, await ArmarResponseDto(recorrido));
        }

        [HttpPost("{id:guid}/clientes")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> AgregarCliente(Guid id, [FromBody] AgregarClienteRecorridoDto dto)
        {
            var recorrido = await _context.Recorridos
                .Include(r => r.Clientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recorrido is null) return NotFound();

            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == dto.ClienteId);
            if (!clienteExiste) return NotFound("El cliente indicado no existe.");

            try
            {
                recorrido.AgregarCliente(dto.ClienteId);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}/clientes/{clienteId:guid}")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> QuitarCliente(Guid id, Guid clienteId)
        {
            var recorrido = await _context.Recorridos
                .Include(r => r.Clientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recorrido is null) return NotFound();

            try
            {
                recorrido.QuitarCliente(clienteId);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:guid}/clientes/orden")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ReordenarClientes(Guid id, [FromBody] ReordenarClientesRecorridoDto dto)
        {
            var recorrido = await _context.Recorridos
                .Include(r => r.Clientes)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recorrido is null) return NotFound();

            try
            {
                recorrido.ReordenarClientes(dto.ClienteIdsEnOrden);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/desactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Desactivar(Guid id)
        {
            var recorrido = await _context.Recorridos.FindAsync(id);
            if (recorrido is null) return NotFound();

            recorrido.Desactivar();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Reactivar(Guid id)
        {
            var recorrido = await _context.Recorridos.FindAsync(id);
            if (recorrido is null) return NotFound();

            recorrido.Reactivar();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<RecorridoResponseDto> ArmarResponseDto(Recorrido recorrido)
        {
            var clienteIds = recorrido.Clientes.Select(rc => rc.ClienteId).ToList();

            var nombresClientes = await _context.Clientes
                .Where(c => clienteIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Nombre);

            var clientesDto = recorrido.Clientes
                .OrderBy(rc => rc.Orden)
                .Select(rc => new RecorridoClienteResponseDto(
                    rc.ClienteId,
                    nombresClientes.GetValueOrDefault(rc.ClienteId, "Cliente no encontrado"),
                    rc.Orden))
                .ToList();

            return new RecorridoResponseDto(
                recorrido.Id, recorrido.Nombre, recorrido.DiaSemana.ToString(),
                recorrido.Activo, recorrido.FechaCreacion, clientesDto);
        }
    }
}
