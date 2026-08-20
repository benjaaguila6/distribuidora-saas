using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RepartoEnvaseRetiradoConfiguration : IEntityTypeConfiguration<RepartoEnvaseRetirado>
    {
        public void Configure(EntityTypeBuilder<RepartoEnvaseRetirado> builder)
        {
            builder.ToTable("RepartoEnvasesRetirados");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedNever();

            builder.Property(e => e.CantidadRetirada)
                .IsRequired();

            builder.HasOne<Producto>()
                .WithMany()
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(e => new { e.RepartoId, e.ProductoId })
                .IsUnique();
        }
    }
}
