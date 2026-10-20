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

            RuleFor(x => x.NombreCompleto)
                .NotEmpty().WithMessage("El nombre completo es obligatorio.")
                .MaximumLength(200);

            RuleFor(x => x.Telefono)
                .MaximumLength(30).WithMessage("El teléfono no puede superar los 30 caracteres.")
                .Matches(@"^[0-9+\-\s()]*$").WithMessage("El formato del teléfono no es válido.")
                .When(x => !string.IsNullOrWhiteSpace(x.Telefono));

            RuleFor(x => x.Rol)
                .IsInEnum().WithMessage("El rol no es válido.");
        }
    }
}
