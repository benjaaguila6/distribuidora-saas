using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class VentaProductoConfiguration : IEntityTypeConfiguration<VentaProducto>
    {
        public void Configure(EntityTypeBuilder<VentaProducto> builder)
        {
            builder.ToTable("VentaProductos");

            builder.HasKey(vp => vp.Id);

            builder.Property(vp => vp.Id)
                .ValueGeneratedNever();

            builder.Property(vp => vp.TipoMovimiento)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(vp => vp.Cantidad)
                .IsRequired();

            builder.HasOne<Producto>()
                .WithMany()
                .HasForeignKey(vp => vp.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
