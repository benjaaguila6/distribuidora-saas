using distribuidora_saas.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? TenantId
        {
            get
            {
                var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;

                if (string.IsNullOrWhiteSpace(tenantIdClaim))
                {
                    return null;
                }

                return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : null;
            }
        }
    }
}
