using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Infrastructure.Persistence.Interceptors;
using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Entitites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq.Expressions;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        private readonly ICurrentTenantService _currentTenantService;
        private readonly AuditableEntitySaveChangesInterceptor _auditInterceptor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentTenantService currentTenantService, AuditableEntitySaveChangesInterceptor auditInterceptor) : base(options)
        {
            _currentTenantService = currentTenantService;
            _auditInterceptor = auditInterceptor;

        }

         public DbSet<Cliente> Clientes => Set<Cliente>();
         public DbSet<Producto> Productos => Set<Producto>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aplica todas las clases IEntityTypeConfiguration<T> del assembly
            // (esto es lo que nos permite tener Configurations/ClienteConfiguration.cs, etc.
            // en vez de escribir todo acá adentro).
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            // Global Query Filter: se aplica automáticamente a TODA entidad
            // que herede de TenantEntity, en TODAS las queries, sin excepción.
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(TenantEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(BuildTenantFilterExpression(entityType.ClrType));
                }
            }
        }

        private LambdaExpression BuildTenantFilterExpression(Type entityType)
        {
            // Construye dinámicamente: e => e.TenantId == _currentTenantService.TenantId
            var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
            var tenantIdProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(TenantEntity.TenantId));
            var currentTenantIdValue = System.Linq.Expressions.Expression.Property(
                System.Linq.Expressions.Expression.Constant(_currentTenantService),
                nameof(ICurrentTenantService.TenantId));

            var comparison = System.Linq.Expressions.Expression.Equal(
                System.Linq.Expressions.Expression.Convert(tenantIdProperty, typeof(Guid?)),
                currentTenantIdValue);

            return System.Linq.Expressions.Expression.Lambda(comparison, parameter);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.AddInterceptors(_auditInterceptor);
            base.OnConfiguring(optionsBuilder);
        }
    }
}
