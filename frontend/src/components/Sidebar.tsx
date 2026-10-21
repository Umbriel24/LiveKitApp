import React, { useState } from 'react';
import { RefreshCw, Users, Hash, Volume2, User, Edit3, Check, Radio } from 'lucide-react';
import { RoomDetails } from '../types/livekit';

interface SidebarProps {
  rooms: RoomDetails[];
  isLoading: boolean;
  selectedRoom: string | null;
  identity: string;
  onSelectRoom: (roomName: string) => void;
  onRefresh: () => void;
  onUpdateIdentity: (newIdentity: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  isLoading,
  selectedRoom,
  identity,
  onSelectRoom,
  onRefresh,
  onUpdateIdentity,
}) => {
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [inputIdentity, setInputIdentity] = useState(identity);

  const handleStartEdit = () => {
    setInputIdentity(identity);
    setIsEditingIdentity(true);
  };

  const handleSaveIdentity = () => {
    const trimmed = inputIdentity.trim();
    if (trimmed.length > 0) {
      onUpdateIdentity(trimmed);
    } else {
      setInputIdentity(identity);
    }
    setIsEditingIdentity(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveIdentity();
    } else if (e.key === 'Escape') {
      setInputIdentity(identity);
      setIsEditingIdentity(false);
    }
  };

  return (
    <aside className="discord-sidebar">
      {/* Header Lobby */}
      <div className="sidebar-header">
        <div className="header-title-container">
          <Radio size={20} className="header-icon" />
          <h1 className="header-title">LiveKit Lobby</h1>
        </div>
        <button
          className={`refresh-btn ${isLoading ? 'spinning' : ''}`}
          onClick={onRefresh}
          title="Aggiorna lista stanze"
          aria-label="Aggiorna lista stanze"
          disabled={isLoading}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Sezione Stanze / Canali */}
      <div className="channels-section">
        <div className="channels-header">
          <span className="channels-label">STANZE ATTIVE ({rooms.length})</span>
        </div>

        <div className="channels-list">
          {rooms.length === 0 ? (
            <div className="empty-rooms">
              <p className="empty-title">Nessuna stanza attiva al momento</p>
              <p className="empty-subtitle">
                Le stanze vengono create automaticamente quando un client Unity o server avvia lo streaming.
              </p>
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoom === room.name;
              return (
                <button
                  key={room.sid || room.name}
                  className={`channel-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectRoom(room.name)}
                >
                  <div className="channel-info">
                    {room.numParticipant > 0 ? (
                      <Volume2 size={18} className="channel-icon active-speaker" />
                    ) : (
                      <Hash size={18} className="channel-icon" />
                    )}
                    <span className="channel-name" title={room.name}>
                      {room.name}
                    </span>
                  </div>

                  <div className="participants-badge" title={`${room.numParticipant} partecipanti connessi`}>
                    <Users size={13} />
                    <span>{room.numParticipant}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Pannello Profilo Utente in fondo */}
      <div className="user-profile-panel">
        <div className="user-avatar">
          <User size={20} />
          <div className="online-status-dot" title="Online" />
        </div>

        <div className="user-details">
          {isEditingIdentity ? (
            <div className="identity-edit-form">
              <input
                type="text"
                className="identity-input"
                value={inputIdentity}
                autoFocus
                maxLength={32}
                onChange={(e) => setInputIdentity(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveIdentity}
              />
              <button
                className="save-identity-btn"
                onClick={handleSaveIdentity}
                title="Salva nickname"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="user-identity-display" onClick={handleStartEdit} title="Clicca per modificare il nickname">
              <span className="username">{identity}</span>
              <span className="user-tag">#web</span>
            </div>
          )}
        </div>

        {!isEditingIdentity && (
          <button
            className="edit-profile-btn"
            onClick={handleStartEdit}
            title="Modifica nickname"
            aria-label="Modifica nickname"
          >
            <Edit3 size={15} />
          </button>
        )}
      </div>
    </aside>
  );
};
