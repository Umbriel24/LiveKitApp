using System.ComponentModel.DataAnnotations;

namespace LiveKitApp.Backend;

public class LiveKitOptions() {
    
    public const string SectionName = "livekit";
    
    [Required] public string ApiKey {get; set;} = string.Empty;
    [Required] public string ApiSecret {get; set;} = string.Empty;
    [Required] public string InternalUrl {get; set;} = string.Empty;
    [Required] public string PublicUrl {get; set;} = string.Empty;
}