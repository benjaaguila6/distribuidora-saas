using distribuidora_saas.Application.Productos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Productos.Validators
{
    public class ActualizarNombreProductoDtoValidator : AbstractValidator<ActualizarNombreProductoDto>
    {
        public ActualizarNombreProductoDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(150).WithMessage("El nombre no puede superar los 150 caracteres.");
        }
    }
}
