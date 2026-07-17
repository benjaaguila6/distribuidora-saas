using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Application.Productos.DTOs;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas_Domain.Entitites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace distribuidora_saas.Api.Controllers
{
    
    [ApiController]
    [Route("api/productos")]
    [Authorize]
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTodos(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? busqueda = null)
        {
            var query = _context.Productos.AsQueryable();

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                query = query.Where(p => p.Nombre.Contains(busqueda));
            }

            var total = await query.CountAsync();

            var productos = await query
                .OrderBy(p => p.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductoResponseDto(
                    p.Id, p.Nombre, p.Precio, p.Costo,
                    p.TipoEnvase.ToString(), p.Activo, p.FechaCreacion))
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = productos });
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ProductoResponseDto>> ObtenerPorId(Guid id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto is null) return NotFound();

            return Ok(new ProductoResponseDto(
                producto.Id, producto.Nombre, producto.Precio, producto.Costo,
                producto.TipoEnvase.ToString(), producto.Activo, producto.FechaCreacion));
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<ProductoResponseDto>> Crear(
            [FromBody] CrearProductoDto dto,
            [FromServices] ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
                return BadRequest("No se pudo determinar el tenant actual.");

            var producto = new Producto(currentTenant.TenantId.Value, dto.Nombre, dto.Precio, dto.Costo, dto.TipoEnvase);

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPorId), new { id = producto.Id }, new ProductoResponseDto(
                producto.Id, producto.Nombre, producto.Precio, producto.Costo,
                producto.TipoEnvase.ToString(), producto.Activo, producto.FechaCreacion));
        }

        [HttpPut("{id:guid}/nombre")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ActualizarNombre(Guid id, [FromBody] ActualizarNombreProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound();

            producto.ActualizarNombre(dto.Nombre);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id:guid}/precios")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ActualizarPrecios(Guid id, [FromBody] ActualizarPreciosProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound();

            producto.ActualizarPrecios(dto.Precio, dto.Costo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/desactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Desactivar(Guid id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound();

            producto.Desactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Reactivar(Guid id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound();

            producto.Reactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
