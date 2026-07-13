using distribuidora_saas.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        // TODO: luego reemplazar por lectura real del claim "tenant_id" del JWT
        public Guid? TenantId { get; set; }


    }
}
