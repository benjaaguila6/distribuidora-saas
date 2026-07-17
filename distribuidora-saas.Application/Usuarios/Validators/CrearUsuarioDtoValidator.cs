using distribuidora_saas.Application.Usuarios.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Application.Usuarios.Validators
{
    public class CrearUsuarioDtoValidator : AbstractValidator<CrearUsuarioDto>
    {
        public CrearUsuarioDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El email es obligatorio.")
                .EmailAddress().WithMessage("El formato del email no es válido.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("La contraseña es obligatoria.")
                .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
                .Matches("[A-Z]").WithMessage("La contraseña debe tener al menos una mayúscula.")
                .Matches("[0-9]").WithMessage("La contraseña debe tener al menos un número.");

            RuleFor(x => x.NombreCompleto)
                .NotEmpty().WithMessage("El nombre completo es obligatorio.")
                .MaximumLength(200);

            RuleFor(x => x.Rol)
                .IsInEnum().WithMessage("El rol no es válido.");
        }
    }
}
