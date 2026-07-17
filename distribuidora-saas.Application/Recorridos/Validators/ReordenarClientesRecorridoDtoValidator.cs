using distribuidora_saas.Application.Recorridos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Recorridos.Validators
{
    public class ReordenarClientesRecorridoDtoValidator : AbstractValidator<ReordenarClientesRecorridoDto>
    {
        public ReordenarClientesRecorridoDtoValidator()
        {
            RuleFor(x => x.ClienteIdsEnOrden)
                .NotEmpty().WithMessage("La lista de clientes no puede estar vacía.");

            RuleForEach(x => x.ClienteIdsEnOrden)
                .NotEmpty().WithMessage("Los IDs de cliente no pueden ser vacíos.");
        }
    }
}
