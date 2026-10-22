import React from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { LogOut, Radio, Headphones, ShieldAlert, Loader2 } from 'lucide-react';
import { TokenResponse } from '../types/livekit';

interface RoomStageProps {
  selectedRoom: string | null;
  connectionDetails: TokenResponse | null;
  isConnecting: boolean;
  error: string | null;
  onDisconnect: () => void;
}

export const RoomStage: React.FC<RoomStageProps> = ({
  selectedRoom,
  connectionDetails,
  isConnecting,
  error,
  onDisconnect,
}) => {
  // 1. Stato iniziale: Nessuna stanza selezionata
  if (!selectedRoom) {
    return (
      <main className="discord-stage empty-stage">
        <div className="welcome-container">
          <div className="welcome-icon-bubble">
            <Headphones size={48} />
          </div>
          <h2 className="welcome-title">Nessun canale selezionato</h2>
          <p className="welcome-subtitle">
            Seleziona una stanza dalla sidebar per entrare e visualizzare lo streaming audio/video.
          </p>
        </div>
      </main>
    );
  }

  // 2. Connessione in corso
  if (isConnecting) {
    return (
      <main className="discord-stage loading-stage">
        <div className="loading-container">
          <Loader2 size={44} className="spinning" />
          <h2 className="loading-title">Connessione a #{selectedRoom}...</h2>
          <p className="loading-subtitle">Richiesta token di autenticazione e inizializzazione WebRTC...</p>
        </div>
      </main>
    );
  }

  // 3. Errore di connessione
  if (error || !connectionDetails) {
    return (
      <main className="discord-stage error-stage">
        <div className="error-container">
          <ShieldAlert size={44} className="error-icon" />
          <h2 className="error-title">Impossibile connettersi alla stanza</h2>
          <p className="error-description">{error || 'Token o dettagli di connessione non disponibili.'}</p>
          <button className="stage-action-btn" onClick={onDisconnect}>
            Torna alla Lobby
          </button>
        </div>
      </main>
    );
  }

  // 4. Stanza attiva e connessa a LiveKit
  return (
    <main className="discord-stage active-stage">
      {/* Header Canale Attivo */}
      <header className="stage-header">
        <div className="stage-room-info">
          <Radio size={20} className="stage-header-icon" />
          <span className="stage-room-name">{selectedRoom}</span>
          <span className="stage-status-pill">In Chiamata</span>
        </div>

        <button
          className="disconnect-header-btn"
          onClick={onDisconnect}
          title="Disconnetti dalla stanza"
        >
          <LogOut size={16} />
          <span>Disconnetti</span>
        </button>
      </header>

      {/* Container LiveKit con componenti audio/video */}
      <div className="livekit-wrapper">
        <LiveKitRoom
          token={connectionDetails.token}
          serverUrl={connectionDetails.url}
          connect={true}
          video={false}
          audio={true}
          onDisconnected={onDisconnect}
          data-lk-theme="default"
          style={{ height: '100%', width: '100%' }}
        >
          {/* Layout videoconferenza completo con griglia video, speaker attivo e controlli */}
          <VideoConference />
          {/* Renderer audio globale per ascoltare i partecipanti remoti */}
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </main>
  );
};
