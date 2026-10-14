using distribuidora_saas.Application.Auth.DTOs;
using distribuidora_saas.Api.Filters;
using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace distribuidora_saas.Api.Controllers
{
    
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly ICurrentUserService _currentUser;

        public AuthController(
            ApplicationDbContext context,
            IJwtService jwtService,
            IPasswordHasher passwordHasher,
            IConfiguration configuration,
            ICurrentUserService currentUser)
        {
            _context = context;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _currentUser = currentUser;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

            // esta consulta busca SIN filtro de tenant, a propósito en este punto todavía no sabemos a qué tenant pertenece el usuario.
            var usuario = await _context.Usuarios
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email == emailNormalizado);

            if (usuario is null)
            {
                return Unauthorized("Email o contraseña incorrectos.");
            }
                

            if (usuario.Estado == distribuidora_saas_Domain.Enums.EstadoUsuario.Inactivo)
            {
                return Unauthorized("El usuario está inactivo.");
            }
                

            var passwordValido = _passwordHasher.VerificarPassword(usuario.PasswordHash, dto.Password);

            if (!passwordValido)
            {
                return Unauthorized("Email o contraseña incorrectos.");
            }
                
            var accessToken = _jwtService.GenerarAccessToken(usuario);
            var refreshToken = _jwtService.GenerarRefreshToken();
            var refreshTokenExpiracionDias = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);

            usuario.EstablecerRefreshToken(refreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiracionDias));
            await _context.SaveChangesAsync();

            var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!);

            return Ok(new LoginResponseDto(
                accessToken,
                refreshToken,
                DateTime.UtcNow.AddMinutes(expirationMinutes),
                usuario.Id,
                usuario.NombreCompleto,
                usuario.Rol.ToString(),
                usuario.DebeCambiarPassword
            ));
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            var usuario = await _context.Usuarios
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == dto.UsuarioId);

            if (usuario is null || !usuario.TieneRefreshTokenValido(dto.RefreshToken))
            {
                return Unauthorized("Refresh token inválido o expirado.");
            }
                
            var nuevoAccessToken = _jwtService.GenerarAccessToken(usuario);
            var nuevoRefreshToken = _jwtService.GenerarRefreshToken();
            var refreshTokenExpiracionDias = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);

            usuario.EstablecerRefreshToken(nuevoRefreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiracionDias));
            await _context.SaveChangesAsync();

            var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!);

            return Ok(new LoginResponseDto(
                nuevoAccessToken,
                nuevoRefreshToken,
                DateTime.UtcNow.AddMinutes(expirationMinutes),
                usuario.Id,
                usuario.NombreCompleto,
                usuario.Rol.ToString(),
                usuario.DebeCambiarPassword
            ));
        }

        // Endpoint alcanzable incluso con la contraseña temporal pendiente:
        // el propio usuario define su contraseña definitiva y recibe tokens nuevos
        // ya sin el claim "debe_cambiar_password".
        [HttpPost("cambiar-password")]
        [Authorize]
        [PermitirPasswordTemporal]
        public async Task<ActionResult<LoginResponseDto>> CambiarPassword([FromBody] CambiarPasswordDto dto)
        {
            if (_currentUser.UsuarioId is null)
            {
                return Unauthorized();
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UsuarioId.Value);

            if (usuario is null)
            {
                return Unauthorized();
            }

            if (!_passwordHasher.VerificarPassword(usuario.PasswordHash, dto.PasswordActual))
            {
                return BadRequest("La contraseña actual es incorrecta.");
            }

            var nuevoPasswordHash = _passwordHasher.HashPassword(dto.PasswordNueva);
            usuario.EstablecerPasswordPropia(nuevoPasswordHash);

            var accessToken = _jwtService.GenerarAccessToken(usuario);
            var refreshToken = _jwtService.GenerarRefreshToken();
            var refreshTokenExpiracionDias = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);

            usuario.EstablecerRefreshToken(refreshToken, DateTime.UtcNow.AddDays(refreshTokenExpiracionDias));
            await _context.SaveChangesAsync();

            var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!);

            return Ok(new LoginResponseDto(
                accessToken,
                refreshToken,
                DateTime.UtcNow.AddMinutes(expirationMinutes),
                usuario.Id,
                usuario.NombreCompleto,
                usuario.Rol.ToString(),
                usuario.DebeCambiarPassword
            ));
        }
    }
}
