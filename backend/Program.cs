using Livekit.Server.Sdk.Dotnet;

var builder = WebApplication.CreateBuilder(args);

//Fail fast in caso non esistano

//Messi in user secret
var apikey = builder.Configuration["livekit:apikey"] ?? throw new InvalidOperationException("LiveKit API Key is missing");
var secret = builder.Configuration["livekit:apisecret"] ?? throw new InvalidOperationException("Secret is missing");

//Messo in appsettings.Development
var internalHost = builder.Configuration["Livekit:InternalUrl"] ?? throw new InvalidOperationException("InternalUrl is missing");
var publicUrl = builder.Configuration["Livekit:PublicUrl"] ?? throw new InvalidOperationException("public url is missing");


RoomServiceClient client = new RoomServiceClient(
    internalHost,
    apikey,
    secret
);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// /token?room=test&identity=alice
app.MapGet("/token", (string room, string identity) =>
{
    var token = new AccessToken(apikey, secret)
        .WithIdentity(identity)
        .WithName(identity)
        .WithGrants(new VideoGrants
        {
            RoomJoin = true,
            RoomCreate = true,
            Room = room
        });
    var jwt = token.ToJwt();
    return Results.Ok(new
    {
        token = jwt,
        url = publicUrl
    });
});


app.MapGet("/rooms", async () => {


    var listRoomRequest = new ListRoomsRequest();
    var listRoomResponse = await client.ListRooms(listRoomRequest);
    Room[] rooms = listRoomResponse.Rooms.ToArray();

    List<RoomDetailsToShow> roomList = [
        .. from room in rooms
        let sid = room.Sid
        let name = room.Name
        let numParticipant = room.NumParticipants
        select new RoomDetailsToShow(sid, name, numParticipant)
    ];
    return Results.Ok(roomList);
});
    
app.Run();

record RoomDetailsToShow(string sid, string name, uint numParticipant);
