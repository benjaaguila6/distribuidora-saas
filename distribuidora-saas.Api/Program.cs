using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas.Infrastructure.Persistence.Interceptors;
using distribuidora_saas.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();
builder.Services.AddSingleton<AuditableEntitySaveChangesInterceptor>();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
