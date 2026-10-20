using distribuidora_saas.Application.Usuarios.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.Validators
{
    public class ResetearPasswordDtoValidator : AbstractValidator<ResetearPasswordDto>
    {
        public ResetearPasswordDtoValidator()
        {
            RuleFor(x => x.PasswordNueva)
                .NotEmpty().WithMessage("La contraseña es obligatoria.")
                .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
                .Matches("[A-Z]").WithMessage("La contraseña debe tener al menos una mayúscula.")
                .Matches("[0-9]").WithMessage("La contraseña debe tener al menos un número.");
        }
    }
}
