import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoomStage } from './components/RoomStage';
import { RoomDetails, TokenResponse } from './types/livekit';
import { createLobby, fetchRooms, fetchToken } from './services/api';

// Il nickname è salvato tra le sessioni (stessa chiave di prima, per non perdere quelli già scelti)
const STORAGE_KEY_DISPLAY_NAME = 'livekit_identity';

// Identity LiveKit: deve essere univoca nella stanza, altrimenti il partecipante precedente
// con la stessa identity viene espulso. Generata a ogni caricamento della pagina, quindi
// ogni tab ha la sua. crypto.randomUUID() esiste solo in contesti sicuri (HTTPS o localhost),
// per questo c'è il fallback su getRandomValues (es. accesso da un altro PC in LAN via http).
function generateParticipantId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const PARTICIPANT_ID = generateParticipantId();

function getInitialDisplayName(): string {
  const saved = localStorage.getItem(STORAGE_KEY_DISPLAY_NAME);
  if (saved && saved.trim().length > 0) {
    return saved.trim();
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generated = `WebUser-${randomSuffix}`;
  localStorage.setItem(STORAGE_KEY_DISPLAY_NAME, generated);
  return generated;
}

export function App() {
  const [displayName, setDisplayName] = useState<string>(getInitialDisplayName);
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<TokenResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCreatingLobby, setIsCreatingLobby] = useState<boolean>(false);

  // Caricamento stanze dal backend
  const loadRooms = useCallback(async (manual = false) => {
    if (manual) {
      setIsLoadingRooms(true);
    }
    try {
      const data = await fetchRooms();
      setRooms(data);
    } catch (err) {
      console.warn('Impossibile recuperare l\'elenco delle stanze:', err);
    } finally {
      if (manual) {
        setIsLoadingRooms(false);
      }
    }
  }, []);

  // Polling automatico ogni 5 secondi
  useEffect(() => {
    loadRooms(true);
    const intervalId = window.setInterval(() => {
      loadRooms(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadRooms]);

  // Gestione selezione stanza
  const handleSelectRoom = async (roomName: string) => {
    if (selectedRoom === roomName && connectionDetails) {
      // Già connesso a questa stanza
      return;
    }

    setSelectedRoom(roomName);
    setIsConnecting(true);
    setConnectionError(null);
    setConnectionDetails(null);

    try {
      const tokenData = await fetchToken(roomName, PARTICIPANT_ID, displayName);
      setConnectionDetails(tokenData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto durante la connessione.';
      setConnectionError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Creazione lobby come host (stesso flusso di Unity): il token restituito permette lo screen share
  const handleCreateLobby = async () => {
    setIsCreatingLobby(true);
    setConnectionError(null);
    setConnectionDetails(null);

    try {
      const lobby = await createLobby(PARTICIPANT_ID, displayName);
      setSelectedRoom(lobby.roomName);
      setConnectionDetails(lobby.connection);
      loadRooms(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto durante la creazione della lobby.';
      setSelectedRoom('nuova lobby');
      setConnectionError(message);
    } finally {
      setIsCreatingLobby(false);
    }
  };

  // Disconnessione
  const handleDisconnect = () => {
    setSelectedRoom(null);
    setConnectionDetails(null);
    setConnectionError(null);
    setIsConnecting(false);
    // Rinfresca subito le stanze
    loadRooms(false);
  };

  // Aggiornamento nickname
  const handleUpdateIdentity = (newDisplayName: string) => {
    const trimmed = newDisplayName.trim();
    if (trimmed.length > 0) {
      setDisplayName(trimmed);
      localStorage.setItem(STORAGE_KEY_DISPLAY_NAME, trimmed);
    }
  };

  return (
    <div className="discord-app-layout">
      <Sidebar
        rooms={rooms}
        isLoading={isLoadingRooms}
        selectedRoom={selectedRoom}
        identity={displayName}
        onSelectRoom={handleSelectRoom}
        onRefresh={() => loadRooms(true)}
        onUpdateIdentity={handleUpdateIdentity}
        onCreateLobby={handleCreateLobby}
        isCreatingLobby={isCreatingLobby}
      />
      <RoomStage
        selectedRoom={selectedRoom}
        connectionDetails={connectionDetails}
        isConnecting={isConnecting}
        error={connectionError}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}

export default App;
