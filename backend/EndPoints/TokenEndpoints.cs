using LiveKitApp.Backend.Services;

namespace LiveKitApp.Backend.EndPoints;

public static class TokenEndpoints {
    //Extension method di app.
    public static void MapTokenEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet("/token", (string room, string identity, TokenFactory tokenFactory) => {
            var viewerToken = tokenFactory.CreateViewerToken(identity, room);
            return Results.Ok(viewerToken);
        });
    }
}