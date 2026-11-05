using LiveKitApp.Backend.Database.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LiveKitApp.Backend.Database;

public class AppDbContext : IdentityDbContext<IdentityUser> {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {
        
    }
    
    public DbSet<Device> Devices => Set<Device>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Device>(devices => {
            devices.Property(d => d.Name).HasMaxLength(100);
            devices.Property(d => d.KeyHash).HasMaxLength(64);
            devices.HasIndex(d => d.KeyHash).IsUnique();
        });
    }
}