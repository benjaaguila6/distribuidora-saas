using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            builder.ToTable("Usuarios");

            builder.HasKey(u => u.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);

            // Email único GLOBAL (no solo por tenant, sino para simplificar login tmb)
            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(u => u.NombreCompleto)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(u => u.Rol)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(u => u.Estado)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(u => u.RefreshToken)
                .HasMaxLength(500);
        }
    }
}
