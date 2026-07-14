using distribuidora_saas.Application.Auth.DTOs;
using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
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

        public AuthController(
            ApplicationDbContext context,
            IJwtService jwtService,
            IPasswordHasher passwordHasher,
            IConfiguration configuration)
        {
            _context = context;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
        }

        [HttpPost("login")]
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
                usuario.NombreCompleto,
                usuario.Rol.ToString()
            ));
        }

        [HttpPost("refresh")]
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
                usuario.NombreCompleto,
                usuario.Rol.ToString()
            ));
        }
    }
}
