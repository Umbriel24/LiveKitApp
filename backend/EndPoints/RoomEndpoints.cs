using Livekit.Server.Sdk.Dotnet;
using LiveKitApp.Backend.Contracts;

namespace LiveKitApp.Backend.EndPoints;

public static class RoomEndpoints {
    
    public static void MapRoomEndpoints(this IEndpointRouteBuilder app) {
        
        app.MapGet("/rooms", async (RoomServiceClient client) => {


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

        app.MapPost("/rooms", () => { });
    }
}