using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Application.Usuarios;
using distribuidora_saas.Application.Usuarios.DTOs;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas_Domain.Entitites;
using distribuidora_saas_Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace distribuidora_saas.Api.Controllers
{
    
    [ApiController]
    [Route("api/usuarios")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        // Códigos de SQL Server para violación de índice único / clave primaria.
        private const int SqlErrorDuplicadoIndiceUnico = 2601;
        private const int SqlErrorDuplicadoClavePrimaria = 2627;

        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ICurrentUserService _currentUser;

        public UsuariosController(
            ApplicationDbContext context,
            IPasswordHasher passwordHasher,
            ICurrentUserService currentUser)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _currentUser = currentUser;
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
                    u.Id, u.Email, u.NombreCompleto, u.Rol.ToString(), u.Estado.ToString(), u.FechaCreacion, u.DebeCambiarPassword, u.Telefono))
                .ToListAsync();

            return Ok(new { total, page, pageSize, items = usuarios });
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<UsuarioResponseDto>> ObtenerPorId(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            return Ok(new UsuarioResponseDto(
                usuario.Id, usuario.Email, usuario.NombreCompleto,
                usuario.Rol.ToString(), usuario.Estado.ToString(),
                usuario.FechaCreacion, usuario.DebeCambiarPassword, usuario.Telefono));
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult<UsuarioResponseDto>> Crear(
            [FromBody] CrearUsuarioDto dto,
            [FromServices] ICurrentTenantService currentTenant)
        {
            if (currentTenant.TenantId is null)
            {
                return BadRequest("No se pudo determinar el tenant actual.");
            }

            var actor = _currentUser.Rol;

            // La matriz fina se valida acá y no sólo en el atributo:
            // nunca se puede asignar Administrador (ni roles fuera de la matriz).
            if (actor is null || !PoliticaGestionUsuarios.PuedeAsignarRol(actor.Value, dto.Rol))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No está permitido asignar ese rol.");
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

            var usuario = new Usuario(currentTenant.TenantId.Value, dto.Email, passwordHash, dto.NombreCompleto, dto.Rol, dto.Telefono);

            _context.Usuarios.Add(usuario);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (EsViolacionDeUnicidad(ex))
            {
                return Conflict("Ya existe un usuario registrado con ese email.");
            }

            return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.Id }, new UsuarioResponseDto(
                usuario.Id, usuario.Email, usuario.NombreCompleto,
                usuario.Rol.ToString(), usuario.Estado.ToString(),
                usuario.FechaCreacion, usuario.DebeCambiarPassword, usuario.Telefono));
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Actualizar(Guid id, [FromBody] ActualizarUsuarioDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            var actor = _currentUser.Rol;
            if (actor is null) return Forbid();

            // Nadie puede modificar a un Administrador por este módulo.
            if (usuario.Rol == RolUsuario.Administrador)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No se puede modificar a un Administrador desde este módulo.");
            }

            if (!PoliticaGestionUsuarios.PuedeGestionar(actor.Value, usuario.Rol))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para gestionar este usuario.");
            }

            // El cambio de rol es exclusivo del Administrador y debe respetar los roles asignables.
            if (dto.Rol != usuario.Rol)
            {
                if (!PoliticaGestionUsuarios.PuedeCambiarRol(actor.Value))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "Sólo un Administrador puede cambiar el rol.");
                }

                if (!PoliticaGestionUsuarios.PuedeAsignarRol(actor.Value, dto.Rol))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "No está permitido asignar ese rol.");
                }

                // Un repartidor con un reparto en curso no puede cambiar de rol.
                if (usuario.Rol == RolUsuario.Repartidor && await TieneRepartoEnCurso(id))
                {
                    return Conflict("No se puede cambiar de rol a un repartidor que tiene un reparto en curso.");
                }
            }

            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

            // Unicidad GLOBAL de email, excluyendo el propio usuario.
            var emailEnUso = await _context.Usuarios
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == emailNormalizado && u.Id != id);

            if (emailEnUso)
            {
                return Conflict("Ya existe un usuario registrado con ese email.");
            }

            usuario.ActualizarEmail(dto.Email);
            usuario.ActualizarDatosBasicos(dto.NombreCompleto, dto.Telefono);

            if (dto.Rol != usuario.Rol)
            {
                usuario.CambiarRol(dto.Rol);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (EsViolacionDeUnicidad(ex))
            {
                return Conflict("Ya existe un usuario registrado con ese email.");
            }

            return NoContent();
        }

        [HttpPost("{id:guid}/reset-password")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> ResetearPassword(Guid id, [FromBody] ResetearPasswordDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            var actor = _currentUser.Rol;
            if (actor is null) return Forbid();

            if (usuario.Rol == RolUsuario.Administrador)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No se puede modificar a un Administrador desde este módulo.");
            }

            if (!PoliticaGestionUsuarios.PuedeGestionar(actor.Value, usuario.Rol))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para gestionar este usuario.");
            }

            var passwordHash = _passwordHasher.HashPassword(dto.PasswordNueva);
            usuario.ResetearPassword(passwordHash);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/desactivar")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Desactivar(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            // Nadie puede desactivarse a sí mismo.
            if (_currentUser.UsuarioId == id)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No puede desactivar su propio usuario.");
            }

            var actor = _currentUser.Rol;
            if (actor is null) return Forbid();

            if (usuario.Rol == RolUsuario.Administrador)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No se puede modificar a un Administrador desde este módulo.");
            }

            if (!PoliticaGestionUsuarios.PuedeGestionar(actor.Value, usuario.Rol))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para gestionar este usuario.");
            }

            // Un repartidor con un reparto en curso no puede desactivarse:
            // dejaría un reparto huérfano sin responsable operativo.
            if (usuario.Rol == RolUsuario.Repartidor && await TieneRepartoEnCurso(id))
            {
                return Conflict("No se puede desactivar a un repartidor que tiene un reparto en curso.");
            }

            usuario.Desactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/reactivar")]
        [Authorize(Roles = "Administrador,Gerente")]
        public async Task<ActionResult> Reactivar(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null)
            {
                return NotFound();
            }

            var actor = _currentUser.Rol;
            if (actor is null) return Forbid();

            if (usuario.Rol == RolUsuario.Administrador)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No se puede modificar a un Administrador desde este módulo.");
            }

            if (!PoliticaGestionUsuarios.PuedeGestionar(actor.Value, usuario.Rol))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "No tiene permisos para gestionar este usuario.");
            }

            usuario.Reactivar();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<bool> TieneRepartoEnCurso(Guid repartidorId) =>
            _context.Repartos.AnyAsync(r => r.RepartidorId == repartidorId && r.Estado == EstadoReparto.EnCurso);

        private static bool EsViolacionDeUnicidad(DbUpdateException ex) =>
            ex.InnerException is SqlException sql &&
            (sql.Number == SqlErrorDuplicadoIndiceUnico || sql.Number == SqlErrorDuplicadoClavePrimaria);
    }
}
