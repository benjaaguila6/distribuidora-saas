using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace distribuidora_saas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RepartoStockAdicional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RepartosStockAdicionales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RepartoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepartosStockAdicionales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepartosStockAdicionales_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepartosStockAdicionales_Repartos_RepartoId",
                        column: x => x.RepartoId,
                        principalTable: "Repartos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RepartosStockAdicionales_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RepartosStockAdicionales_ProductoId",
                table: "RepartosStockAdicionales",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_RepartosStockAdicionales_RepartoId",
                table: "RepartosStockAdicionales",
                column: "RepartoId");

            migrationBuilder.CreateIndex(
                name: "IX_RepartosStockAdicionales_TenantId_RepartoId_ProductoId",
                table: "RepartosStockAdicionales",
                columns: new[] { "TenantId", "RepartoId", "ProductoId" });

            migrationBuilder.CreateIndex(
                name: "IX_RepartosStockAdicionales_UsuarioId",
                table: "RepartosStockAdicionales",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RepartosStockAdicionales");
        }
    }
}
