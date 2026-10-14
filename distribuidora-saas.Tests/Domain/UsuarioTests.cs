using distribuidora_saas_Domain.Entitites;
using distribuidora_saas_Domain.Enums;

namespace distribuidora_saas.Tests.Domain;

public class UsuarioTests
{
    private static readonly Guid TenantId = Guid.NewGuid();

    private static Usuario CrearUsuario(RolUsuario rol = RolUsuario.Repartidor) =>
        new(TenantId, "Juan.Perez@Example.com", "hash-inicial", "Juan Pérez", rol);

    [Fact]
    public void Constructor_NormalizaEmail_Y_DejaEstadoActivoConCambioDePasswordPendiente()
    {
        var usuario = CrearUsuario();

        Assert.Equal("juan.perez@example.com", usuario.Email);
        Assert.Equal(EstadoUsuario.Activo, usuario.Estado);
        // Toda alta usa una contraseña temporal: el cambio queda pendiente.
        Assert.True(usuario.DebeCambiarPassword);
        Assert.Null(usuario.Telefono);
        Assert.Equal(TenantId, usuario.TenantId);
    }

    [Fact]
    public void Constructor_ConTelefono_LoGuardaTrimmeado()
    {
        var usuario = new Usuario(TenantId, "a@b.com", "hash", "Ana", RolUsuario.Gerente, "  +54 11 5555-1234  ");

        Assert.Equal("+54 11 5555-1234", usuario.Telefono);
    }

    [Fact]
    public void Constructor_ConTelefonoVacio_LoNormalizaANull()
    {
        var usuario = new Usuario(TenantId, "a@b.com", "hash", "Ana", RolUsuario.Gerente, "   ");

        Assert.Null(usuario.Telefono);
    }

    [Fact]
    public void ActualizarDatosBasicos_ActualizaNombreYTelefono()
    {
        var usuario = CrearUsuario();

        usuario.ActualizarDatosBasicos("María Gómez", " 11 4444-9999 ");

        Assert.Equal("María Gómez", usuario.NombreCompleto);
        Assert.Equal("11 4444-9999", usuario.Telefono);
    }

    [Fact]
    public void ActualizarDatosBasicos_NombreVacio_LanzaArgumentException()
    {
        var usuario = CrearUsuario();

        Assert.Throws<ArgumentException>(() => usuario.ActualizarDatosBasicos("   ", "123"));
    }

    [Fact]
    public void ActualizarDatosBasicos_TelefonoDemasiadoLargo_LanzaArgumentException()
    {
        var usuario = CrearUsuario();

        Assert.Throws<ArgumentException>(() => usuario.ActualizarDatosBasicos("Ana", new string('9', 31)));
    }

    [Theory]
    [InlineData(RolUsuario.Gerente)]
    [InlineData(RolUsuario.Repartidor)]
    public void CambiarRol_ARolesGestionables_ActualizaElRol(RolUsuario nuevoRol)
    {
        var usuario = CrearUsuario(RolUsuario.Repartidor);

        usuario.CambiarRol(nuevoRol);

        Assert.Equal(nuevoRol, usuario.Rol);
    }

    [Fact]
    public void CambiarRol_AAdministrador_LanzaArgumentException()
    {
        var usuario = CrearUsuario(RolUsuario.Gerente);

        Assert.Throws<ArgumentException>(() => usuario.CambiarRol(RolUsuario.Administrador));
    }

    [Fact]
    public void ResetearPassword_MarcaPendienteYRevocaRefreshToken()
    {
        var usuario = CrearUsuario();
        usuario.EstablecerRefreshToken("refresh-viejo", DateTime.UtcNow.AddDays(1));

        usuario.ResetearPassword("hash-temporal");

        Assert.Equal("hash-temporal", usuario.PasswordHash);
        Assert.True(usuario.DebeCambiarPassword);
        Assert.Null(usuario.RefreshToken);
        Assert.Null(usuario.RefreshTokenExpiracion);
    }

    [Fact]
    public void EstablecerPasswordPropia_LimpiaLaPasswordPendiente()
    {
        var usuario = CrearUsuario();
        usuario.ResetearPassword("hash-temporal");

        usuario.EstablecerPasswordPropia("hash-definitivo");

        Assert.Equal("hash-definitivo", usuario.PasswordHash);
        Assert.False(usuario.DebeCambiarPassword);
    }

    [Fact]
    public void Desactivar_PasaInactivoYRevocaRefreshToken()
    {
        var usuario = CrearUsuario();
        usuario.EstablecerRefreshToken("refresh", DateTime.UtcNow.AddDays(1));

        usuario.Desactivar();

        Assert.Equal(EstadoUsuario.Inactivo, usuario.Estado);
        Assert.Null(usuario.RefreshToken);
        Assert.Null(usuario.RefreshTokenExpiracion);
    }

    [Fact]
    public void Reactivar_PasaActivo()
    {
        var usuario = CrearUsuario();
        usuario.Desactivar();

        usuario.Reactivar();

        Assert.Equal(EstadoUsuario.Activo, usuario.Estado);
    }

    [Fact]
    public void FlujoCompleto_TransicionesDeLaPasswordPendiente()
    {
        var usuario = CrearUsuario();
        Assert.True(usuario.DebeCambiarPassword);

        usuario.ResetearPassword("hash-temporal");
        Assert.True(usuario.DebeCambiarPassword);

        usuario.EstablecerPasswordPropia("hash-definitivo");
        Assert.False(usuario.DebeCambiarPassword);
    }

    [Fact]
    public void TieneRefreshTokenValido_DevuelveTrueSoloSiCoincideYNoExpiro()
    {
        var usuario = CrearUsuario();
        usuario.EstablecerRefreshToken("refresh", DateTime.UtcNow.AddDays(1));

        Assert.True(usuario.TieneRefreshTokenValido("refresh"));
        Assert.False(usuario.TieneRefreshTokenValido("otro"));

        usuario.EstablecerRefreshToken("expirado", DateTime.UtcNow.AddMinutes(-1));
        Assert.False(usuario.TieneRefreshTokenValido("expirado"));
    }
}
