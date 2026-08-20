using distribuidora_saas.Application.Ventas.DTOs;
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
        }
    }
}
