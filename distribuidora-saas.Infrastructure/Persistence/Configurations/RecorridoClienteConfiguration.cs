using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Configurations
{
    public class RecorridoClienteConfiguration : IEntityTypeConfiguration<RecorridoCliente>
    {
        public void Configure(EntityTypeBuilder<RecorridoCliente> builder)
        {
            builder.ToTable("RecorridoClientes");

            builder.HasKey(rc => rc.Id);

            builder.Property(rc => rc.Id)
                .ValueGeneratedNever();

            builder.HasOne<Cliente>()
                .WithMany()
                .HasForeignKey(rc => rc.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(rc => new { rc.RecorridoId, rc.ClienteId })
                .IsUnique();
        }
    }
}
