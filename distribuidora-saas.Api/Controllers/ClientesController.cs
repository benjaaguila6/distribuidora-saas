using distribuidora_saas.Application.Clientes.DTOs;
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
    [Route("api/clientes")]
    [Authorize]
    public class ClientesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> ObtenerTodos(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? busqueda = null)
        {
            var query = _context.Clientes.AsQueryable();

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                query = query.Where(c => c.Nombre.Contains(busqueda));
            }

            var total = await query.CountAsync();

            var clientes = await query
                .OrderBy(c => c.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ClienteResponseDto(
                    c.Id, c.Nombre, c.Direccion, c.Telefono, c.Latitud, c.Longitud,
                    c.Observaciones, c.SaldoDeudaActual, c.SaldoEnvasesActual,
                    c.Estado.ToString(), c.FechaCreacion))
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = clientes });
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ClienteResponseDto>> ObtenerPorId(Guid id)
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente is null) return NotFound();

            return Ok(new ClienteResponseDto(
                cliente.Id, cliente.Nombre, cliente.Direccion, cliente.Telefono,
                cliente.Latitud, cliente.Longitud, cliente.Observaciones,
                cliente.SaldoDeudaActual, cliente.SaldoEnvasesActual,
                cliente.Estado.ToString(), cliente.FechaCreacion));
        }

        [HttpGet("{id:guid}/ventas")]
        public async Task<ActionResult<List<HistorialVentaClienteDto>>> ObtenerHistorialVentas(Guid id)
        {
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == id);
            if (!clienteExiste) return NotFound();

            var ventas = await _context.Ventas
                .Include(v => v.Productos)
                .Include(v => v.Pagos)
                .Where(v => v.ClienteId == id)
                .OrderByDescending(v => v.FechaVenta)
                .ToListAsync();

            var productoIds = ventas
                .SelectMany(v => v.Productos.Select(p => p.ProductoId))
                .Distinct()
                .ToList();

            var productosPorId = await _context.Productos
                .Where(p => productoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);
            var movimientosEnvases = await _context.MovimientosEnvases
                .Where(m => m.ClienteId == id)
                .ToListAsync();

            var envasesPorVenta = movimientosEnvases
                .GroupBy(m => m.VentaId)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        Prestados = g
                            .Where(m => m.TipoMovimiento == TipoMovimientoEnvase.Prestado)
                            .Sum(m => m.Cantidad),
                        Devueltos = g
                            .Where(m => m.TipoMovimiento == TipoMovimientoEnvase.Devuelto)
                            .Sum(m => m.Cantidad),
                    });

            var resultado = new List<HistorialVentaClienteDto>();

            foreach (var venta in ventas)
            {
                decimal obtenerPrecio(Guid pid) => productosPorId[pid].Precio;

                var productosDto = venta.Productos
                    .Select(p => new VentaProductoResponseDto(
                        p.ProductoId,
                        productosPorId.GetValueOrDefault(p.ProductoId)?.Nombre ?? "Producto no encontrado",
                        p.TipoMovimiento.ToString(),
                        p.Cantidad))
                    .ToList();

                var pagosDto = venta.Pagos
                    .Select(p => new VentaPagoResponseDto(
                        p.FormaPago.ToString(),
                        p.Monto,
                        p.ImporteEntregadoPorCliente,
                        p.Vuelto))
                    .ToList();

                var envases = envasesPorVenta.GetValueOrDefault(venta.Id);

                resultado.Add(new HistorialVentaClienteDto(
                    venta.Id,
                    venta.RepartoId,
                    venta.FechaVenta,
                    venta.DineroRecibido,
                    venta.CalcularValorTotalEntregado(obtenerPrecio),
                    venta.CalcularDeudaGenerada(obtenerPrecio),
                    envases?.Prestados ?? 0,
                    envases?.Devueltos ?? 0,
                    productosDto,
                    pagosDto));
            }

            return Ok(resultado);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<ClienteResponseDto>> Crear(
            [FromBody] CrearClienteDto dto,
            [FromServices] Application.Common.Interfaces.ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
                return BadRequest("No se pudo determinar el tenant actual.");

            var cliente = new Cliente(currentTenant.TenantId.Value, dto.Nombre, dto.Direccion);
            cliente.ActualizarDatosContacto(dto.Telefono, dto.Latitud, dto.Longitud, dto.Observaciones);

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPorId), new { id = cliente.Id }, new ClienteResponseDto(
                cliente.Id, cliente.Nombre, cliente.Direccion, cliente.Telefono,
                cliente.Latitud, cliente.Longitud, cliente.Observaciones,
                cliente.SaldoDeudaActual, cliente.SaldoEnvasesActual,
                cliente.Estado.ToString(), cliente.FechaCreacion));
        }

        [HttpPut("{id:guid}/contacto")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ActualizarContacto(Guid id, [FromBody] ActualizarContactoClienteDto dto)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente is null) return NotFound();

            cliente.ActualizarDatosContacto(dto.Telefono, dto.Latitud, dto.Longitud, dto.Observaciones);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id:guid}/datos-basicos")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ActualizarDatosBasicos(Guid id, [FromBody] ActualizarDatosBasicosClienteDto dto)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente is null) return NotFound();

            cliente.ActualizarDatosBasicos(dto.Nombre, dto.Direccion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/desactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Desactivar(Guid id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente is null) return NotFound();

            cliente.Desactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Reactivar(Guid id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente is null) return NotFound();

            cliente.Reactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
