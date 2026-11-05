namespace LiveKitApp.Backend.Database.Entities;

public class Device {
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string KeyHash { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}