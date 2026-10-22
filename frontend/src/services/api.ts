import { CreateLobbyResponse, RoomDetails, TokenResponse } from '../types/livekit';

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

/**
 * Crea una lobby come host (lo stesso flusso che userà Unity): il backend crea la stanza
 * e restituisce un token con permesso di condividere lo schermo.
 */
export async function createLobby(userId: string, displayName: string): Promise<CreateLobbyResponse> {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ userId, displayName }),
  });

  if (!response.ok) {
    throw new Error(`Errore durante la creazione della lobby: ${response.status} ${response.statusText}`);
  }

  const data: CreateLobbyResponse = await response.json();
  return data;
}
