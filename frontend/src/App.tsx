import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoomStage } from './components/RoomStage';
import { RoomDetails, TokenResponse } from './types/livekit';
import { fetchRooms, fetchToken } from './services/api';

const STORAGE_KEY_IDENTITY = 'livekit_identity';

function getInitialIdentity(): string {
  const saved = localStorage.getItem(STORAGE_KEY_IDENTITY);
  if (saved && saved.trim().length > 0) {
    return saved.trim();
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generated = `WebUser-${randomSuffix}`;
  localStorage.setItem(STORAGE_KEY_IDENTITY, generated);
  return generated;
}

export function App() {
  const [identity, setIdentity] = useState<string>(getInitialIdentity);
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<TokenResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
      const tokenData = await fetchToken(roomName, identity);
      setConnectionDetails(tokenData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto durante la connessione.';
      setConnectionError(message);
    } finally {
      setIsConnecting(false);
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
  const handleUpdateIdentity = (newIdentity: string) => {
    const trimmed = newIdentity.trim();
    if (trimmed.length > 0) {
      setIdentity(trimmed);
      localStorage.setItem(STORAGE_KEY_IDENTITY, trimmed);
    }
  };

  return (
    <div className="discord-app-layout">
      <Sidebar
        rooms={rooms}
        isLoading={isLoadingRooms}
        selectedRoom={selectedRoom}
        identity={identity}
        onSelectRoom={handleSelectRoom}
        onRefresh={() => loadRooms(true)}
        onUpdateIdentity={handleUpdateIdentity}
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
