using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Application.Ventas.DTOs;
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
    [Route("api/ventas")]
    [Authorize]
    public class VentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VentasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<VentaResponseDto>> ObtenerPorId(Guid id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Productos)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta is null)
            {
                return NotFound();
            }

            return Ok(await ArmarResponseDto(venta));
        }

        [HttpGet("reparto/{repartoId:guid}")]
        public async Task<ActionResult> ObtenerPorReparto(Guid repartoId)
        {
            var ventas = await _context.Ventas
                .Include(v => v.Productos)
                .Where(v => v.RepartoId == repartoId)
                .OrderBy(v => v.FechaVenta)
                .ToListAsync();

            var result = new List<VentaResponseDto>();

            foreach (var venta in ventas)
            {
                result.Add(await ArmarResponseDto(venta));
            }

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente,Repartidor")]
        public async Task<ActionResult<VentaResponseDto>> Crear(
            [FromBody] CrearVentaDto dto,
            [FromServices] ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
            {
                return BadRequest("No se pudo determinar el tenant actual.");
            }
                

            var reparto = await _context.Repartos
                .Include(r => r.StockInicial)
                .Include(r => r.EnvasesRetirados)
                .FirstOrDefaultAsync(r => r.Id == dto.RepartoId);

            if (reparto is null)
            {
                return NotFound("El reparto indicado no existe.");
            }
                
            if (reparto.Estado != EstadoReparto.EnCurso)
            {
                return BadRequest("Solo se pueden registrar ventas en un reparto que esté en curso.");
            }
                
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == dto.ClienteId && c.Estado == distribuidora_saas_Domain.Enums.EstadoCliente.Activo);
            
            if (!clienteExiste)
            {
                return BadRequest("El cliente indicado no existe o está inactivo.");
            }
                
            var venta = new Venta(currentTenant.TenantId.Value, dto.RepartoId, dto.ClienteId, dto.DineroRecibido, dto.Observaciones);

            try
            {
                foreach (var productoDto in dto.Productos)
                {
                    var productoExiste = await _context.Productos.AnyAsync(p => p.Id == productoDto.ProductoId);
                    if (!productoExiste)
                    {
                        return BadRequest($"El producto {productoDto.ProductoId} no existe.");
                    }

                    venta.AgregarProducto(productoDto.ProductoId, productoDto.TipoMovimiento, productoDto.Cantidad);

                    if (productoDto.TipoMovimiento == TipoMovimientoProducto.Entregado)
                    {
                        reparto.DescontarStock(productoDto.ProductoId, productoDto.Cantidad);
                    }
                    else
                    {
                        reparto.RegistrarEnvaseRetirado(productoDto.ProductoId, productoDto.Cantidad);
                    }
                }
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPorId), new { id = venta.Id }, await ArmarResponseDto(venta));
        }

        private async Task<VentaResponseDto> ArmarResponseDto(Venta venta)
        {
            var cliente = await _context.Clientes.FindAsync(venta.ClienteId);

            var productoIds = venta.Productos.Select(p => p.ProductoId).ToList();
            var nombresProductos = await _context.Productos
                .Where(p => productoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Nombre);

            var productosDto = venta.Productos
                .Select(p => new VentaProductoResponseDto(
                    p.ProductoId,
                    nombresProductos.GetValueOrDefault(p.ProductoId, "Producto no encontrado"),
                    p.TipoMovimiento.ToString(),
                    p.Cantidad))
                .ToList();

            return new VentaResponseDto(
                venta.Id, venta.RepartoId, venta.ClienteId,
                cliente?.Nombre ?? "Cliente no encontrado",
                venta.DineroRecibido, venta.Observaciones, venta.FechaVenta,
                productosDto);
        }
    }
}
