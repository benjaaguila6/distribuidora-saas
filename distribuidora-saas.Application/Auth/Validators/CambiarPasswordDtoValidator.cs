using distribuidora_saas.Application.Auth.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Auth.Validators
{
    public class CambiarPasswordDtoValidator : AbstractValidator<CambiarPasswordDto>
    {
        public CambiarPasswordDtoValidator()
        {
            RuleFor(x => x.PasswordActual)
                .NotEmpty().WithMessage("La contraseña actual es obligatoria.");

            RuleFor(x => x.PasswordNueva)
                .NotEmpty().WithMessage("La contraseña nueva es obligatoria.")
                .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
                .Matches("[A-Z]").WithMessage("La contraseña debe tener al menos una mayúscula.")
                .Matches("[0-9]").WithMessage("La contraseña debe tener al menos un número.")
                .NotEqual(x => x.PasswordActual).WithMessage("La contraseña nueva debe ser distinta de la actual.");
        }
    }
}
