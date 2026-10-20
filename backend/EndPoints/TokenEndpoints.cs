using Livekit.Server.Sdk.Dotnet;
using Microsoft.Extensions.Options;

namespace LiveKitApp.Backend.EndPoints;

public static class TokenEndpoints {

    //Extension method di app.
    public static void MapTokenEndpoints(this IEndpointRouteBuilder app) {

        app.MapGet("/token", (string room, string identity, IOptions<LiveKitOptions> liveKitOptions) => {
            var token = new AccessToken(liveKitOptions.Value.ApiKey, liveKitOptions.Value.ApiSecret)
                .WithIdentity(identity)
                .WithName(identity)
                .WithGrants(new VideoGrants {
                    RoomJoin = true,
                    RoomCreate = true,
                    Room = room
                });
            var jwt = token.ToJwt();
            return Results.Ok(new {
                token = jwt,
                url = liveKitOptions.Value.PublicUrl
            });
        });
    }

}