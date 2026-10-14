using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace distribuidora_saas.Api.Filters
{
    /// <summary>
    /// Marca una acción como permitida incluso cuando el usuario tiene pendiente
    /// el cambio de contraseña (por ejemplo, el propio endpoint de cambio).
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class PermitirPasswordTemporalAttribute : Attribute
    {
    }

    /// <summary>
    /// Filtro global de enforcement: si el JWT incluye el claim
    /// "debe_cambiar_password", bloquea la petición con 403 salvo que la acción
    /// esté marcada con <see cref="PermitirPasswordTemporalAttribute"/>.
    /// </summary>
    public class DebeCambiarPasswordFilter : IAsyncActionFilter
    {
        public const string ClaimType = "debe_cambiar_password";

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var user = context.HttpContext.User;

            if (user?.Identity?.IsAuthenticated == true)
            {
                var claim = user.FindFirst(ClaimType);

                if (claim is not null && claim.Value == "true")
                {
                    var permitido = context.ActionDescriptor.EndpointMetadata
                        .OfType<PermitirPasswordTemporalAttribute>()
                        .Any();

                    if (!permitido)
                    {
                        context.Result = new ObjectResult(new
                        {
                            codigo = "PASSWORD_CAMBIO_REQUERIDO",
                            mensaje = "Debe cambiar la contraseña antes de continuar."
                        })
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                        return;
                    }
                }
            }

            await next();
        }
    }
}
