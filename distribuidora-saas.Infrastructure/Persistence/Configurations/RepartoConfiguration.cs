using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RepartoConfiguration : IEntityTypeConfiguration<Reparto>
    {
        public void Configure(EntityTypeBuilder<Reparto> builder)
        {
            builder.ToTable("Repartos");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Id)
                .ValueGeneratedNever();

            builder.Property(r => r.Estado)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.HasOne<Recorrido>()
                .WithMany()
                .HasForeignKey(r => r.RecorridoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Usuario>()
                .WithMany()
                .HasForeignKey(r => r.RepartidorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(r => r.StockInicial)
                .WithOne()
                .HasForeignKey(s => s.RepartoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Metadata
                .FindNavigation(nameof(Reparto.StockInicial))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            builder.HasMany(r => r.EnvasesRetirados)
                .WithOne()
                .HasForeignKey(e => e.RepartoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Metadata
                .FindNavigation(nameof(Reparto.EnvasesRetirados))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            builder.HasIndex(r => r.RepartidorId)
                .HasFilter("[Estado] = 'EnCurso'")
                .IsUnique();

            builder.HasIndex(r => new { r.TenantId, r.FechaReparto });
        }
    }
}
