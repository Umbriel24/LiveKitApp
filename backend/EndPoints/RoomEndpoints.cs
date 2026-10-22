using System.Text.Json;
using Livekit.Server.Sdk.Dotnet;
using LiveKitApp.Backend.Contracts;
using LiveKitApp.Backend.Services;

namespace LiveKitApp.Backend.EndPoints;

public static class RoomEndpoints {
    
    public static void MapRoomEndpoints(this IEndpointRouteBuilder app) {
        var rooms = app.MapGroup("/rooms");
        
        rooms.MapGet("/", async (RoomServiceClient client) => {


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

        rooms.MapPost("/", async (CreateLobbyRequest request, TokenFactory factory, RoomServiceClient roomServiceClient) => {
            const uint departureTimeSeconds = 180, emptyTimeoutInSeconds = 30;
            
            var roomNameGuid = Guid.NewGuid().ToString();
            var createRoomRequest = new CreateRoomRequest {
                Name = roomNameGuid,
                EmptyTimeout = emptyTimeoutInSeconds,
                DepartureTimeout = departureTimeSeconds,
                Metadata = JsonSerializer.Serialize(new {
                    displayName = request.DisplayName,
                })
            };

            //Creazione stanza
            var createdRoom = await roomServiceClient.CreateRoom(createRoomRequest);

            //Token per la connessione alla stanza creata
            var connection = factory.CreateHostToken(
                identity: request.UserId,
                room: createdRoom.Name,
                name: request.DisplayName
            );
            
            return Results.Ok(connection);
        });
    }
}