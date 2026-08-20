using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class VentaPagoConfiguration : IEntityTypeConfiguration<VentaPago>
    {
        public void Configure(EntityTypeBuilder<VentaPago> builder)
        {
            builder.ToTable("VentaPagos");

            builder.HasKey(vp => vp.Id);

            builder.Property(vp => vp.Id)
                .ValueGeneratedNever();

            builder.Property(vp => vp.FormaPago)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(vp => vp.Monto)
                .HasPrecision(12, 2);

            builder.Property(vp => vp.ImporteEntregadoPorCliente)
                .HasPrecision(12, 2);

            builder.Property(vp => vp.Vuelto)
                .HasPrecision(12, 2);
        }
    }
}