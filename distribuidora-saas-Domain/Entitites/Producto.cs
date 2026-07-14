using distribuidora_saas_Domain.Common;
using distribuidora_saas_Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace distribuidora_saas_Domain.Entitites
{
    public class Producto : TenantEntity
    {
        public string Nombre { get; private set; } = string.Empty;
        public decimal Precio { get; private set; }
        public decimal Costo { get; private set; }
        public TipoEnvase TipoEnvase { get; private set; }
        public bool Activo { get; private set; }

        private Producto() { }

        public Producto(Guid tenantId, string nombre, decimal precio, decimal costo, TipoEnvase tipoEnvase)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                throw new ArgumentException("El nombre del producto es obligatorio.", nameof(nombre));
            }

            if (precio < 0)
            {
                throw new ArgumentException("El precio no puede ser negativo.", nameof(precio));
            }
               
            if (costo < 0)
            {
                throw new ArgumentException("El costo no puede ser negativo.", nameof(costo));
            }

            Id = Guid.NewGuid();
            TenantId = tenantId;
            Nombre = nombre;
            Precio = precio;
            Costo = costo;
            TipoEnvase = tipoEnvase;
            Activo = true;
        }

        public void ActualizarPrecios(decimal precio, decimal costo)
        {
            if (precio < 0)
            {
                throw new ArgumentException("El precio no puede ser negativo.", nameof(precio));
            }


            if (costo < 0)
            {
                throw new ArgumentException("El costo no puede ser negativo.", nameof(costo));

            }

            Precio = precio;
            Costo = costo;
        }

        public void ActualizarNombre(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                throw new ArgumentException("El nombre del producto es obligatorio.", nameof(nombre));
            }

            Nombre = nombre;
        }

        public void Desactivar() => Activo = false;
        public void Reactivar() => Activo = true;
    }
}
