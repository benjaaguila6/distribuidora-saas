using distribuidora_saas.Application.Usuarios;

namespace distribuidora_saas.Tests.Application;

public class GeneradorPasswordTemporalTests
{
    [Fact]
    public void Generar_CumpleLaPoliticaVigente_Y_LaLongitudMinima()
    {
        var password = GeneradorPasswordTemporal.Generar();

        Assert.True(password.Length >= 12, "La contraseña temporal debe tener al menos 12 caracteres.");
        Assert.Matches("[A-Z]", password);
        Assert.Matches("[a-z]", password);
        Assert.Matches("[0-9]", password);
    }

    [Fact]
    public void Generar_DosLlamadasSeguidas_NoCoinciden()
    {
        Assert.NotEqual(GeneradorPasswordTemporal.Generar(), GeneradorPasswordTemporal.Generar());
    }

    [Theory]
    [InlineData(11)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Generar_ConLongitudMenorA12_LanzaArgumentOutOfRange(int longitud)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => GeneradorPasswordTemporal.Generar(longitud));
    }

    [Theory]
    [InlineData(12)]
    [InlineData(16)]
    [InlineData(24)]
    public void Generar_RespetaLaLongitudSolicitada(int longitud)
    {
        Assert.Equal(longitud, GeneradorPasswordTemporal.Generar(longitud).Length);
    }
}
