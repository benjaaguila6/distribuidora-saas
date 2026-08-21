using distribuidora_saas.Application.Repartos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.Validators
{
    public class FinalizarRepartoDtoValidator : AbstractValidator<FinalizarRepartoDto>
    {
        public FinalizarRepartoDtoValidator()
        {
            RuleFor(x => x.CajaEntregada)
                .GreaterThanOrEqualTo(0).WithMessage("La caja entregada no puede ser negativa.");

            RuleForEach(x => x.Gastos).ChildRules(gasto =>
            {
                gasto.RuleFor(g => g.Concepto).IsInEnum();
                gasto.RuleFor(g => g.Monto).GreaterThan(0).WithMessage("El monto del gasto debe ser mayor a cero.");
            });
        }
    }
}