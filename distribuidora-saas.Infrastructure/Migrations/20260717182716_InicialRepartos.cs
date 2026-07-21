using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace distribuidora_saas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InicialRepartos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Repartos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecorridoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RepartidorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaReparto = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Repartos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Repartos_Recorridos_RecorridoId",
                        column: x => x.RecorridoId,
                        principalTable: "Recorridos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Repartos_Usuarios_RepartidorId",
                        column: x => x.RepartidorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RepartoStockInicial",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RepartoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadInicial = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepartoStockInicial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepartoStockInicial_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepartoStockInicial_Repartos_RepartoId",
                        column: x => x.RepartoId,
                        principalTable: "Repartos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Repartos_RecorridoId",
                table: "Repartos",
                column: "RecorridoId");

            migrationBuilder.CreateIndex(
                name: "IX_Repartos_RepartidorId",
                table: "Repartos",
                column: "RepartidorId",
                unique: true,
                filter: "[Estado] = 'EnCurso'");

            migrationBuilder.CreateIndex(
                name: "IX_Repartos_TenantId_FechaReparto",
                table: "Repartos",
                columns: new[] { "TenantId", "FechaReparto" });

            migrationBuilder.CreateIndex(
                name: "IX_RepartoStockInicial_ProductoId",
                table: "RepartoStockInicial",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_RepartoStockInicial_RepartoId_ProductoId",
                table: "RepartoStockInicial",
                columns: new[] { "RepartoId", "ProductoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RepartoStockInicial");

            migrationBuilder.DropTable(
                name: "Repartos");
        }
    }
}
