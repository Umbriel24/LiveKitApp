export interface RoomDetails {
  sid: string;
  name: string;
  numParticipant: number;
}

export interface TokenResponse {
  token: string;
  url: string;
}
