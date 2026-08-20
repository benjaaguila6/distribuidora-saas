using distribuidora_saas.Application.Ventas.DTOs;
using distribuidora_saas_Domain.Enums;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Ventas.Validators
{
    public class CrearVentaDtoValidator : AbstractValidator<CrearVentaDto>
    {
        public CrearVentaDtoValidator()
        {
            RuleFor(x => x.RepartoId).NotEmpty();
            RuleFor(x => x.ClienteId).NotEmpty();

            RuleFor(x => x.DineroRecibido)
                .GreaterThanOrEqualTo(0).WithMessage("El dinero recibido no puede ser negativo.");

            RuleForEach(x => x.Productos).ChildRules(producto =>
            {
                producto.RuleFor(p => p.ProductoId).NotEmpty();
                producto.RuleFor(p => p.Cantidad).GreaterThan(0).WithMessage("La cantidad debe ser mayor a cero.");
                producto.RuleFor(p => p.TipoMovimiento).IsInEnum();
            });

            RuleForEach(x => x.Pagos).ChildRules(pago =>
            {
                pago.RuleFor(p => p.FormaPago).IsInEnum();
                pago.RuleFor(p => p.Monto).GreaterThan(0).WithMessage("El monto del pago debe ser mayor a cero.");

                pago.When(p => p.FormaPago == FormaPago.Efectivo, () =>
                {
                    pago.RuleFor(p => p.ImporteEntregadoPorCliente)
                        .NotNull().WithMessage("Para pagos en efectivo el importe entregado es obligatorio.");

                    pago.RuleFor(p => p.ImporteEntregadoPorCliente)
                        .Must((pagoDto, importe) => importe is null || importe.Value >= pagoDto.Monto)
                        .WithMessage("El importe entregado no puede ser menor al monto del pago.");
                });

                pago.When(p => p.FormaPago != FormaPago.Efectivo, () =>
                {
                    pago.RuleFor(p => p.ImporteEntregadoPorCliente)
                        .Null().WithMessage("El importe entregado solo aplica a pagos en efectivo.");
                });
            });
        }
    }
}
