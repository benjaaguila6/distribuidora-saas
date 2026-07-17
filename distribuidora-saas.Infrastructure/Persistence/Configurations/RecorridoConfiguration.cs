using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RecorridoConfiguration : IEntityTypeConfiguration<Recorrido>
    {
        public void Configure(EntityTypeBuilder<Recorrido> builder)
        {
            builder.ToTable("Recorridos");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Nombre)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(r => r.DiaSemana)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.HasMany(r => r.Clientes)
                .WithOne()
                .HasForeignKey(rc => rc.RecorridoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Metadata
                .FindNavigation(nameof(Recorrido.Clientes))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);

            builder.HasIndex(r => new { r.TenantId, r.DiaSemana });
        }
    }
}
