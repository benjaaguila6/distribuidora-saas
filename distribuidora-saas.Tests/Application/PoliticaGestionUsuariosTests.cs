using distribuidora_saas.Application.Usuarios;
using distribuidora_saas_Domain.Enums;

namespace distribuidora_saas.Tests.Application;

public class PoliticaGestionUsuariosTests
{
    // ----- PuedeGestionar: matriz completa actor x objetivo -----

    [Theory]
    [InlineData(RolUsuario.Administrador, RolUsuario.Gerente, true)]
    [InlineData(RolUsuario.Administrador, RolUsuario.Repartidor, true)]
    [InlineData(RolUsuario.Administrador, RolUsuario.Administrador, false)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Repartidor, true)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Gerente, false)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Administrador, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Administrador, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Gerente, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Repartidor, false)]
    public void PuedeGestionar_RespetaLaMatriz(RolUsuario actor, RolUsuario objetivo, bool esperado)
    {
        Assert.Equal(esperado, PoliticaGestionUsuarios.PuedeGestionar(actor, objetivo));
    }

    // ----- PuedeCambiarRol: solo Administrador -----

    [Theory]
    [InlineData(RolUsuario.Administrador, true)]
    [InlineData(RolUsuario.Gerente, false)]
    [InlineData(RolUsuario.Repartidor, false)]
    public void PuedeCambiarRol_SoloAdministrador(RolUsuario actor, bool esperado)
    {
        Assert.Equal(esperado, PoliticaGestionUsuarios.PuedeCambiarRol(actor));
    }

    // ----- PuedeAsignarRol: matriz completa actor x rol nuevo -----

    [Theory]
    [InlineData(RolUsuario.Administrador, RolUsuario.Gerente, true)]
    [InlineData(RolUsuario.Administrador, RolUsuario.Repartidor, true)]
    [InlineData(RolUsuario.Administrador, RolUsuario.Administrador, false)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Repartidor, true)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Gerente, false)]
    [InlineData(RolUsuario.Gerente, RolUsuario.Administrador, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Gerente, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Repartidor, false)]
    [InlineData(RolUsuario.Repartidor, RolUsuario.Administrador, false)]
    public void PuedeAsignarRol_NuncaAdministradorYRespetaLaMatriz(RolUsuario actor, RolUsuario nuevoRol, bool esperado)
    {
        Assert.Equal(esperado, PoliticaGestionUsuarios.PuedeAsignarRol(actor, nuevoRol));
    }

    // ----- RolesAsignables -----

    [Fact]
    public void RolesAsignables_Administrador_IncluyeGerenteYRepartidor()
    {
        var roles = PoliticaGestionUsuarios.RolesAsignables(RolUsuario.Administrador);

        Assert.Equal(new[] { RolUsuario.Gerente, RolUsuario.Repartidor }, roles);
    }

    [Fact]
    public void RolesAsignables_Gerente_SoloRepartidor()
    {
        var roles = PoliticaGestionUsuarios.RolesAsignables(RolUsuario.Gerente);

        Assert.Equal(new[] { RolUsuario.Repartidor }, roles);
    }

    [Fact]
    public void RolesAsignables_Repartidor_Vacio()
    {
        var roles = PoliticaGestionUsuarios.RolesAsignables(RolUsuario.Repartidor);

        Assert.Empty(roles);
    }
}
