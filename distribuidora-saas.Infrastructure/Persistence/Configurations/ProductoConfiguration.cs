using System;
using System.Collections.Generic;
using System.Text;
using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class ProductoConfiguration : IEntityTypeConfiguration<Producto>
    {
        public void Configure(EntityTypeBuilder<Producto> builder)
        {
            builder.ToTable("Productos");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Nombre)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(p => p.Precio)
                .HasPrecision(10, 2);

            builder.Property(p => p.Costo)
                .HasPrecision(10, 2);

            builder.Property(p => p.TipoEnvase)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.HasIndex(p => new { p.TenantId, p.Nombre });
        }
    }
}
