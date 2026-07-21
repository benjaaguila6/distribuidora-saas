using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RepartoStockInicialConfiguration : IEntityTypeConfiguration<RepartoStockInicial>
    {
        public void Configure(EntityTypeBuilder<RepartoStockInicial> builder)
        {
            builder.ToTable("RepartoStockInicial");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id)
                .ValueGeneratedNever();

            builder.Property(s => s.CantidadInicial)
                .IsRequired();

            builder.HasOne<Producto>()
                .WithMany()
                .HasForeignKey(s => s.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(s => new { s.RepartoId, s.ProductoId })
                .IsUnique();
        }
    }
}
