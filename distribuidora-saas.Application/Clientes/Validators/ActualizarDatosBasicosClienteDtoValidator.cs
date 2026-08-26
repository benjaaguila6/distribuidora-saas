using distribuidora_saas.Application.Clientes.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.Validators
{
    public class ActualizarDatosBasicosClienteDtoValidator : AbstractValidator<ActualizarDatosBasicosClienteDto>
    {
        public ActualizarDatosBasicosClienteDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres.");

            RuleFor(x => x.Direccion)
                .NotEmpty().WithMessage("La dirección es obligatoria.")
                .MaximumLength(300).WithMessage("La dirección no puede superar los 300 caracteres.");
        }
    }
}
