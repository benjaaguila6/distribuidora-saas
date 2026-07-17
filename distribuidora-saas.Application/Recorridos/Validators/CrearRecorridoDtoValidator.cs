using distribuidora_saas.Application.Recorridos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.Validators
{
    public class CrearRecorridoDtoValidator : AbstractValidator<CrearRecorridoDto>
    {
        public CrearRecorridoDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(150);

            RuleFor(x => x.DiaSemana)
                .IsInEnum().WithMessage("El día de la semana no es válido.");
        }
    }
}
