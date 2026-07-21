using distribuidora_saas.Application.Repartos.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Repartos.Validators
{
    public class AgregarStockInicialDtoValidator : AbstractValidator<AgregarStockInicialDto>
    {
        public AgregarStockInicialDtoValidator()
        {
            RuleFor(x => x.ProductoId).NotEmpty();

            RuleFor(x => x.Cantidad)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a cero.");
        }
    }
}
