using distribuidora_saas.Infrastructure.Persistence.Interceptors;
using distribuidora_saas.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas.Infrastructure.Persistence
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var basePath = FindApiProjectPath();

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));

            var currentTenantService = new CurrentTenantService();
            var auditInterceptor = new AuditableEntitySaveChangesInterceptor();

            return new ApplicationDbContext(optionsBuilder.Options, currentTenantService, auditInterceptor);
        }

        private static string FindApiProjectPath()
        {
            // Busca hacia arriba desde el directorio actual hasta encontrar
            // la carpeta "distribuidora-saas.Api" (funciona sin importar
            // desde dónde se ejecute dotnet ef).
            var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

            while (directory is not null)
            {
                var candidatePath = Path.Combine(directory.FullName, "distribuidora-saas.Api");
                if (Directory.Exists(candidatePath) && File.Exists(Path.Combine(candidatePath, "appsettings.json")))
                {
                    return candidatePath;
                }

                directory = directory.Parent;
            }

            throw new DirectoryNotFoundException(
                "No se pudo encontrar el proyecto 'distribuidora-saas.Api' con su appsettings.json subiendo desde el directorio actual.");
        }
    }
}
