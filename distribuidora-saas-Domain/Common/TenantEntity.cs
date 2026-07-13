using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Common
{
    public abstract class TenantEntity : AuditableEntity
    {
        public Guid TenantId { get; set; }
    }
}
