using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiveKitApp.Backend.Database.Migrations
{
    /// <inheritdoc />
    public partial class RenameRevokedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateTimeOffset",
                table: "Devices",
                newName: "RevokedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RevokedAt",
                table: "Devices",
                newName: "DateTimeOffset");
        }
    }
}
