using distribuidora_saas.Application.Repartos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.Validators
{
    public class CrearRepartoDtoValidator : AbstractValidator<CrearRepartoDto>
    {
        public CrearRepartoDtoValidator()
        {
            RuleFor(x => x.RecorridoId).NotEmpty();
            RuleFor(x => x.RepartidorId).NotEmpty();
            RuleFor(x => x.FechaReparto).NotEmpty();
        }
    }
}
