using System;
using System.Collections;
using LiveKit;
using LiveKit.Proto;
using UnityEngine;
using RoomOptions = LiveKit.RoomOptions;

//Host della lobby: crea la stanza tramite il backend, ci entra,
//pubblica schermo del gioco + microfono e riproduce l'audio dell'operatore dal browser.
public class LobbyHost : MonoBehaviour {

    [Header("Backend")]
    [SerializeField] private string backendUrl = "http://localhost:5250";

    [Header("Identità (vuoto = GUID generato all'avvio)")]
    [SerializeField] private string userId;
    [SerializeField] private string displayName;

    [SerializeField] private bool connectOnStart = true;

    private Room _room;
    private PlatformAudio _platformAudio;
    private PlatformAudioSource _micSource;
    private ScreenVideoSource _screenSource;

    private void Awake() {
        if (string.IsNullOrWhiteSpace(userId)) userId = Guid.NewGuid().ToString();
        if (string.IsNullOrWhiteSpace(displayName)) displayName = Guid.NewGuid().ToString();
    }

    private void Start() {
        if (connectOnStart) StartCoroutine(StartHosting());
    }

    public IEnumerator StartHosting() {
        if (_room != null) yield break;

        //1. Creazione lobby dal backend
        CreateLobbyResponse lobby = null;
        string error = null;
        yield return LobbyApiClient.CreateLobby(backendUrl, userId, displayName,
            response => lobby = response,
            message => error = message);

        if (lobby == null) {
            Debug.LogError($"[LobbyHost] Creazione lobby fallita: {error}");
            yield break;
        }
        Debug.Log($"[LobbyHost] Lobby creata: {lobby.roomName} ({displayName})");

        //2. Connessione a LiveKit: url e token arrivano dal backend, la stanza è dentro il token
        _room = new Room();
        _room.TrackSubscribed += OnTrackSubscribed;
        _room.Disconnected += OnDisconnected;

        var connect = _room.Connect(lobby.connection.url, lobby.connection.token, new RoomOptions());
        yield return connect;

        if (connect.IsError) {
            Debug.LogError($"[LobbyHost] Connessione a {lobby.connection.url} fallita");
            _room = null;
            yield break;
        }
        Debug.Log($"[LobbyHost] Connesso alla stanza {_room.Name}");

        //3. Microfono e 4. schermo
        yield return PublishMicrophone();
        yield return PublishScreen();
    }

    private IEnumerator PublishMicrophone() {
        //PlatformAudio usa l'audio nativo di WebRTC: cancellazione dell'eco
        //e riproduzione automatica delle tracce audio remote
        _platformAudio = new PlatformAudio();
        yield return _platformAudio.StartRecording();

        _micSource = new PlatformAudioSource(_platformAudio, new AudioProcessingOptions {
            EchoCancellation = true,
            NoiseSuppression = true,
            AutoGainControl = true
        });

        var track = LocalAudioTrack.CreateAudioTrack("host-mic", _micSource, _room);
        var publish = _room.LocalParticipant.PublishTrack(track, new TrackPublishOptions {
            Source = TrackSource.SourceMicrophone
        });
        yield return publish;

        if (publish.IsError) {
            Debug.LogError("[LobbyHost] Pubblicazione microfono fallita");
            yield break;
        }
        Debug.Log("[LobbyHost] Microfono pubblicato");
    }

    private IEnumerator PublishScreen() {
        _screenSource = new ScreenVideoSource();

        var track = LocalVideoTrack.CreateVideoTrack("host-screen", _screenSource, _room);
        //Il token host permette solo "microphone" e "screen_share": con SourceCamera verrebbe rifiutata
        var publish = _room.LocalParticipant.PublishTrack(track, new TrackPublishOptions {
            Source = TrackSource.SourceScreenshare,
            Simulcast = false
        });
        yield return publish;

        if (publish.IsError) {
            Debug.LogError("[LobbyHost] Pubblicazione schermo fallita");
            yield break;
        }

        _screenSource.Start();
        StartCoroutine(_screenSource.Update());
        Debug.Log($"[LobbyHost] Schermo pubblicato ({Screen.width}x{Screen.height})");
    }

    private void OnTrackSubscribed(IRemoteTrack track, RemoteTrackPublication publication, RemoteParticipant participant) {
        //L'audio remoto lo riproduce PlatformAudio in automatico: qui basta loggare
        Debug.Log($"[LobbyHost] Ricevuta traccia {publication.Kind} da {participant.Name} ({participant.Identity})");
    }

    private void OnDisconnected(Room room) {
        Debug.Log("[LobbyHost] Disconnesso dalla stanza");
    }

    private void OnDestroy() {
        _screenSource?.Stop();
        _screenSource?.Dispose();
        _room?.Disconnect();
        _micSource?.Dispose();
        _platformAudio?.Dispose();
    }
}
