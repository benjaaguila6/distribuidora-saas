using distribuidora_saas_Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence.Interceptors
{
    public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            UpdateAuditableEntities(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            UpdateAuditableEntities(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }
        private void UpdateAuditableEntities(DbContext? context)
        {
            if (context is null)
            {
                return;
            }

            var entries = context.ChangeTracker.Entries<AuditableEntity>();

            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.FechaCreacion = DateTime.UtcNow;
                        break;

                    case EntityState.Modified:
                        entry.Entity.FechaModificacion = DateTime.UtcNow;
                        break;
                }
            }
        }
    }
}
