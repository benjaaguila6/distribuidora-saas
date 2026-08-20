using distribuidora_saas.Application.Ventas.DTOs;
using distribuidora_saas_Domain.Enums;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.Validators
{
    public class PagoVentaDtoValidator : AbstractValidator<PagoVentaDto>
    {
        public PagoVentaDtoValidator()
        {
            RuleFor(x => x.FormaPago).IsInEnum();

            RuleFor(x => x.Monto).GreaterThan(0).WithMessage("El monto del pago debe ser mayor a cero.");

            When(x => x.FormaPago == FormaPago.Efectivo, () =>
            {
                RuleFor(x => x.ImporteEntregadoPorCliente)
                    .NotNull().WithMessage("Para pagos en efectivo el importe entregado es obligatorio.");

                RuleFor(x => x.ImporteEntregadoPorCliente)
                    .Must((pago, importe) => importe is null || importe.Value >= pago.Monto)
                    .WithMessage("El importe entregado no puede ser menor al monto del pago.");
            });

            When(x => x.FormaPago != FormaPago.Efectivo, () =>
            {
                RuleFor(x => x.ImporteEntregadoPorCliente)
                    .Null().WithMessage("El importe entregado solo aplica a pagos en efectivo.");
            });
        }
    }
}