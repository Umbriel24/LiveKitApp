import { RoomDetails, TokenResponse } from '../types/livekit';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5250';

/**
 * Recupera l'elenco delle stanze attive dal backend .NET
 */
export async function fetchRooms(): Promise<RoomDetails[]> {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Errore durante il recupero delle stanze: ${response.status} ${response.statusText}`);
  }

  const data: RoomDetails[] = await response.json();
  return data;
}

/**
 * Richiede al backend un token JWT di accesso LiveKit per una stanza.
 * `identity` è l'ID univoco del partecipante, `name` il nickname mostrato agli altri.
 */
export async function fetchToken(room: string, identity: string, name: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    room,
    identity,
    name,
  });

  const response = await fetch(`${API_BASE_URL}/token?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Errore durante il recupero del token per ${room}: ${response.status} ${response.statusText}`);
  }

  const data: TokenResponse = await response.json();
  return data;
}
