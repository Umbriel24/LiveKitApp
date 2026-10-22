using Livekit.Server.Sdk.Dotnet;
using LiveKitApp.Backend.Contracts;
using Microsoft.Extensions.Options;

namespace LiveKitApp.Backend.Services;

//Factory che crea i token per i client da Unity e da Browser.
public class TokenFactory {
    private readonly LiveKitOptions _options;
    
    public TokenFactory(IOptions<LiveKitOptions> options) {
        _options = options.Value;
    }

    //Token con publish di audio e video
    public TokenResult CreateHostToken(string identity, string room) {
        return CreateToken(identity, room, new List<string> { "microphone", "screen_share" });
    }
    
    //Token con publish del solo audio
    public TokenResult CreateViewerToken(string identity, string room) {
        return CreateToken(identity, room, new List<string> {"microphone"});
    }

    private TokenResult CreateToken(string identity, string room, List<string> sources) {
        var token = new AccessToken(_options.ApiKey, _options.ApiSecret)
            .WithName(identity)
            .WithIdentity(identity)
            .WithGrants(new VideoGrants {
                CanSubscribe = true,
                CanPublishSources = sources,
                RoomJoin = true,
                Room = room
            });
        return new TokenResult(token.ToJwt(), _options.PublicUrl);
    }
}