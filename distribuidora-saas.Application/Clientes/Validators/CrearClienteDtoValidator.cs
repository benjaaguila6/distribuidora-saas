using distribuidora_saas.Application.Clientes.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Clientes.Validators
{
    public class CrearClienteDtoValidator : AbstractValidator<CrearClienteDto>
    {
        public CrearClienteDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres.");

            RuleFor(x => x.Direccion)
                .NotEmpty().WithMessage("La dirección es obligatoria.")
                .MaximumLength(300).WithMessage("La dirección no puede superar los 300 caracteres.");

            RuleFor(x => x.Telefono)
                .MaximumLength(30).WithMessage("El teléfono no puede superar los 30 caracteres.");

            RuleFor(x => x.Latitud)
                .InclusiveBetween(-90, 90).When(x => x.Latitud.HasValue)
                .WithMessage("La latitud debe estar entre -90 y 90.");

            RuleFor(x => x.Longitud)
                .InclusiveBetween(-180, 180).When(x => x.Longitud.HasValue)
                .WithMessage("La longitud debe estar entre -180 y 180.");

            RuleFor(x => x.Observaciones)
                .MaximumLength(1000).WithMessage("Las observaciones no pueden superar los 1000 caracteres.");
        }
    }
}
