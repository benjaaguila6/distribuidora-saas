using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RepartoStockAdicionalConfiguration : IEntityTypeConfiguration<RepartoStockAdicional>
    {
        public void Configure(EntityTypeBuilder<RepartoStockAdicional> builder)
        {
            builder.ToTable("RepartosStockAdicionales");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id)
                .ValueGeneratedNever();

            builder.Property(s => s.Cantidad)
                .IsRequired();

            builder.HasOne<Reparto>()
                .WithMany(r => r.StockAdicional)
                .HasForeignKey(s => s.RepartoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Producto>()
                .WithMany()
                .HasForeignKey(s => s.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(s => s.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(s => new { s.TenantId, s.RepartoId, s.ProductoId });
        }
    }
}
