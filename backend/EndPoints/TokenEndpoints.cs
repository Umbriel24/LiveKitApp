using LiveKitApp.Backend.Services;

namespace LiveKitApp.Backend.EndPoints;

public static class TokenEndpoints {
    //Extension method di app.
    public static void MapTokenEndpoints(this IEndpointRouteBuilder app) {
        
        app.MapGet("/token", (string room, string identity, string name, TokenFactory tokenFactory) => {
            var viewerToken = tokenFactory.CreateViewerToken(identity, room, name);
            return Results.Ok(viewerToken);
        });
    }
}