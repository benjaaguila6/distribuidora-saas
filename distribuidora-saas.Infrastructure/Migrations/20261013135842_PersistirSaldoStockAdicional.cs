using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace distribuidora_saas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PersistirSaldoStockAdicional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CantidadRestante",
                table: "RepartosStockAdicionales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(
                "UPDATE RepartosStockAdicionales SET CantidadRestante = Cantidad");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CantidadRestante",
                table: "RepartosStockAdicionales");
        }
    }
}
