using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class VentaConfiguration : IEntityTypeConfiguration<Venta>
    {
        public void Configure(EntityTypeBuilder<Venta> builder)
        {
            builder.ToTable("Ventas");

            builder.HasKey(v => v.Id);

            builder.Property(v => v.Id)
                .ValueGeneratedNever();

            builder.Property(v => v.DineroRecibido)
                .HasPrecision(12, 2);

            builder.Property(v => v.Observaciones)
                .HasMaxLength(1000);

            builder.HasOne<Reparto>()
                .WithMany()
                .HasForeignKey(v => v.RepartoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Cliente>()
                .WithMany()
                .HasForeignKey(v => v.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(v => v.Productos)
                .WithOne()
                .HasForeignKey(vp => vp.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Metadata
                .FindNavigation(nameof(Venta.Productos))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            builder.HasIndex(v => new { v.TenantId, v.FechaVenta });
            builder.HasIndex(v => v.ClienteId);
        }
    }
}
