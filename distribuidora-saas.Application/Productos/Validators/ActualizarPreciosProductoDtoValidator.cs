using distribuidora_saas.Application.Productos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Productos.Validators
{
    public class ActualizarPreciosProductoDtoValidator : AbstractValidator<ActualizarPreciosProductoDto>
    {
        public ActualizarPreciosProductoDtoValidator()
        {
            RuleFor(x => x.Precio)
                .GreaterThanOrEqualTo(0).WithMessage("El precio no puede ser negativo.");

            RuleFor(x => x.Costo)
                .GreaterThanOrEqualTo(0).WithMessage("El costo no puede ser negativo.");
        }
    }
}
