using System.Security.Cryptography;

namespace distribuidora_saas.Application.Usuarios
{
    /// <summary>
    /// Genera contraseñas temporales criptográficamente seguras para el alta de
    /// empleados. Garantiza el cumplimiento de la política vigente (mínimo 12
    /// caracteres, al menos una mayúscula, una minúscula y un dígito) sin depender
    /// de infraestructura, de modo que pueda testearse de forma aislada.
    /// </summary>
    public static class GeneradorPasswordTemporal
    {
        public const int LongitudPredeterminada = 12;

        // Alfabetos sin caracteres ambiguos (0/O, 1/l/I) para facilitar el tipeo.
        private const string Mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        private const string Minusculas = "abcdefghijkmnpqrstuvwxyz";
        private const string Digitos = "23456789";
        private const string Simbolos = "!@#$%*?";
        private const string Todos = Mayusculas + Minusculas + Digitos + Simbolos;

        /// <summary>Genera una contraseña temporal que cumple la política vigente.</summary>
        public static string Generar(int longitud = LongitudPredeterminada)
        {
            if (longitud < LongitudPredeterminada)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(longitud),
                    $"La contraseña temporal debe tener al menos {LongitudPredeterminada} caracteres.");
            }

            var caracteres = new char[longitud];

            // Posiciones obligatorias: garantizan mayúscula, minúscula y dígito.
            caracteres[0] = Mayusculas[RandomNumberGenerator.GetInt32(Mayusculas.Length)];
            caracteres[1] = Minusculas[RandomNumberGenerator.GetInt32(Minusculas.Length)];
            caracteres[2] = Digitos[RandomNumberGenerator.GetInt32(Digitos.Length)];

            for (var i = 3; i < longitud; i++)
            {
                caracteres[i] = Todos[RandomNumberGenerator.GetInt32(Todos.Length)];
            }

            // Fisher-Yates con fuente criptográfica: las posiciones obligatorias
            // no quedan en un orden predecible.
            for (var i = caracteres.Length - 1; i > 0; i--)
            {
                var j = RandomNumberGenerator.GetInt32(i + 1);
                (caracteres[i], caracteres[j]) = (caracteres[j], caracteres[i]);
            }

            return new string(caracteres);
        }
    }
}
