export interface RoomDetails {
  sid: string;
  name: string;
  numParticipant: number;
}

export interface TokenResponse {
  token: string;
  url: string;
}

// Risposta di POST /rooms (CreateLobbyResponse nel backend)
export interface CreateLobbyResponse {
  roomName: string;
  connection: TokenResponse;
}
