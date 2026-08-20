using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class MovimientoEnvaseConfiguration : IEntityTypeConfiguration<MovimientoEnvase>
    {
        public void Configure(EntityTypeBuilder<MovimientoEnvase> builder)
        {
            builder.ToTable("MovimientosEnvases");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Id)
                .ValueGeneratedNever();

            builder.Property(m => m.TipoMovimiento)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(m => m.Cantidad)
                .IsRequired();

            builder.HasOne<Cliente>()
                .WithMany()
                .HasForeignKey(m => m.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Venta>()
                .WithMany()
                .HasForeignKey(m => m.VentaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Producto>()
                .WithMany()
                .HasForeignKey(m => m.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(m => new { m.TenantId, m.ClienteId });
        }
    }
}