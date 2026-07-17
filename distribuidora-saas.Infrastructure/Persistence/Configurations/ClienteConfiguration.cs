using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    internal class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
    {
        public void Configure(EntityTypeBuilder<Cliente> builder)
        {
            builder.ToTable("Clientes");

            builder.HasKey(c => c.Id);

            builder.Property(x => x.Id).ValueGeneratedNever();

            builder.Property(c => c.Nombre)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(c => c.Direccion)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(c => c.Telefono)
                .HasMaxLength(30);

            builder.Property(c => c.Latitud)
                .HasPrecision(9, 6);

            builder.Property(c => c.Longitud)
                .HasPrecision(9, 6);

            builder.Property(c => c.Observaciones)
                .HasMaxLength(1000);

            builder.Property(c => c.SaldoDeudaActual)
                .HasPrecision(12, 2)
                .HasDefaultValue(0);

            builder.Property(c => c.SaldoEnvasesActual)
                .HasDefaultValue(0);

            builder.Property(c => c.Estado)
                .HasConversion<string>()
                .HasMaxLength(20);

            // Índice compuesto: las búsquedas de clientes SIEMPRE van a filtrar por TenantId primero. Este índice acelera esas queries.
            builder.HasIndex(c => new { c.TenantId, c.Nombre });
        }
    }
}
