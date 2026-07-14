using distribuidora_saas.Application.Productos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Productos.Validators
{
    public class CrearProductoDtoValidator : AbstractValidator<CrearProductoDto>
    {
        public CrearProductoDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(150).WithMessage("El nombre no puede superar los 150 caracteres.");

            RuleFor(x => x.Precio)
                .GreaterThanOrEqualTo(0).WithMessage("El precio no puede ser negativo.");

            RuleFor(x => x.Costo)
                .GreaterThanOrEqualTo(0).WithMessage("El costo no puede ser negativo.");

            RuleFor(x => x.TipoEnvase)
                .IsInEnum().WithMessage("El tipo de envase no es válido.");
        }
    }
}
