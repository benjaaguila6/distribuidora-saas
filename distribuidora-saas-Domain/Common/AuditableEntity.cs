namespace distribuidora_saas_Domain.Common
{
    public abstract class AuditableEntity
    {
        public Guid Id { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }
}
