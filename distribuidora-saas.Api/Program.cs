using distribuidora_saas.Application.Common.Interfaces;
using distribuidora_saas.Infrastructure.Persistence;
using distribuidora_saas.Infrastructure.Persistence.Interceptors;
using distribuidora_saas.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using distribuidora_saas.Api.Filters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();
builder.Services.AddScoped<ValidationFilter>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasherService>();

builder.Services.AddControllers(options =>
{
    options.Filters.AddService<ValidationFilter>();
});
builder.Services.AddSingleton<AuditableEntitySaveChangesInterceptor>();
builder.Services.AddValidatorsFromAssembly(typeof(distribuidora_saas.Application.Clientes.DTOs.CrearClienteDto).Assembly);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
