using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Application.Usuarios.DTOs;
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
    [Route("api/usuarios")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UsuariosController(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ObtenerTodos(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Usuarios.AsQueryable();

            var total = await query.CountAsync();

            var usuarios = await query
                .OrderBy(u => u.NombreCompleto)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UsuarioResponseDto(
                    u.Id, u.Email, u.NombreCompleto, u.Rol.ToString(), u.Estado.ToString(), u.FechaCreacion))
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = usuarios });
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioResponseDto>> Crear(
            [FromBody] CrearUsuarioDto dto,
            [FromServices] ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
            {
                return BadRequest("No se pudo determinar el tenant actual.");
            }

            if (dto.Rol == RolUsuario.Administrador)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No está permitido crear usuarios con rol Administrador desde este endpoint.");
            }

            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

            var emailExistente = await _context.Usuarios
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == emailNormalizado);

            if (emailExistente)
            {
                return Conflict("Ya existe un usuario registrado con ese email.");
            }

            var passwordHash = _passwordHasher.HashPassword(dto.Password);

            var usuario = new Usuario(currentTenant.TenantId.Value, dto.Email, passwordHash, dto.NombreCompleto, dto.Rol);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerTodos), new UsuarioResponseDto(
                usuario.Id, usuario.Email, usuario.NombreCompleto,
                usuario.Rol.ToString(), usuario.Estado.ToString(), usuario.FechaCreacion));
        }

        [HttpPatch("{id:guid}/desactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Desactivar(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            usuario.Desactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/reactivar")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Reactivar(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null)
            {
                return NotFound();
            }

            usuario.Reactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
